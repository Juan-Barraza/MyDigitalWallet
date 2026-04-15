import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth/auth';
import { FirestoreService } from './services/firestore/firestore';
import { ToastService } from './services/toast/toast';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    FirestoreService,
    ToastService,
  ]
})
export class CoreModule { }
