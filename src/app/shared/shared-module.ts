import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './components/input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ButtonComponent } from './components/button/button.component';



@NgModule({
  declarations: [
    InputComponent,
    ButtonComponent,
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
  ]
})
export class SharedModule { }
