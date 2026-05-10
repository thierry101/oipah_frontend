import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-list',
  imports: [FormsModule],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.scss',
})
export class SearchListComponent {

  @Input() searchTerm: string = '';
  @Output() searchChange = new EventEmitter<string>();

  searchItem() {
    const trimmed = this.searchTerm.trim();
    this.searchChange.emit(trimmed);
    // if (trimmed?.length > 1 || trimmed?.length === 1) {
    //   this.searchChange.emit(trimmed);
    // }
  }
}
