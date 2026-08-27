import { defineTransformer } from 'orval';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'] as const;

type MutableRecord = Record<string, unknown>;

const REQUIRED_REQUEST_BODY_OPERATION_IDS = new Set(['recognizeReceipt']);

const isRecord = (value: unknown): value is MutableRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const repairNullableReferences = (value: unknown): void => {
  if (Array.isArray(value)) {
    value.forEach(repairNullableReferences);
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  if (value.type === 'null' && typeof value.$ref === 'string') {
    const reference = value.$ref;
    delete value.type;
    delete value.$ref;
    value.oneOf = [{ $ref: reference }, { type: 'null' }];
  }

  Object.values(value).forEach(repairNullableReferences);
};

const repairResponseHeaders = (paths: MutableRecord) => {
  for (const pathItem of Object.values(paths)) {
    if (!isRecord(pathItem)) {
      continue;
    }

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];

      if (!isRecord(operation) || !isRecord(operation.responses)) {
        continue;
      }

      for (const response of Object.values(operation.responses)) {
        if (!isRecord(response) || !isRecord(response.headers)) {
          continue;
        }

        for (const header of Object.values(response.headers)) {
          if (!isRecord(header) || '$ref' in header) {
            continue;
          }

          delete header.style;

          if (!isRecord(header.schema) && !isRecord(header.content)) {
            header.schema = { type: 'string' };
          }
        }
      }
    }
  }
};

const requireRequestBodies = (paths: MutableRecord) => {
  for (const pathItem of Object.values(paths)) {
    if (!isRecord(pathItem)) {
      continue;
    }

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];

      if (
        !isRecord(operation) ||
        typeof operation.operationId !== 'string' ||
        !REQUIRED_REQUEST_BODY_OPERATION_IDS.has(operation.operationId)
      ) {
        continue;
      }

      if (!isRecord(operation.requestBody)) {
        throw new Error(
          `필수 요청 본문을 보정할 수 없습니다: ${operation.operationId}의 requestBody가 없습니다.`
        );
      }

      operation.requestBody.required = true;
    }
  }
};

const filterOperations = (paths: MutableRecord, includedOperationIds: ReadonlySet<string>) => {
  const foundOperationIds = new Set<string>();

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!isRecord(pathItem)) {
      continue;
    }

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];

      if (!isRecord(operation)) {
        continue;
      }

      const operationId = operation.operationId;

      if (typeof operationId === 'string' && includedOperationIds.has(operationId)) {
        foundOperationIds.add(operationId);
        continue;
      }

      delete pathItem[method];
    }

    const hasOperation = HTTP_METHODS.some((method) => isRecord(pathItem[method]));

    if (!hasOperation) {
      delete paths[path];
    }
  }

  const missingOperationIds = [...includedOperationIds].filter(
    (operationId) => !foundOperationIds.has(operationId)
  );

  if (missingOperationIds.length > 0) {
    throw new Error(
      `OpenAPI 명세에서 operationId를 찾을 수 없습니다: ${missingOperationIds.join(', ')}`
    );
  }
};

/**
 * feature가 소유한 operation만 남기고 SpringDoc 명세의 누락되거나 잘못된 속성을 보정한다.
 */
export const createFeatureOpenApiTransformer = (operationIds: readonly string[]) => {
  const includedOperationIds = new Set(operationIds);

  return defineTransformer((document) => {
    const mutableDocument = document as MutableRecord;
    repairNullableReferences(mutableDocument);
    const paths = mutableDocument.paths;

    if (!isRecord(paths)) {
      return document;
    }

    repairResponseHeaders(paths);
    requireRequestBodies(paths);
    filterOperations(paths, includedOperationIds);

    return document;
  });
};
