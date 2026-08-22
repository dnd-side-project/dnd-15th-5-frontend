import { defineConfig } from 'orval';

import { createFeatureOpenApiTransformer } from './openapiTransformer.js';

import type { Options } from 'orval';

const OPENAPI_SPEC_URL = 'https://chapchap.kr/api/v3/api-docs';

const FEATURE_API_CONFIG = {
  auth: {
    tags: ['Authentication', 'Social OAuth'],
    operationIds: [
      'refreshApp',
      'refreshWeb',
      'exchangeSocialLoginCode',
      'agree',
      'logoutApp',
      'logoutWeb',
      'start',
      'callback',
    ],
  },
  map: {
    tags: ['Consumption', 'Recommendation'],
    operationIds: ['getVisitedPlaceMarkers', 'getNearbyPlaces'],
  },
  myPage: {
    directory: 'my-page',
    tags: ['Account'],
    operationIds: ['getMyAccount', 'updateMyAccount', 'withdrawMyAccount'],
  },
  record: {
    tags: ['Consumption'],
    operationIds: ['createConsumption', 'recognizeReceipt'],
  },
  report: {
    tags: ['Consumption', 'Report'],
    operationIds: ['getMonthlyReport', 'getCurrentStatus', 'getConsumptions', 'getFrequentPlaces'],
  },
  shop: {
    tags: ['Consumption', 'Place'],
    operationIds: ['getPlaceDetail', 'getPlaceVisits', 'toggleLike'],
  },
} as const;

type FeatureApiOptions = {
  directory?: string;
  operationIds: readonly string[];
  tags: readonly string[];
};

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
