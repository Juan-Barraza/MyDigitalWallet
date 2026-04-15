import { Injectable } from '@angular/core';
import { Toast } from '@capacitor/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() { }


  async success(message: string) {
    await Toast.show({
      text: message,
      duration: 'short',
      position: 'bottom',
    });
  }

   async error(message: string) {
    await Toast.show({
      text: message,
      duration: 'long',
      position: 'bottom'
    });
  }

   async info(message: string) {
    await Toast.show({
      text: message,
      duration: 'short',
      position: 'bottom'
    });
  }

}
