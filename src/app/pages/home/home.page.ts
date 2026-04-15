import { AuthService, UserProfile } from './../../core/services/auth/auth';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { firstValueFrom, map, Observable } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast/toast';
import { Userservice } from 'src/app/core/services/userservice/userservice';
import { ProfileModalComponent } from 'src/app/shared/components/profile-modal/profile-modal.component';
import { enterAnimation, leaveAnimation } from '../../shared/animations/profile-animations';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  userName$!: Observable<string>;
  cards: any[] = [];
  transactions: any[] = [];
  activeCard: any = null;

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
  ) { }

  async ngOnInit() {
    this.userName$ = this.userService.userProfile$.pipe(
      map(profile => profile ? profile.first_name : 'Guest')
    );
    await this.loadCards();
    await this.loadTransactions();
    await this.userService.fetchUserProfile();
  }



  onCardChange() {
    // Actualizar tarjeta activa al deslizar
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
      leaveAnimation: leaveAnimation,
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



  private async loadCards() {
    // Después conectamos con CardService
    this.cards = [];
    this.activeCard = this.cards[0] || null;
  }

  private async loadTransactions() {
    // Después conectamos con TransactionService
    this.transactions = [];
  }

}
