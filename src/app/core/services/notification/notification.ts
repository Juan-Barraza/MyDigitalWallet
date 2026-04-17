import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { FirestoreService } from '../firestore/firestore';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { AuthService } from '../auth/auth';


@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private fcmToken: string | null = null;
  private railwayJWT: string | null = null;

  constructor(
    private http: HttpClient,
    private firestoreService: FirestoreService,
    // private authService: AuthService,
  ) { }


  async requestPermission(uid: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      console.warn('The user granted permission to receive push notifications');
      return;
    };

    console.log(JSON.stringify('Permission granted for push notifications'));
    console.log(JSON.stringify('User ID for token registration: ' + uid));
    PushNotifications.addListener('registration', async (token: Token) => {
      this.fcmToken = token.value;
      console.log('Token FCM:', JSON.stringify(this.fcmToken));
      await this.firestoreService.updateDocument('users', uid!, { fcmToken: this.fcmToken }); // save token to Firestore to validate it on the server
    });
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Registration error:', error);
      console.error('Registration error:', JSON.stringify(error));
      alert('FCM Error: ' + JSON.stringify(error));
    });

    await PushNotifications.register();
  }

  private async getRailwayJWT(): Promise<string> {
    if (this.railwayJWT) return this.railwayJWT;

    const response = await firstValueFrom(
      this.http.post<{ data: { access_token: string } }>(`${environment.RAILWAY_URL}/user/login`, {
        email: environment.RAILWAY_EMAIL,
        password: environment.RAILWAY_PASSWORD,
      })
    );

    this.railwayJWT = response.data.access_token;
    return this.railwayJWT;
  }

  async sendNotification(
    fcmToken: string,
    merchant: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<void> {
    try {
      const jwt = await this.getRailwayJWT();
      const headers = new HttpHeaders({ Authorization: jwt });
      console.log('Token JWT:', JSON.stringify(jwt));
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
        }, { headers })
      );
    } catch (error) {
      console.error('Error sending notification:', JSON.stringify(error));
    }

  }


  getFcmToken(): string | null {
    return this.fcmToken;
  }
}
