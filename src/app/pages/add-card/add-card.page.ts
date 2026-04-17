import { CardService } from './../../core/services/cardservice/cardservice';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardBrand } from 'src/app/core/models/card.model';
import { ToastService } from 'src/app/core/services/toast/toast';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss'],
  standalone: false,
})
export class AddCardPage implements OnInit {
  addCardForm!: FormGroup;
  isLoading = false;
  currentBrand: CardBrand = 'unknown';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService,
    private cardService: CardService,
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.listenFormChanges();
  }

  async onAddCard() {
    if (this.addCardForm.invalid) {
      this.toastService.showError('Please fill all fields correctly');
      return;
    }
    this.isLoading = true;
    try {
      await this.cardService.addCard(this.addCardForm.value);
      await this.toastService.success('Card added successfully');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Add card error:', JSON.stringify(error));
      console.error('Add card error:', error);

      await this.toastService.showError(error);
    } finally {
      this.isLoading = false;
    }
  }


  goToHome() {
    this.router.navigate(['/home']);
  }

  private listenFormChanges() {
    this.addCardForm.get('cardNumber')?.valueChanges.subscribe(value => {
      if (value) {
        const formatted = this.cardService.formCardNumber(value);
        this.currentBrand = this.cardService.detectedBrand(value);

        this.addCardForm.get('cardNumber')?.setValue(formatted, { emitEvent: false }); // emmitevent false avoids infitinitive loops
      }
    });

    this.addCardForm.get('expiryDate')?.valueChanges.subscribe(value => {
      if (value) {
        const formatted = this.cardService.formExpiryDate(value);
        this.addCardForm.get('expiryDate')?.setValue(formatted, { emitEvent: false });
      }

    });
  }

  private initForm() {
    this.addCardForm = this.fb.group({
      cardholderName: ['', [Validators.required, Validators.minLength(3)]],
      cardNumber: ['', [Validators.required]],
      expiryDate: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    });
  }
}
