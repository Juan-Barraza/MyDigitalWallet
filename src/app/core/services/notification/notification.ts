import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { FirestoreService } from '../firestore/firestore';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalNotifications } from '@capacitor/local-notifications';


@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private fcmToken: string | null = null;

  constructor(
    private http: HttpClient,
    private firestoreService: FirestoreService,
  ) { }


  async requestPermission(uid: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      console.warn('The user granted permission to receive push notifications');
      return;
    };

    console.log(JSON.stringify('Permission granted for push notifications'));
    PushNotifications.addListener('registration', async (token: Token) => {
      this.fcmToken = token.value;
      console.log('Token FCM:', JSON.stringify(this.fcmToken));
      await this.firestoreService.updateDocument('users', uid!, { fcmToken: this.fcmToken }); // save token to Firestore to validate it on the server
    });
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Registration error:', error);
    });

     PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      await LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Math.random() * 100000),
          title: notification.title ?? 'MyDigitalWallet',
          body: notification.body ?? '',
          smallIcon: 'res://drawable/ic_notification',
          extra: notification.data,
        }]
      });
    });

    await PushNotifications.register();
  }


  async sendNotification(
    fcmToken: string,
    merchant: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<void> {
    try {
      console.log('Token FCM:', JSON.stringify(fcmToken));

      await firstValueFrom(
        this.http.post(`${environment.RAILWAY_URL}/notifications`, {
          token: fcmToken,
          notification: {
            title: 'Payment Successful',
            body: `You paid ${currency} ${amount.toFixed(2)} at ${merchant}`,
          },
          android: {
            priority: 'high',
            data: {
              merchant,
              amount: (amount ?? 0).toString(),
              currency
            },
          },
        })
      );
    } catch (error) {
      console.error('Error sending notification:', JSON.stringify(error));
    }

  }


  getFcmToken(): string | null {
    return this.fcmToken;
  }
}
