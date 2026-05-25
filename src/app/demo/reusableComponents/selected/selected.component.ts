/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @angular-eslint/no-output-native */


import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-selected',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './selected.component.html',
  styleUrl: './selected.component.scss',
})
export class SelectedComponent<T extends { name?: any; id?: any }> {
  constructor(private elementRef: ElementRef) { }

  @Input() placeholder: string = 'Search...';
  @Input() disabled = false;
  @Input() searchTerm: string = '';
  @Input() results: T[] = [];
  @Input() displayField: keyof T = 'name';
  @Input() error: string | null = null;
  @Input() showResults: boolean = false;

  // Optional function to customize display
  @Input() displayFn?: (item: T) => string;

  @Output() search = new EventEmitter<string>();
  @Output() select = new EventEmitter<T>();
  @Output() searchTermChange = new EventEmitter<string>();

  onInputChange(value: string) {
    this.searchTerm = value;

    this.searchTermChange.emit(value);

    this.search.emit(value);

    this.showResults = true;
  }

  onSelect(item: T) {
    this.searchTerm = this.displayFn
      ? this.displayFn(item)
      : String(item[this.displayField] ?? '');

    this.searchTermChange.emit(this.searchTerm);

    this.select.emit(item);

    this.showResults = false;
  }

  onInputClick() {
    this.showResults = true;

    this.search.emit(this.searchTerm || '');
  }

  trackById(index: number, item?: any): number {
    return item?.id ?? index;
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    setTimeout(() => {
      const clickedInside = this.elementRef.nativeElement.contains(
        event.target
      );

      if (!clickedInside) {
        this.showResults = false;
      }
    });
  }
}
