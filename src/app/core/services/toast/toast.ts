import { Injectable } from '@angular/core';
import { Toast } from '@capacitor/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // Diccionario unificado de errores
  private firebaseErrors: Record<string, string> = {
    // Login
    'auth/invalid-credential': 'Email o contraseña incorrectos',
    'auth/user-not-found': 'No existe una cuenta con este email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos, intenta más tarde',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    // Registro
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'El email no es válido',
    'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres)',
    // Genéricos
    'auth/network-request-failed': 'Error de conexión, verifica tu internet',
    'auth/operation-not-allowed': 'Operación no permitida',
  };
  constructor() { }


  async showError(error: any) {
    let message = 'Ocurrió un error inesperado';

    if (typeof error === 'string') {
      message = error;
    } else if (error?.code) {
      message = this.firebaseErrors[error.code] || `Error: ${error.code}`;
    } else if (error?.message) {
      message = error.message;
    }

    await Toast.show({
      text: message,
      duration: 'long',
      position: 'bottom'
    });
  }

  async success(message: string) {
    await Toast.show({
      text: message,
      duration: 'short',
      position: 'bottom',
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
