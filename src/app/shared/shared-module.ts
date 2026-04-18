import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './components/input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ButtonComponent } from './components/button/button.component';
import { ProfileModalComponent } from './components/profile-modal/profile-modal.component';
import { CardComponent } from './components/card/card.component';
import { BalanceDisplayComponent } from './components/balance-display/balance-display.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';



@NgModule({
  declarations: [
    InputComponent,
    ButtonComponent,
    ProfileModalComponent,
    CardComponent,
    BalanceDisplayComponent,
    TransactionListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
  ],
  exports: [
    InputComponent,
    ReactiveFormsModule,
    ButtonComponent,
    ProfileModalComponent,
    CardComponent,
    BalanceDisplayComponent,
    TransactionListComponent,
  ]
})
export class SharedModule { }
