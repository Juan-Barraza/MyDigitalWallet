import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth/auth';
import { FirestoreService } from './services/firestore/firestore';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    FirestoreService
  ]
})
export class CoreModule { }
