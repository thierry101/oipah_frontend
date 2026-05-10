import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-submit-spinner',
  imports: [CommonModule],
  templateUrl: './submit-spinner.component.html',
  styleUrl: './submit-spinner.component.scss',
})
export class SubmitSpinnerComponent {

  @Input() loading: boolean = false;
  @Input() label: string = 'Valider';
  @Input() cssClass: string = 'btn btn-outline-secondary btn-sm';
  @Input() icon: string | null = "ti ti-refresh me-1"; // ← NEW: optional icon

  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    if (!this.loading) {
      this.clicked.emit();
    }
  }

}
