import { readFileSync } from 'node:fs';

import { defineConfig } from 'orval';

import { createFeatureOpenApiTransformer } from './openapiTransformer.js';

import type { Options } from 'orval';

type FeatureApiOptions = {
  directory?: string;
  operationIds: readonly string[];
  tags: readonly string[];
};

type OpenApiFeatureMap = {
  specUrl: string;
  features: Record<string, FeatureApiOptions>;
};

const { specUrl: OPENAPI_SPEC_URL, features: FEATURE_API_CONFIG } = JSON.parse(
  readFileSync(new URL('./openapiFeatureMap.json', import.meta.url), 'utf8')
) as OpenApiFeatureMap;

const createFeatureApiConfig = (feature: string, options: FeatureApiOptions): Options => {
  const directory = options.directory ?? feature;

  return {
    input: {
      target: OPENAPI_SPEC_URL,
      filters: {
        tags: [...options.tags],
      },
      override: {
        transformer: createFeatureOpenApiTransformer(options.operationIds),
      },
    },
    output: {
      mode: 'single' as const,
      target: `./src/features/${directory}/apis/swagger.ts`,
      client: 'react-query' as const,
      httpClient: 'axios' as const,
      formatter: 'prettier' as const,
      override: {
        useTypeOverInterfaces: true,
        operationName: (operation, _route, verb) => {
          if (operation.operationId === 'callback') {
            return 'completeSocialOAuth';
          }

          return operation.operationId ?? `${verb}Operation`;
        },
        mutator: {
          path: './src/shared/apis/orvalMutator.ts',
          name: 'apiClient',
        },
        query: {
          useSuspenseQuery: true,
          signal: true,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: `node ./scripts/split-openapi-output.mjs ${directory}`,
    },
  };
};

export default defineConfig(
  Object.fromEntries(
    Object.entries(FEATURE_API_CONFIG).map(([feature, options]) => [
      `${feature}Api`,
      createFeatureApiConfig(feature, options),
    ])
  )
);
