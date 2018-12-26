import { Component, OnInit, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';

@Component({
  selector: 'pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PaginationComponent implements OnInit {

  @Input() pager;
  @Output() paginate:EventEmitter<number> = new EventEmitter<number>()

  constructor() { }

  ngOnInit() {

  }

  setPage(page: number) {
      if (page < 1/* || page > this.pager.totalPages*/) {
          console.log('pager return');
          console.log(this.pager.totalPages)
          return;
      }
      console.log("SET PAGE " + page )
      this.paginate.emit(page);
  }

}
