import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth';
import { ToastService } from 'src/app/core/services/toast/toast';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
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


  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      await this.toastService.showError('Por favor completa todos los campos correctamente');
      return;
    } this.isLoading = true;
    try {
      const { password, ...profile } = this.registerForm.value;
      await this.authService.registerWithEmailAndPassword(profile, password);
      await this.toastService.success('¡Cuenta creada exitosamente!');
      this.router.navigate(['/home'], { replaceUrl: true });

    } catch (error: any) {
      console.error('Register error:', error);
      await this.toastService.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }


  get emailError() {
    const control = this.registerForm.get('email');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El email es requerido';
    if (control.hasError('email')) return 'Ingresa un email valido';
    return '';
  }
  get passworError() {
    const control = this.registerForm.get('password');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'La contraseña es requerida';

    return '';
  }

  get firstNameError() {
    const control = this.registerForm.get('first_name');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El nombre es requerido';
    if (control.hasError('minlength')) return 'El nombre debe tener al menos 3 caracteres';
    return '';
  }
  get lastNameError() {
    const control = this.registerForm.get('last_name');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El apellido es requerido';
    if (control.hasError('minlength')) return 'El apellido debe tener al menos 3 caracteres';
    return '';
  }
  get typeDocumentError() {
    const control = this.registerForm.get('typeDocument');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El tipo de documento es requerido';
    return '';
  }

  get numberDocumentError() {
    const control = this.registerForm.get('numberDocument');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El número de documento es requerido';
    if (control.hasError('minlength')) return 'El número de documento debe tener al menos 6 caracteres';
    return '';
  }

  get countryError() {
    const control = this.registerForm.get('country');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El país es requerido';
    return '';
  }

  private initForm() {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(3)]],
      last_name: ['', [Validators.required, Validators.minLength(3)]],
      document_type: ['', Validators.required],
      document_number: ['', [Validators.required, Validators.minLength(6)]],
      country: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


}
