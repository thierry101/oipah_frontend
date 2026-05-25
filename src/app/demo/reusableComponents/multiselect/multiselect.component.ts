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

  // ─────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────

  /** Liste des options */
  @Input() options: any[] = [];

  /** Clé utilisée comme valeur */
  @Input() valueKey = 'value';

  /** Clé utilisée comme label */
  @Input() labelKey = 'name';

  /** Placeholder */
  @Input() placeholder = 'Sélectionner…';

  /** Fonction custom pour la valeur */
  @Input() valueFn?: (item: any) => any;

  /** Fonction custom pour le label */
  @Input() labelFn?: (item: any) => string;

  // ─────────────────────────────────────────────
  // Outputs
  // ─────────────────────────────────────────────

  @Output() selectedChange =
    new EventEmitter<any[]>();

  // ─────────────────────────────────────────────
  // Etat interne
  // ─────────────────────────────────────────────

  selectedValues: any[] = [];

  isOpen = false;

  isDisabled = false;

  constructor(
    private elRef: ElementRef
  ) { }

  // ─────────────────────────────────────────────
  // ControlValueAccessor
  // ─────────────────────────────────────────────

  private onChange = (_: any[]) => { };

  private onTouched = () => { };

  writeValue(values: any[]): void {

    this.selectedValues =
      Array.isArray(values)
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
  // Lifecycle
  // ─────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['options']) {

      this.selectedValues =
        this.selectedValues.filter(v =>
          this.options.some(
            o => this.resolveValue(o) === v
          )
        );
    }
  }

  // ─────────────────────────────────────────────
  // Gestion ouverture
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
  // Fermeture clic extérieur
  // ─────────────────────────────────────────────

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent): void {

    if (!this.isOpen) return;

    const clickedInside =
      this.elRef.nativeElement.contains(
        event.target as Node
      );

    if (!clickedInside) {
      this.close();
    }
  }

  // ─────────────────────────────────────────────
  // Fermeture Echap
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
      this.selectedValues.filter(
        v => v !== value
      );

    this.emit(updated);
  }

  selectAll(): void {

    const values =
      this.options.map(
        o => this.resolveValue(o)
      );

    this.emit(values);
  }

  clearAll(): void {

    this.emit([]);

    this.close();
  }

  // ─────────────────────────────────────────────
  // Labels / values dynamiques
  // ─────────────────────────────────────────────

  resolveValue(item: any): any {

    if (this.valueFn) {
      return this.valueFn(item);
    }

    return this.getNestedValue(
      item,
      this.valueKey
    );
  }

  resolveLabel(item: any): string {

    if (this.labelFn) {
      return this.labelFn(item);
    }

    return this.getNestedValue(
      item,
      this.labelKey
    );
  }

  getLabel(value: any): string {

    const opt =
      this.options?.find(
        o => this.resolveValue(o) === value
      );

    return opt
      ? this.resolveLabel(opt)
      : value;
  }

  // ─────────────────────────────────────────────
  // Nested path support
  // Exemple:
  // "element.name"
  // "user.profile.firstname"
  // ─────────────────────────────────────────────

  getNestedValue(
    obj: any,
    path: string
  ): any {

    if (!obj || !path) {
      return obj;
    }

    return path
      .split('.')
      .reduce(
        (acc, part) => acc?.[part],
        obj
      );
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
