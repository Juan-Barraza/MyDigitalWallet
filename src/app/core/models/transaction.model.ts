import { Timestamp } from 'firebase/firestore';

export type TransactionStatus = 'success' | 'failed' | 'pending';

export interface Transaction {
  id?: string;
  uid: string;
  cardId: string;
  cardLastFour: string;
  cardBrand: string;
  merchant: string;
  merchantCategory: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  emoji?: string;
  date: Timestamp;
}