import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { limit, Timestamp } from 'firebase/firestore';
import { FirestoreService } from '../firestore/firestore';
import { BiometricService } from '../biometric/biometric';
import { Transaction } from '../../models/transaction.model';
import { Card } from '../../models/card.model';
import { orderBy, where } from '@angular/fire/firestore';


export interface PaymentSimulation {
  merchant: string;
  merchantCategory: string;
  amount: number;
  currency: string;
}


@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(
    private firestoreService: FirestoreService,
    private biometricService: BiometricService,
  ) { }



  generateSimulation(): PaymentSimulation {
    const categories = [
      { name: 'Restaurant', emoji: '🍽️' },
      { name: 'Shopping', emoji: '🛍️' },
      { name: 'Transport', emoji: '🚗' },
      { name: 'Entertainment', emoji: '🎬' },
      { name: 'Health', emoji: '💊' },
      { name: 'Travel', emoji: '✈️' },
    ];

    const category = faker.helpers.arrayElement(categories);

    return {
      merchant: faker.company.name(),
      merchantCategory: `${category.emoji} ${category.name}`,
      amount: parseFloat(faker.finance.amount({ min: 5, max: 500, dec: 2 })),
      currency: 'USD',
    };
  }


  async verifyIdentityIfRequired(biometricEnabled: boolean): Promise<boolean> {
    if (!biometricEnabled) return true;

    return await this.biometricService.verifyIdentity(
      'Verify your identity to complete payment'
    );
  }


  async processPayment(
    simulation: PaymentSimulation,
    card: Card,
    uid: string,
  ): Promise<Transaction> {
    const transaction: Transaction = {
      uid,
      cardId: card.id!,
      cardLastFour: card.cardNumber,   
      cardBrand: card.brand,
      merchant: simulation.merchant,
      merchantCategory: simulation.merchantCategory,
      amount: simulation.amount,
      currency: simulation.currency,
      status: 'success',
      date: Timestamp.now(),
    };

    const txId = `tx_${uid}_${Date.now()}`;
    await this.firestoreService.setDocument('transactions', txId, {
      ...transaction,
      id: txId,
    });

    transaction.id = txId;
    return transaction;
  }

  getTransactionsByCard(cardId: string) {
    return this.firestoreService.getCollection('transactions', 'cardId', cardId);
  }

  getTransactionsByUser(uid: string) {
    return this.firestoreService.getCollection('transactions', 'uid', uid);
  }


  async getResentTransactions(uid: string, limitCount: number = 4, cardId?: string): Promise<Transaction[]> {
    const constraints = [
      where('uid', '==', uid),
      where('cardId', '==', cardId || ''),
      orderBy('date', 'desc'),
      limit(limitCount),
    ];

    return this.firestoreService.queryCollection<Transaction>('transactions', ...constraints);
  }


  async updateEmoji(transactionId: string, emoji: string): Promise<void> {
    await this.firestoreService.updateDocument('transactions', transactionId, { emoji });
  }
}
