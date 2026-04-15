import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService, UserProfile } from 'src/app/core/services/auth/auth';
import { BiometricService } from 'src/app/core/services/biometric/biometric';
import { ToastService } from 'src/app/core/services/toast/toast';
import { Userservice } from 'src/app/core/services/userservice/userservice';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
  standalone: false,
})
export class ProfileModalComponent implements OnInit {
  @Input() userProfile!: UserProfile;
  profileForm!: FormGroup;
  private isTogglingProgrammatically = false;

  constructor(
    private fb: FormBuilder,
    private modalControl: ModalController,
    private toastService: ToastService,
    private alertCtr: AlertController,
    private authService: AuthService,
    private biometricService: BiometricService,
    private userService: Userservice
  ) { }

  ngOnInit() {
    this.initForm();
  }


  close() {
    return this.modalControl.dismiss();
  }

  save() {
    if (this.profileForm.invalid) {
      this.toastService.showError('Please fill out all required fields');
      return;
    }
    this.modalControl.dismiss(this.profileForm.value, 'confirm');
  }

  onLogout() {
    this.modalControl.dismiss(null, 'logout');
  }

  async onBiometricToggle(event: any) {
    if (this.isTogglingProgrammatically) return;

    const isChecked = event.detail.checked;

    if (isChecked) {
      const isAvailable = await this.biometricService.isAvailable();
      if (!isAvailable) {
        this.toastService.showError('Biometric authentication is not available on this device');
        this.revertToggle(false);
        return;
      }
      await this.promptForPassword();
    } else {
      await this.biometricService.deleteCredentials();
      await this.userService.updateUserProfile({ biometricEnabled: false });
      this.toastService.info('Biometric authentication disabled');
    }

  }

  private async promptForPassword() {
    const alert = await this.alertCtr.create({
      header: 'Verification security',
      message: 'To enable biometric authentication, please verify your password.',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.revertToggle(false);
          }
        },
        {
          text: 'Accept',
          handler: async (data) => {
            if (!data.password) {
              this.toastService.showError('The password is required');
              this.revertToggle(false);
              return;
            }

            // 1. Validamos la contraseña con Firebase
            const isValid = await this.authService.verifyCurrentPassword(data.password);

            if (isValid) {
              // 2. Si la contraseña es correcta, pedimos la huella
              const isBiometricVerified = await this.biometricService.verifyIdentity(
                'Confirma tu identidad para habilitar el acceso biométrico'
              );

              if (isBiometricVerified) {
                try {
                  const email = this.userProfile.email;
                  if (!email) {
                    this.toastService.showError('Error interno: Falla con el email');
                    this.revertToggle(false);
                    return;
                  }

                  try { await this.biometricService.deleteCredentials(); } catch (e) { }

                  // Guardamos en el dispositivo y en Firebase
                  await this.biometricService.saveCredentials(email, data.password);
                  await this.userService.updateUserProfile({ biometricEnabled: true });
                  this.toastService.success('Biometric authentication enabled');

                } catch (error) {
                  console.error('Fallo al guardar en Keystore:', JSON.stringify(error));
                  this.toastService.showError('Error al guardar en el dispositivo');
                  this.revertToggle(false);
                }
              } else {
                // Si el usuario cancela la huella o no la reconoce
                this.toastService.showError('Biometric verification failed');
                this.revertToggle(false);
              }
            } else {
              // Si la contraseña escrita estaba mal desde el principio
              this.toastService.showError('Password is incorrect');
              this.revertToggle(false);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private revertToggle(state: boolean) {
    this.isTogglingProgrammatically = true;
    this.profileForm.patchValue({ biometricEnabled: state });
    setTimeout(() => this.isTogglingProgrammatically = false, 100);
  }

  private initForm() {
    this.profileForm = this.fb.group({
      first_name: [this.userProfile?.first_name || '', [Validators.required]],
      last_name: [this.userProfile?.last_name || '', [Validators.required]],
      biometricEnabled: [this.userProfile?.biometricEnabled || false]
    });
  }
}
