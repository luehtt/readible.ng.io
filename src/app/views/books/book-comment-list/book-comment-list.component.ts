import { Component, OnInit } from '@angular/core';
import { AlertMessageService } from '../../../services/common/alert-message.service';
import { DataControl } from '../../../common/function';
import { Common } from '../../../common/const';
import { BookComment } from '../../../models/comment';
import { BookCommentService } from '../../../services/comment.service';

@Component({
  selector: 'app-book-comment-list',
  templateUrl: './book-comment-list.component.html'
})
export class BookCommentListComponent implements OnInit {

  data: BookComment[];
  filter = '';
  loaded: boolean;
  page = 1;
  pageSize = Common.PAGE_SIZE_DEFAULT;
  sortColumn = 'name';
  sortDirection = 'asc';

  constructor(private service: BookCommentService, private alertService: AlertMessageService) { }

  ngOnInit() {
    this.alertService.clear();
    this.initData();
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.fetch().subscribe(res => {
      this.data = res;
      this.alertService.successResponse(startTime);
      this.loaded = true;
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  get dataFilter(): BookComment[] {
    switch (this.filter) {
      case '1 star': case '2 star': case '3 star': case '4 star': case '5 star':
        return DataControl.filter(this.data, this.filter.substring(0, 1), ['rating']);
      default:
        return DataControl.filter(this.data, this.filter, ['customer.fullname', 'book.isbn', 'book.title', 'updatedAt']);
    }
  }

  onSort(sortedColumn: string) {
    if (!sortedColumn) { return; }
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortedColumn, this.sortDirection);
    this.sortColumn = sortedColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }

  onDelete(id: number) {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.destroy(id).subscribe(res => {
      this.data.filter(x => x.id !== res.id);
      this.alertService.successResponse(startTime);
    },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }
}
