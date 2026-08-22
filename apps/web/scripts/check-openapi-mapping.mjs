import { readFile } from 'node:fs/promises';
import path from 'node:path';

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

const configPath = new URL('../openapiFeatureMap.json', import.meta.url);
const config = JSON.parse(await readFile(configPath, 'utf8'));
const specSource = process.argv[2] ?? config.specUrl;

const loadOpenApiDocument = async (source) => {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`OpenAPI 명세 요청 실패: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  return JSON.parse(await readFile(path.resolve(source), 'utf8'));
};

const document = await loadOpenApiDocument(specSource);
const operationLocations = new Map();
const operationsWithoutId = [];

for (const [route, pathItem] of Object.entries(document.paths ?? {})) {
  if (!pathItem || typeof pathItem !== 'object') {
    continue;
  }

  for (const [method, operation] of Object.entries(pathItem)) {
    if (!HTTP_METHODS.has(method) || !operation || typeof operation !== 'object') {
      continue;
    }

    const location = `${method.toUpperCase()} ${route}`;
    const operationId = operation.operationId;

    if (typeof operationId !== 'string' || operationId.length === 0) {
      operationsWithoutId.push(location);
      continue;
    }

    const locations = operationLocations.get(operationId) ?? [];
    locations.push(location);
    operationLocations.set(operationId, locations);
  }
}

const mappedFeatures = new Map();

for (const [feature, options] of Object.entries(config.features ?? {})) {
  for (const operationId of options.operationIds ?? []) {
    const features = mappedFeatures.get(operationId) ?? [];
    features.push(feature);
    mappedFeatures.set(operationId, features);
  }
}

const duplicateSpecOperationIds = [...operationLocations]
  .filter(([, locations]) => locations.length > 1)
  .map(([operationId, locations]) => `${operationId}: ${locations.join(', ')}`);
const duplicateMappings = [...mappedFeatures]
  .filter(([, features]) => features.length > 1)
  .map(([operationId, features]) => `${operationId}: ${features.join(', ')}`);
const unmappedOperationIds = [...operationLocations.keys()].filter(
  (operationId) => !mappedFeatures.has(operationId)
);
const staleMappings = [...mappedFeatures.keys()].filter(
  (operationId) => !operationLocations.has(operationId)
);

const failures = [
  ['operationId가 없는 엔드포인트', operationsWithoutId],
  ['Swagger에서 중복된 operationId', duplicateSpecOperationIds],
  ['여러 feature에 중복 매핑된 operationId', duplicateMappings],
  ['feature에 매핑되지 않은 operationId', unmappedOperationIds],
  ['Swagger에 존재하지 않는 operationId 매핑', staleMappings],
].filter(([, values]) => values.length > 0);

if (failures.length > 0) {
  const details = failures
    .map(([title, values]) => `${title}:\n${values.map((value) => `  - ${value}`).join('\n')}`)
    .join('\n\n');

  throw new Error(
    `OpenAPI feature 매핑 검증에 실패했습니다. openapiFeatureMap.json을 확인하세요.\n\n${details}`
  );
}

process.stdout.write(
  `OpenAPI operationId ${operationLocations.size}개가 ${Object.keys(config.features).length}개 feature에 모두 매핑되었습니다.\n`
);
