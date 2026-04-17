import { Component, Input, OnInit } from '@angular/core';
import { CardBrand } from 'src/app/core/models/card.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: false,
})
export class CardComponent implements OnInit {
  @Input() cardholderName: string = 'YOUR NAME';
  @Input() cardNumber: string = '0000 0000 0000 0000';
  @Input() expiryDate: string = 'MM/YY';
  @Input() brand: CardBrand = 'unknown';
  @Input() lastFour: string = '####';
  @Input() mode: 'preview' | 'saved' | 'edit' = 'preview';

  constructor() { }

  ngOnInit() { }

  get displayNumber(): string {
    if (this.mode === 'preview') {
      if (!this.cardNumber || this.cardNumber.trim().length === 0) {
        return 'XXXX XXXX XXXX XXXX';
      }
      const raw = this.cardNumber.replace(/\s/g, '').padEnd(16, 'X');
      return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return `**** **** **** ${this.lastFour}`;
  }

  get brandLabel(): string {
    return this.brand === 'unknown' ? 'Card' : this.brand.toUpperCase();
  }

}
