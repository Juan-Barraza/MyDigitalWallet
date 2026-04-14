import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth';

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
  ) {
    this.initForm();
  }

  ngOnInit() {
  }

  async onLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    try {
      const { email, password } = this.loginForm.value;
      await this.authService.loginWithEmailAndPassword(email, password);
      this.router.navigate(['/home'], {replaceUrl: true});

    } catch (error) {
      console.error('Login error:', error);
      // toast
    } finally {
      this.isLoading = false;
    }
  }

  async onGoogleLogin() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/home'], {replaceUrl: true});
    }catch (error) {
      console.error('Google login error:', error);
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
