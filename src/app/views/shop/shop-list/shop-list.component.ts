import { Component, OnInit } from '@angular/core';

import { Book } from 'src/app/models/book';
import { Pagination } from 'src/app/models/pagination';
import { Common } from 'src/app/common/const';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { ShopService } from 'src/app/services/shop.service';
import { BookCategory } from 'src/app/models/category';
import { BookCategoryService } from 'src/app/services/category.service';
import { PlaceholderService } from '../../../services/common/placeholder.service';

@Component({
  selector: 'app-shop-list',
  templateUrl: './shop-list.component.html'
})
export class ShopListComponent implements OnInit {

  data: Book[];
  search = '';
  pagination: Pagination;
  categories: BookCategory[];

  filter = '';
  currentPage = 1;
  defaultLimit = Common.PAGE_SIZE_DEFAULT;

  constructor(private service: ShopService, private categoryService: BookCategoryService,
    private alertService: AlertMessageService, public placeholderService: PlaceholderService) {
  }

  ngOnInit() {
    this.alertService.clear();
    const startTime = this.alertService.startTime();

    this.categoryService.fetch().subscribe(res => {
      this.categories = res;
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });

    this.onPageChange(1);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (this.filter !== '') {
      this.onFilter();
    } else if (this.search !== '') {
      this.onSearch();
    } else {
      this.alertService.clear();
      const startTime = this.alertService.startTime();
      this.service.fetchCategory(page, this.defaultLimit, this.filter).subscribe(res => {
        this.pagination = res.pagination;
        this.data = res.data;
        this.alertService.successResponse(startTime);
        this.calcCommentRating();
      }, err => {
        this.alertService.errorResponse(err, startTime);
      });
    }
  }

  onSetFilter(name: string) {
    this.currentPage = 1;
    this.filter = name;
    if (this.search !== '') {
      this.onSearch();
    } else {
      this.onFilter();
    }
  }

  onFilter() {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.fetchCategory(this.currentPage, this.defaultLimit, this.filter).subscribe(res => {
      this.pagination = res.pagination;
      this.data = res.data;
      this.alertService.successResponse(startTime);
      this.calcCommentRating();
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  onSetSearch() {
    this.currentPage = 1;
    this.onSearch();
  }

  onSearch() {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.fetchSearchCategory(this.currentPage, this.defaultLimit, this.filter, this.search).subscribe(res => {
      this.pagination = res.pagination;
      this.data = res.data;
      this.alertService.successResponse(startTime);
      this.calcCommentRating();
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  onClear() {
    this.search = '';
    this.filter = '';
    this.onPageChange(1);
  }

  private calcCommentRating() {
    for (const i of this.data) {
      const n = i.bookComments.length;
      i.rating = n === 0 ? 0 : i.bookComments.map(e => e.rating).reduce((a, b) => a + b, 0) / n;
    }
  }

}
