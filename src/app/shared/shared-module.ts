import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './components/input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [
    InputComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
  ],
  exports: [
    InputComponent,
    ReactiveFormsModule,
  ]
})
export class SharedModule { }
