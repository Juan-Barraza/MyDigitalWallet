import { Timestamp } from 'firebase/firestore';

export type CardBrand = 'visa' | 'mastercard' | 'unknown';

export interface Card {
  id?: string;
  uid: string;
  cardholderName: string;
  cardNumber: string;       // Guardamos solo últimos 4 dígitos
  expiryDate: string;       // MM/YY
  brand: CardBrand;
  isDefault: boolean;
  createdAt: Timestamp;
}
