import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  first_name: string
  last_name: string;
  typeDocument: string;
  numberDocument: string;
  country: string;
  email: string;
  biometricEnabled: boolean;
  createdAt: Timestamp;
  fcmToken?: string; 
}
