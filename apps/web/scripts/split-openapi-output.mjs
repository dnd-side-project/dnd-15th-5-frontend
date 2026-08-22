import { readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import prettier from 'prettier';
import ts from 'typescript';

const featureDirectory = process.argv[2];

if (!featureDirectory) {
  throw new Error('feature directory argument is required');
}

const apiDirectory = path.resolve('src/features', featureDirectory, 'apis');
const sourcePath = path.join(apiDirectory, 'swagger.ts');
const source = await readFile(sourcePath, 'utf8');
const sourceFile = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true);
const prettierConfig = (await prettier.resolveConfig(sourcePath)) ?? {};

const groups = {
  clients: [],
  queryKeys: [],
  queries: [],
  mutations: [],
  dto: [],
};

const declarationNames = {
  clients: new Set(),
  queryKeys: new Set(),
  queries: new Set(),
  mutations: new Set(),
  dto: new Set(),
};

const imports = sourceFile.statements.filter(ts.isImportDeclaration);

const getDeclarationNames = (statement) => {
  if (
    ts.isTypeAliasDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isEnumDeclaration(statement) ||
    ts.isFunctionDeclaration(statement)
  ) {
    return statement.name ? [statement.name.text] : [];
  }

  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap((declaration) =>
      ts.isIdentifier(declaration.name) ? [declaration.name.text] : []
    );
  }

  return [];
};

const dtoTypeNames = new Set(
  sourceFile.statements
    .filter(
      (statement) =>
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isEnumDeclaration(statement)
    )
    .filter((statement) => {
      const names = getDeclarationNames(statement);
      return !names.some((name) => /(?:Query|Mutation)(?:Result|Body|Error)$/.test(name));
    })
    .flatMap(getDeclarationNames)
);

const classifyStatement = (statement) => {
  const names = getDeclarationNames(statement);
  const text = statement.getText(sourceFile);

  if (names.some((name) => /^get.*QueryKey$/.test(name))) {
    return 'queryKeys';
  }

  if (
    ts.isTypeAliasDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isEnumDeclaration(statement)
  ) {
    if (names.some((name) => /Mutation(?:Result|Body|Error)$/.test(name))) {
      return 'mutations';
    }

    if (names.some((name) => /Query(?:Result|Error)$/.test(name))) {
      return 'queries';
    }

    return 'dto';
  }

  if (names.some((name) => dtoTypeNames.has(name))) {
    return 'dto';
  }

  if (names.some((name) => /Mutation/.test(name))) {
    return 'mutations';
  }

  if (names.some((name) => /Query/.test(name))) {
    return 'queries';
  }

  if (/\b(?:useMutation|MutationFunction|MutationOptions|MutationResult)\b/.test(text)) {
    return 'mutations';
  }

  if (
    /\b(?:useQuery|useSuspenseQuery|QueryFunction|QueryOptions|QueryResult|QueryKey|DataTag)\b/.test(
      text
    )
  ) {
    return 'queries';
  }

  return 'clients';
};

const ensureExported = (statement) => {
  const text = statement.getFullText(sourceFile).trim();
  const isExported = statement.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
  );

  if (getDeclarationNames(statement).length > 0 && !isExported) {
    return `export ${text}`;
  }

  return text;
};

for (const statement of sourceFile.statements) {
  if (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) {
    continue;
  }

  const group = classifyStatement(statement);
  groups[group].push(ensureExported(statement));

  for (const name of getDeclarationNames(statement)) {
    declarationNames[group].add(name);
  }
}

const usesIdentifier = (sourceText, identifier) => {
  return new RegExp(`\\b${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(sourceText);
};

const buildFilteredImport = (declaration, body) => {
  const originalModuleName = declaration.moduleSpecifier.text;
  const moduleName = originalModuleName.includes('shared/apis/orvalMutator')
    ? "'@/shared/apis/orvalMutator'"
    : declaration.moduleSpecifier.getText(sourceFile);
  const clause = declaration.importClause;

  if (!clause) {
    return declaration.getText(sourceFile);
  }

  const defaultImport = clause.name?.text;
  const namedBindings = clause.namedBindings;
  const parts = [];

  if (defaultImport && usesIdentifier(body, defaultImport)) {
    parts.push(defaultImport);
  }

  if (namedBindings && ts.isNamedImports(namedBindings)) {
    const usedElements = namedBindings.elements.filter((element) =>
      usesIdentifier(body, element.name.text)
    );

    if (usedElements.length > 0) {
      const elements = usedElements
        .map((element) => {
          const importedName = element.propertyName?.text;
          const localName = element.name.text;
          const typePrefix = element.isTypeOnly ? 'type ' : '';

          return `${typePrefix}${importedName ? `${importedName} as ` : ''}${localName}`;
        })
        .join(', ');
      parts.push(`{ ${elements} }`);
    }
  }

  if (namedBindings && ts.isNamespaceImport(namedBindings)) {
    const namespaceName = namedBindings.name.text;

    if (usesIdentifier(body, namespaceName)) {
      parts.push(`* as ${namespaceName}`);
    }
  }

  if (parts.length === 0) {
    return null;
  }

  return `import ${clause.isTypeOnly ? 'type ' : ''}${parts.join(', ')} from ${moduleName};`;
};

const buildCrossImports = (group, body) => {
  const crossImports = [];

  if (group !== 'dto') {
    const usedDtoNames = [...declarationNames.dto].filter((name) => usesIdentifier(body, name));

    if (usedDtoNames.length > 0) {
      crossImports.push(
        `import type { ${usedDtoNames.sort().join(', ')} } from '@/features/${featureDirectory}/apis/dto';`
      );
    }
  }

  if (group === 'queries' || group === 'mutations') {
    const usedClientNames = [...declarationNames.clients].filter((name) =>
      usesIdentifier(body, name)
    );

    if (usedClientNames.length > 0) {
      crossImports.push(
        `import { ${usedClientNames.sort().join(', ')} } from '@/features/${featureDirectory}/apis/clients';`
      );
    }
  }

  if (group === 'queries') {
    const usedQueryKeyNames = [...declarationNames.queryKeys].filter((name) =>
      usesIdentifier(body, name)
    );

    if (usedQueryKeyNames.length > 0) {
      crossImports.push(
        `import { ${usedQueryKeyNames.sort().join(', ')} } from '@/features/${featureDirectory}/apis/queryKeys';`
      );
    }
  }

  return crossImports;
};

const header = `/**
 * Generated by Orval and split by scripts/split-openapi-output.mjs.
 * Do not edit manually.
 */`;

for (const [group, statements] of Object.entries(groups)) {
  const body = statements.join('\n\n');
  const externalImports = imports
    .map((declaration) => buildFilteredImport(declaration, body))
    .filter(Boolean);
  const crossImports = buildCrossImports(group, body);
  const moduleBody = body || 'export {};';
  const output = [header, ...externalImports, ...crossImports, moduleBody].join('\n\n');
  const formatted = await prettier.format(output, { ...prettierConfig, parser: 'typescript' });

  await writeFile(path.join(apiDirectory, `${group}.ts`), formatted);
}

await unlink(sourcePath);
