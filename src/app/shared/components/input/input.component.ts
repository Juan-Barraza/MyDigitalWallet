import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: false,
})
export class InputComponent  implements OnInit {
  @Input() control: FormControl | any;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() maxLength: number = 20;
  showPassword: boolean = false;

  constructor() { }

  ngOnInit() {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
