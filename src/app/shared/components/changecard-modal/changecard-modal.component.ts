import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Card } from 'src/app/core/models/card.model';
import { CardService } from 'src/app/core/services/cardservice/cardservice';
import { ToastService } from 'src/app/core/services/toast/toast';

@Component({
  selector: 'app-changecard-modal',
  templateUrl: './changecard-modal.component.html',
  styleUrls: ['./changecard-modal.component.scss'],
  standalone: false,
})
export class ChangecardModalComponent implements OnInit {
  @Input() cards: Card[] | [] = [];
  @Input() activeCard: Card | null = null;
  @Input() uid!: string;

  selectedCard: Card | null = null;
  settingDefault = false;

  constructor(
    private modalCtrl: ModalController,
    private cardService: CardService,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.selectedCard = this.activeCard;
  }

  isSelected(card: Card): boolean {
    return this.selectedCard?.id === card.id;
  }

  selectCard(card: Card) {
    this.selectedCard = card;
  }
  
  async onSetAsDefault() {
    if (!this.selectedCard?.id || !this.uid) return;
    this.settingDefault = true;
    try {
      await this.cardService.setDefaultCard(this.uid, this.selectedCard.id);
      await this.toastService.success('Default card updated');
      this.modalCtrl.dismiss({ card: this.selectedCard }, 'confirm');
    } catch (e) {
      await this.toastService.showError('Error updating default card');
    } finally {
      this.settingDefault = false;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }


}
