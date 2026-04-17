import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth/auth';
import { FirestoreService } from './services/firestore/firestore';
import { ToastService } from './services/toast/toast';
import { Userservice } from './services/userservice/userservice';
import { BiometricService } from './services/biometric/biometric';
import { CardService } from './services/cardservice/cardservice';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    FirestoreService,
    ToastService,
    Userservice,
    BiometricService,
    CardService,
  ]
})
export class CoreModule { }
