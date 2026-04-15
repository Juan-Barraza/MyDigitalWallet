import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  userName: string = '';
  cards: any[] = [];
  transactions: any[] = [];
  activeCard: any = null;

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 16,
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  async ngOnInit() {
    await this.loadUser();
    await this.loadCards();
    await this.loadTransactions();
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

  onProfile() {
    // Abrir modal de perfil
  }


  private async loadUser() {
    const user = this.authService.getCurrentUser();
    if (user) {
      // Después conectamos con FirestoreService para traer el perfil completo
      this.userName = user.displayName?.split(' ')[0] || 'User';
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
