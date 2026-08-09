export const SHOP_QUERY_KEYS = {
  all: ['shop'] as const,
  search: (keyword: string) => [...SHOP_QUERY_KEYS.all, 'search', keyword] as const,
};
