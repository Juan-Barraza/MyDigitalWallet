import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: false,
})
export class ButtonComponent implements OnInit {
  @Input() type: string = 'button';
  @Input() icon: string = '';
  @Input() label: string = '';
  @Input() expand: string = 'block';
  @Input() variant: 'default' | 'action' = 'default';
  @Input() class: string = '';
  @Output() clicked = new EventEmitter<void>();

  constructor() { }
  ngOnInit() { }

  onClicked() {
    this.clicked.emit();
  }
}
