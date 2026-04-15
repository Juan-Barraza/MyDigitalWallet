import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth';
import { BiometricService } from 'src/app/core/services/biometric/biometric';
import { ToastService } from 'src/app/core/services/toast/toast';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hasBiometricSetup: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private biometricService: BiometricService,
    private loadingController: LoadingController
  ) {
    this.initForm();
  }

  async ngOnInit() {
    await this.checkBiometricStatus();
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      await this.toastService.showError('Por favor completa todos los campos correctamente');
      return;
    } this.isLoading = true;
    try {
      const { email, password } = this.loginForm.value;
      await this.authService.loginWithEmailAndPassword(email, password);
      await this.toastService.success('¡Bienvenido de vuelta! 👋');
      this.router.navigate(['/home'], { replaceUrl: true });

    } catch (error: any) {
      console.error('Login error:', error);
      await this.toastService.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async onGoogleLogin() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/home'], { replaceUrl: true });
      await this.toastService.success('¡Bienvenido!');
    } catch (error: any) {
      console.error('Google login error:', error);
      await this.toastService.showError(error);
    }
  }

  async checkBiometricStatus() {
    const isAvailable = await this.biometricService.isAvailable();
    if (!isAvailable) return;

    const credencials = await this.biometricService.getCredentials();
    if (credencials && credencials.username && credencials.password) {
      this.hasBiometricSetup = true;
    }

  }

  async loginWithBiometrics() {
    try {
      const credencials = await this.biometricService.getCredentials();
      if (!credencials) {
        console.error("No se encontraron credenciales para el servidor:", 'io.ionic.starter' );
        await this.toastService.showError('No biometric credentials found');
        return;
      }
      const isVerified = await this.biometricService.verifyIdentity('Start session in My Digial Wallet');
      if (isVerified) {
        const loading = await this.loadingController.create({
          message: 'Logging in with biometrics...',
          spinner: 'crescent',
        });
        await loading.present();
        try {
          await this.authService.loginWithEmailAndPassword(credencials.username, credencials.password);
          await this.toastService.success('¡Bienvenido de vuelta!');
          this.router.navigate(['/home'], { replaceUrl: true });
        } catch (firebaseerror) {
          await this.toastService.showError('Error al iniciar sesión. Intenta con tu contraseña.');
          await this.biometricService.deleteCredentials();
          this.hasBiometricSetup = false;
        } finally {
          await loading.dismiss();
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error);
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  get emailError() {
    const control = this.loginForm.get('email');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El email es requerido';
    if (control.hasError('email')) return 'Ingresa un email valido';
    return '';
  }
  get passworError() {
    const control = this.loginForm.get('password');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'La contraseña es requerida';

    return '';
  }

  private initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

}
