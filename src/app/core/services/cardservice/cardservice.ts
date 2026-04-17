import { Injectable } from '@angular/core';
import { FirestoreService } from '../firestore/firestore';
import { AuthService } from '../auth/auth';
import { Card, CardBrand } from '../../models/card.model';
import { Timestamp } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardService {

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) { }


  luhnAlgorithmCheck(cardNumer: string): boolean {
    cardNumer.replace(/\s/g, ''); // clean spaces
    if (!/^\d+$/.test(cardNumer)) return false; // virification if just numbers with regular expression

    let sum = 0;
    let doubleDigit = false;
    for (let i = cardNumer.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumer[i], 10);

      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      doubleDigit = !doubleDigit;

      sum += digit;
    }

    return sum % 10 === 0;
  }

  detectedBrand(cardNumber: string): CardBrand {
    const digits = cardNumber.replace(/\s/g, ''); // clean spaces

    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits)) return 'mastercard';
    const prefix4 = parseInt(digits.substring(0, 4), 10);
    if (prefix4 >= 2221 && prefix4 <= 2720) return 'mastercard';

    return 'unknown';
  }


  formCardNumber(value: string): string {
    const digits = value.replace(/\D/g, ''); // clean non-digit characters
    return digits.replace(/(.{4})/g, '$1 ').trim(); // insert space every 4 digits in 4 spaces and trim any trailing space
  }

  formExpiryDate(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 3) {
      return `${digits.substring(0, 2)}/${digits.substring(2)}`; // insert slash after the first 2 digits
    }
    return digits;
  }

  isExpiryDateValid(expiry: string): boolean {
    const [month, year] = expiry.split('/');
    if (!month || !year) return false;

    const m = parseInt(month, 10);
    const y = parseInt(`20${year}`, 10); // assuming year is in YY format

    if (m < 1 || m > 12) return false;
    const now = new Date();
    const expiryDate = new Date(y, m - 1, 1);
    return expiryDate >= new Date(now.getFullYear(), now.getMonth(), 1); // compare with the first day of the current month
  }


  async addCard(formData: {
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
  }): Promise<void> {
    const uid = this.authService.getCurrentUser()?.uid;
    if (!uid) throw new Error('User not authenticated');

    const rawnumber = formData.cardNumber.replace(/\s/g, ''); // clean spaces
    if (!this.luhnAlgorithmCheck(rawnumber)) throw new Error('Invalid card number');
    if (!this.isExpiryDateValid(formData.expiryDate)) throw new Error('Card expired');

    const brand = this.detectedBrand(rawnumber);
    if (brand === 'unknown') throw new Error('Only Visa and Mastercard are supported');
    const existingCards = await this.getUserCards(uid);
    const existingCardsArray = await firstValueFrom(existingCards);
    const isFirstCard = existingCardsArray.length === 0; // check if it's the first card to set it as default

    const card: Card = {
      uid,
      cardholderName: formData.cardholderName.toUpperCase(),
      cardNumber: rawnumber.slice(-4), // store only last 4 digits
      expiryDate: formData.expiryDate,
      brand,
      isDefault: isFirstCard,
      createdAt: Timestamp.now(),
    }

    const cardId = `${uid}_${Date.now()}`; // unique card ID
    await this.firestoreService.setDocument('cards', cardId, card);

  }


  getUserCards(uid: string) {
    return this.firestoreService.getCollection('cards', 'uid', uid);
  }

  async getCardById(uid: string): Promise<Card | null> {
    const data = await this.firestoreService.getDocument('cards', uid);
    if (!data) {
      return null;
    }
    return data as Card;
  }

  async setDefaultCard(uid: string, cardId: string): Promise<void> {
    const cards$ = await this.getUserCards(uid); // is a observable of cards
    const cards = await firstValueFrom(cards$); // convert observable to array of cards
    const updates = cards.map(card => {
      const isTarget = card.id === cardId;
      return this.firestoreService.updateDocument('cards', card.id!,
        { isDefault: isTarget });
    });

    await Promise.all(updates);
  }


  async updateCard(cardId: string, data: Partial<Card>): Promise<void> {
    return this.firestoreService.updateDocument('cards', cardId, data);
  }

  async deleteCard(cardId: string): Promise<void> {
    return this.firestoreService.delteDocument('cards', cardId);
  }
  
}
