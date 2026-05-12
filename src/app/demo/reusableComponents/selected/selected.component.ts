import { FormsModule } from '@angular/forms';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/no-output-native */
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-selected',
  imports: [FormsModule],
  templateUrl: './selected.component.html',
  styleUrl: './selected.component.scss',
})


export class SelectedComponent<T extends { name?: any; id?: any }> {
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

  // onInputChange(value: string) {
  //   this.search.emit(value);
  // }

  onInputChange(value: string) {
    this.searchTerm = value;

    this.searchTermChange.emit(value);

    this.search.emit(value);
  }


  onSelect(item: T) {
    this.select.emit(item);
  }

  onInputClick() {
    this.search.emit(this.searchTerm || '');
  }

  trackById(index: number, item?: any): number {
    return item?.id ?? index;
  }
}
