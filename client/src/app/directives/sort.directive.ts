import { AfterViewInit, Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { map } from 'rxjs/operators';

@Directive({
  selector: '[appSort]'
})
export class SortDirective implements AfterViewInit {
  
  @Output() changeSort = new EventEmitter<string>();
  @Input() sortArray: Array<any>;
  @Input() sortDirection: string;
  originalArray: Array<any>
  constructor() { }

  ngAfterViewInit() {
    this.originalArray = [...this.sortArray];
  }

  @HostListener('click') onClick() {
    if (this.sortDirection === 'none') {
      this.sortDirection = 'ascending';
      this.sortArray.sort((n, m) => {
        if (n.name.toLocaleLowerCase() > m.name.toLocaleLowerCase()) {
          return 1;
        } else {
          return -1;
        }
      });
    } else if (this.sortDirection === 'ascending') {
      this.sortDirection = 'descending';
      this.sortArray.sort((n, m) => {
        if (n.name.toLocaleLowerCase() > m.name.toLocaleLowerCase()) {
          return -1;
        } else {
          return 1;
        }
      });
    } else {
      this.sortDirection = 'ascending';
      this.sortArray.sort((n, m) => {
        if (n.name.toLocaleLowerCase() > m.name.toLocaleLowerCase()) {
          return 1;
        } else {
          return -1;
        }
      });
    }
    this.changeSort.emit(this.sortDirection);
  }

}
