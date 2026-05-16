/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiselectComponent),
      multi: true
    }
  ]
})
export class MultiselectComponent
  implements ControlValueAccessor, OnChanges {

  /** Liste des options */
  @Input() options: any[] = [];

  /** Clé utilisée comme valeur */
  @Input() valueKey = 'value';

  /** Clé utilisée comme label */
  @Input() labelKey = 'name';

  /** Placeholder */
  @Input() placeholder = 'Sélectionner…';

  /** Event de sortie */
  @Output() selectedChange = new EventEmitter<any[]>();

  // ─────────────────────────────────────────────
  // Etat interne
  // ─────────────────────────────────────────────

  selectedValues: any[] = [];

  isOpen = false;

  isDisabled = false;

  constructor(private elRef: ElementRef) { }

  // ─────────────────────────────────────────────
  // ControlValueAccessor
  // ─────────────────────────────────────────────

  private onChange = (_: any[]) => { };

  private onTouched = () => { };

  writeValue(values: any[]): void {
    this.selectedValues = Array.isArray(values)
      ? [...values]
      : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }

  // ─────────────────────────────────────────────
  // Quand les options changent
  // ─────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.selectedValues = this.selectedValues.filter(v =>
        this.options.some(o => o[this.valueKey] === v)
      );
    }
  }

  // ─────────────────────────────────────────────
  // Ouverture / fermeture
  // ─────────────────────────────────────────────

  toggle(): void {
    if (this.isDisabled) return;

    this.isOpen = !this.isOpen;
  }

  open(): void {
    if (this.isDisabled) return;

    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.onTouched();
  }

  // ─────────────────────────────────────────────
  // Fermer au clic extérieur
  // ─────────────────────────────────────────────

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent): void {

    if (!this.isOpen) return;

    const clickedInside =
      this.elRef.nativeElement.contains(event.target as Node);

    if (!clickedInside) {
      this.close();
    }
  }

  // ─────────────────────────────────────────────
  // Fermer avec Echap
  // ─────────────────────────────────────────────

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  // ─────────────────────────────────────────────
  // Sélection
  // ─────────────────────────────────────────────

  isSelected(value: any): boolean {
    return this.selectedValues.includes(value);
  }

  toggleOption(value: any): void {

    const updated = [...this.selectedValues];

    const idx = updated.indexOf(value);

    if (idx === -1) {
      updated.push(value);
    } else {
      updated.splice(idx, 1);
    }

    this.emit(updated);
  }

  remove(value: any): void {

    const updated =
      this.selectedValues.filter(v => v !== value);

    this.emit(updated);
  }

  selectAll(): void {

    const values =
      this.options.map(o => o[this.valueKey]);

    this.emit(values);
  }

  clearAll(): void {
    this.emit([]);
    this.close();
  }

  getLabel(value: any): string {

    const opt =
      this.options?.find(o => o[this.valueKey] === value);

    return opt
      ? opt[this.labelKey]
      : value;
  }

  // ─────────────────────────────────────────────
  // Emit centralisé
  // ─────────────────────────────────────────────

  private emit(values: any[]): void {

    this.selectedValues = values;

    this.onChange(values);

    this.selectedChange.emit(values);
  }
}
