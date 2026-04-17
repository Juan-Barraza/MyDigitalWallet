import { AuthService } from './../../core/services/auth/auth';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { firstValueFrom, map, Observable, Subscription } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast/toast';
import { Userservice } from 'src/app/core/services/userservice/userservice';
import { ProfileModalComponent } from 'src/app/shared/components/profile-modal/profile-modal.component';
import { enterAnimation } from '../../shared/animations/profile-animations';
import { CardService } from 'src/app/core/services/cardservice/cardservice';
import { Card } from 'src/app/core/models/card.model';
import { AlertController } from '@ionic/angular';
import { NotificationService } from 'src/app/core/services/notification/notification';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {

  userName$!: Observable<string>;
  cards: any[] = [];
  transactions: any[] = [];
  activeCard: any = null;
  private cardsSubscription?: Subscription;

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 16,
  };

  constructor(
    private userService: Userservice,
    private router: Router,
    private modalControl: ModalController,
    private authservice: AuthService,
    private toastService: ToastService,
    private cardService: CardService,
    private alertCtr: AlertController,
    private notificationService: NotificationService,
  ) { }

  async ngOnInit() {
    this.setUserIdToSaveNotificaion();
    this.userName$ = this.userService.userProfile$.pipe(
      map(profile => profile ? profile.first_name : 'Guest')
    );
    this.loadCards();
    await this.loadTransactions();
    await this.userService.fetchUserProfile();
  }



  onCardChange(event: any) {
    const swiper = event.detail[0];
    this.activeCard = this.cards[swiper.activeIndex];
  }

  onSetDefault() {
    // Marcar tarjeta como default
  }

  onChangeCard() {
    // Abrir modal o navegar
  }

  onPayNow() {
    this.router.navigate(['/payment']);
  }

  onAddCard() {
    this.router.navigate(['/add-card']);
  }

  onViewAll() {
    // Navegar a historial completo
  }

  async onProfile() {
    const currengProfile = await firstValueFrom(this.userService.userProfile$);
    const modal = await this.modalControl.create({
      component: ProfileModalComponent,
      componentProps: {
        userProfile: currengProfile,
      },
      enterAnimation: enterAnimation,
      breakpoints: [0, 0.9], // hacer parecer una hoja que sube
      initialBreakpoint: 0.9,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      try {
        await this.userService.updateUserProfile(data);
      } catch (error) {
        console.error('Error updating profile:', error);
        await this.toastService.showError('Error al actualizar el perfil');
      }
    } else if (role === 'logout') {
      await this.authservice.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  async onDeleteCard(card: any) {
    const alert = await this.alertCtr.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to remove this card?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.cardService.deleteCard(card.id);
              this.toastService.success('Card deleted successfully');
            } catch (e) {
              this.toastService.showError('Error deleting card');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async loadCards() {
    const uid = this.authservice.getCurrentUser()?.uid;
    if (!uid) {
      console.error('No user ID found');
      return;
    }
    this.cardsSubscription = this.cardService.getUserCards(uid).subscribe(cards => {
      // La tarjeta isDefault siempre queda en el indice 0
      this.cards = (cards as Card[]).sort((a, b) =>
        (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)
      );
      this.activeCard = this.cards[0] || null;
    });
  }

  private async loadTransactions() {
    // Después conectamos con TransactionService
    this.transactions = [];
  }

  private async setUserIdToSaveNotificaion() {
    const uid = this.authservice.getCurrentUser()?.uid;
    if (!uid) {
      console.error('No user ID found');
      console.log(JSON.stringify('No user ID found'));

      return;
    }
    await this.notificationService.requestPermission(uid);
  }
  ngOnDestroy() {
    this.cardsSubscription?.unsubscribe();
  }
}