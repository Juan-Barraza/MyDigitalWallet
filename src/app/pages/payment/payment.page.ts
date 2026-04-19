import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PaymentService, PaymentSimulation } from 'src/app/core/services/payment/payment';
import { NotificationService } from 'src/app/core/services/notification/notification';
import { AuthService } from 'src/app/core/services/auth/auth';
import { CardService } from 'src/app/core/services/cardservice/cardservice';
import { ToastService } from 'src/app/core/services/toast/toast';
import { Card } from 'src/app/core/models/card.model';
import { firstValueFrom } from 'rxjs';
import { Transaction } from 'src/app/core/models/transaction.model';
import { Userservice } from 'src/app/core/services/userservice/userservice';
import { UserProfile } from 'src/app/core/models/user.model';

type PageState = 'idle' | 'processing' | 'success' | 'failed';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false,
})
export class PaymentPage implements OnInit {
  simulation!: PaymentSimulation;
  activeCard: Card | null = null;
  userProfile: UserProfile | null = null;
  state: PageState = 'idle';
  lastTransaction: Transaction | null = null;

  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private userService: Userservice,
    private cardService: CardService,
    private toastService: ToastService,
    private navCtrl: NavController,
  ) {}

  async ngOnInit() {
    this.simulation = this.paymentService.generateSimulation();

    this.userProfile = await firstValueFrom(this.userService.userProfile$);

    const uid = this.authService.getCurrentUser()?.uid;
    if (uid) {
      const cards = await firstValueFrom(this.cardService.getUserCards(uid));
      this.activeCard = (cards as Card[]).find(c => c.isDefault)
        || (cards as Card[])[0]
        || null;
    }
  }

  async confirmPayment() {
    if (!this.activeCard || !this.userProfile) {
      this.toastService.showError('No card available');
      return;
    }

    const verified = await this.paymentService.verifyIdentityIfRequired(
      this.userProfile.biometricEnabled
    );
    if (!verified) {
      this.toastService.showError('Identity verification failed');
      return;
    }
    this.state = 'processing';
    try {
      const uid = this.authService.getCurrentUser()!.uid;
      this.lastTransaction = await this.paymentService.processPayment(
        this.simulation,
        this.activeCard,
        uid,
      );

      this.state = 'success';

      const profile = await firstValueFrom(this.userService.userProfile$) as any;
      if (profile?.fcmToken) {
        await this.notificationService.sendNotification(
          profile.fcmToken,
          this.simulation.merchant,
          this.simulation.amount,
          this.simulation.currency,
        );
      }

    } catch (error) {
      console.error(error);
      this.state = 'failed';
    }
  }

  newPayment() {
    this.simulation = this.paymentService.generateSimulation();
    this.state = 'idle';
    this.lastTransaction = null;
  }

  goBack() {
    this.navCtrl.back();
  }
}
