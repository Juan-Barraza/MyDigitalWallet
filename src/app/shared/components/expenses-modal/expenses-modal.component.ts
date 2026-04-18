import {
  Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Card } from 'src/app/core/models/card.model';
import { Transaction } from 'src/app/core/models/transaction.model';
import { ChangecardModalComponent } from 'src/app/shared/components/changecard-modal/changecard-modal.component';
import { Subscription } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { PaymentService } from 'src/app/core/services/payment/payment';

@Component({
  selector: 'app-expenses-modal',
  templateUrl: './expenses-modal.component.html',
  styleUrls: ['./expenses-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ExpensesModalComponent implements OnInit, OnDestroy {
  @Input() cards: Card[] = [];
  @Input() activeCard: Card | null = null;
  @Input() uid!: string;

  selectedCard: Card | null = null;


  currentDate = new Date();
  selectedDate: Date | null = new Date();
  calendarDays: (Date | null)[] = [];
  weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  totalSpend = 0;
  loadingTx = false;
  private txSub?: Subscription;

  emojiPickerOpenForId: string | null = null;
  private longPressTimers = new Map<string, any>();

  constructor(
    private modalCtrl: ModalController,
    private txService: PaymentService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.selectedCard = this.activeCard;
    this.buildCalendar();
    this.loadTransactions();
  }

  get monthLabel(): string {
    return this.currentDate.toLocaleDateString('es-ES', {
      month: 'long', year: 'numeric'
    });
  }

  prevMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.buildCalendar();
    this.filterByDate();
    this.cdr.markForCheck();
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.buildCalendar();
    this.filterByDate();
    this.cdr.markForCheck();
  }

  buildCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    this.calendarDays = [];
    for (let i = 0; i < firstDay; i++) this.calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      this.calendarDays.push(new Date(year, month, d));
    }
  }

  selectDay(day: Date | null) {
    if (!day) return;
    this.selectedDate = day;
    this.filterByDate();
    this.cdr.markForCheck();
  }

  isToday(day: Date | null): boolean {
    if (!day) return false;
    const t = new Date();
    return day.getDate() === t.getDate() &&
      day.getMonth() === t.getMonth() &&
      day.getFullYear() === t.getFullYear();
  }

  isSelected(day: Date | null): boolean {
    if (!day || !this.selectedDate) return false;
    return day.getDate() === this.selectedDate.getDate() &&
      day.getMonth() === this.selectedDate.getMonth() &&
      day.getFullYear() === this.selectedDate.getFullYear();
  }

  hasTransactions(day: Date | null): boolean {
    if (!day) return false;
    return this.allTransactions.some(tx => {
      const d = (tx.date as Timestamp).toDate();
      return d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear();
    });
  }


  loadTransactions() {
    if (!this.selectedCard?.id || !this.uid) return;
    this.loadingTx = true;
    this.txSub?.unsubscribe();
    this.txSub = this.txService
      .getTransactionsByCard(this.selectedCard.id)
      .subscribe(txs => {
        this.allTransactions = txs as Transaction[];
        this.totalSpend = this.allTransactions.reduce((sum, t) => sum + t.amount, 0);
        this.filterByDate();
        this.loadingTx = false;
        this.cdr.markForCheck();
      });
  }

  filterByDate() {
    if (!this.selectedDate) {
      this.filteredTransactions = [...this.allTransactions];
      return;
    }
    this.filteredTransactions = this.allTransactions.filter(tx => {
      const d = (tx.date as Timestamp).toDate();
      return d.getDate() === this.selectedDate!.getDate() &&
        d.getMonth() === this.selectedDate!.getMonth() &&
        d.getFullYear() === this.selectedDate!.getFullYear();
    });
  }

  formatTime(date: Timestamp): string {
    return date.toDate().toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  }

  async onChangeCard() {
    const modal = await this.modalCtrl.create({
      component: ChangecardModalComponent,
      componentProps: {
        cards: this.cards,
        activeCard: this.selectedCard,
        uid: this.uid,
      },
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data?.card) {
      this.selectedCard = data.card;
      this.loadTransactions();
      this.cdr.markForCheck();
    }
  }


  onLongPressStart(tx: Transaction) {
    const timer = setTimeout(() => {
      this.emojiPickerOpenForId = tx.id!;
      this.cdr.markForCheck();
    }, 2000);
    this.longPressTimers.set(tx.id!, timer);
  }

  onLongPressEnd(tx: Transaction) {
    const timer = this.longPressTimers.get(tx.id!);
    if (timer) {
      clearTimeout(timer);
      this.longPressTimers.delete(tx.id!);
    }
  }

  closeEmojiPicker() {
    this.emojiPickerOpenForId = null;
    this.cdr.markForCheck();
  }
  
  getCurrentTx(): Transaction {
    return this.filteredTransactions.find(t => t.id === this.emojiPickerOpenForId)!;
  }

  async onEmojiSelect(event: any, tx: Transaction) {
    const emoji = event.emoji?.native ?? '';
    if (!emoji) return;
    this.emojiPickerOpenForId = null;
    await this.txService.updateEmoji(tx.id!, emoji);
    this.cdr.markForCheck();
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  ngOnDestroy() {
    this.txSub?.unsubscribe();
    this.longPressTimers.forEach(t => clearTimeout(t));
  }
}