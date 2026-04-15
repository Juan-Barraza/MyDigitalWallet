import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.initForm();
  }

  ngOnInit() {
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      await this.toastService.error('Por favor completa todos los campos correctamente');
      return;
    } this.isLoading = true;
    try {
      const { email, password } = this.loginForm.value;
      await this.authService.loginWithEmailAndPassword(email, password);
      await this.toastService.success('¡Bienvenido de vuelta! 👋');
      this.router.navigate(['/home'], { replaceUrl: true });

    } catch (error: any) {
      console.error('Login error:', error);
      await this.toastService.error(this.getFirebaseError(error?.code));
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
      await this.toastService.error(this.getFirebaseError(error?.code));
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

   private getFirebaseError(code: string): string {
    const errors: Record<string, string> = {
      'auth/invalid-credential': 'Email o contraseña incorrectos',
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos, intenta más tarde',
      'auth/network-request-failed': 'Error de conexión, verifica tu internet',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    };
    return errors[code] || 'Ocurrió un error inesperado';
  }

}
