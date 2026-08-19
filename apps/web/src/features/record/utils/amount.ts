export const sanitizeAmount = (value: string) => value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

export const formatAmount = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
