import { Component, OnInit, Input } from '@angular/core';
import { Transaction } from '../../../core/models/transaction.model';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  standalone: false,
})
export class TransactionListComponent implements OnInit {
  @Input() transactions: Transaction[] = [];
  @Input() loading = false;

  constructor(
  ) {}

  ngOnInit() {
  }


  formatDate(date: Timestamp): string {
    return date.toDate().toLocaleString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }
}