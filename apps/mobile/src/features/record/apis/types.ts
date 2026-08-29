export type GooglePlaceSearchResultResponse = {
  googlePlaceId?: string;
  placeName?: string;
  roadAddress?: string;
  latitude?: number;
  longitude?: number;
  thumbnailUrl?: string | null;
};

export type ReceiptOcrResponse = {
  receiptImageId?: number;
  storeName?: string | null;
  address?: string | null;
  purchaseDate?: string | null;
  purchaseTime?: string | null;
  amount?: number | null;
  googlePlaceSearchResult?: GooglePlaceSearchResultResponse | null;
};

export type ConsumptionCreateRequest = {
  receiptImageId?: number | null;
  googlePlaceId: string;
  placeName: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  purchaseDate: string;
  purchaseTime: string;
  amount: number;
  category: string;
};

export type ConsumptionCreateResponse = {
  consumptionId?: number;
  stickerCategory?: string;
  stickerName?: string;
};
