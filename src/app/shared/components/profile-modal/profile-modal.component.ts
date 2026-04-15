import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UserProfile } from 'src/app/core/services/auth/auth';
import { ToastService } from 'src/app/core/services/toast/toast';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
  standalone: false,
})
export class ProfileModalComponent  implements OnInit {
  @Input() userProfile!: UserProfile;
  profileForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private modalControl: ModalController,
    private toastService: ToastService,
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

  get nameError() {
    const control = this.profileForm.get('name');
    if (control?.hasError('required')) {
      return 'Name is required';
    }
    return '';
  }
  get lastNameError() {
    const control = this.profileForm.get('last_name');
    if (control?.hasError('required')) {
      return 'Last name is required';
    }
    return '';
  }

  private initForm() {
    this.profileForm = this.fb.group({
      first_name: [this.userProfile?.first_name || '', [Validators.required]],
      last_name: [this.userProfile?.last_name || '', [Validators.required]],
      biometricEnabled: [this.userProfile?.biometricEnabled || false]
    });
  }
}
