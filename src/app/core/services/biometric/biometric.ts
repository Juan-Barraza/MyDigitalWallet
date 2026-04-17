import { Injectable } from '@angular/core';
import { NativeBiometric, BiometricOptions } from 'capacitor-native-biometric';

@Injectable({
  providedIn: 'root',
})
export class BiometricService {

  constructor() { }

  async isAvailable(): Promise<boolean> {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch (error) {
      return false;
    }
  }

  async verifyIdentity(reason: string = 'Verifica tu identidad'): Promise<boolean> {
    try {
      const options: BiometricOptions = {
        reason: reason,
        title: 'Verificación requerida',
        subtitle: 'Usa tu biometría para continuar',
      };
      await NativeBiometric.verifyIdentity(options);
      return true;
    } catch (error) {
      return false; // Si cancela o falla, retorna false
    }
  }

  async saveCredentials(email: string, password: string): Promise<void> {
    console.log('CREDENTIALSEMAIL: Saving credentials for:', JSON.stringify(email));
    await NativeBiometric.setCredentials({
      username: email,
      password,
      server: 'com.mywallet.digital'
    });
  }

  async getCredentials(): Promise<any> {
    try {
      return await NativeBiometric.getCredentials({
        server: 'com.mywallet.digital'
      });
    } catch (error) {
      return null;
    }
  }

  async deleteCredentials(): Promise<void> {
    try {
      await NativeBiometric.deleteCredentials({
        server: 'com.mywallet.digital'
      });
    } catch (error) {

    }
  }

}
