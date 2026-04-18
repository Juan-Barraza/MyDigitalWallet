import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-balance-display',
  templateUrl: './balance-display.component.html',
  styleUrls: ['./balance-display.component.scss'],
  standalone: false,
})
export class BalanceDisplayComponent  implements OnInit {
  @Input() name!: string;
  @Input() category!: string;
  @Input() amount!: number;

  constructor() { }

  ngOnInit() {}

}
