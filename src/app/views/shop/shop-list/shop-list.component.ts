import { Component, OnInit } from '@angular/core';

import { Book } from 'src/app/models/book';
import { Pagination } from 'src/app/models/pagination';

import { AlertService } from 'src/app/services/common/alert.service';
import { ShopService } from 'src/app/services/shop.service';
import { BookCategory } from 'src/app/models/category';
import { BookCategoryService } from 'src/app/services/category.service';
import { Const } from '../../../common/const';

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
  defaultLimit = Const.PAGE_SIZE_DEFAULT;

  constructor(private service: ShopService, private categoryService: BookCategoryService, private alertService: AlertService) {
  }

  ngOnInit() {
    this.alertService.clear();
    const startTime = this.alertService.initTime();

    this.categoryService.fetch().subscribe(res => {
      this.categories = res;
      this.alertService.success(startTime, 'GET');
    }, err => {
      this.alertService.failed(err);
    });

    this.onPageChange(1);
  }

  onPageChange(page) {
    this.currentPage = page;
    if (this.filter !== '') {
      this.onFilter();
    } else if (this.search !== '') {
      this.onSearch();
    } else {
      const startTime = this.alertService.initTime();
      this.service.fetchPage(page, this.defaultLimit, this.filter).subscribe(res => {
        this.pagination = res.pagination;
        this.data = res.data;
        this.alertService.success(startTime, 'GET');
        this.mapCommentRating();
      }, err => {
        this.alertService.failed(err);
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
    const startTime = this.alertService.initTime();
    this.service.fetchPage(this.currentPage, this.defaultLimit, this.filter).subscribe(res => {
      this.pagination = res.pagination;
      this.data = res.data;
      this.alertService.success(startTime, 'GET');
      this.mapCommentRating();
    }, err => {
      this.alertService.failed(err);
    });
  }

  onSetSearch() {
    this.currentPage = 1;
    this.onSearch();
  }

  onSearch() {
    const startTime = this.alertService.initTime();
    this.service.fetchSearchPage(this.currentPage, this.defaultLimit, this.filter, this.search).subscribe(res => {
      console.log(res);
      this.pagination = res.pagination;
      this.data = res.data;
      this.alertService.success(startTime, 'GET');
      this.mapCommentRating();
    }, err => {
      console.log(err);
      this.alertService.failed(err);
    });
  }

  onClear() {
    this.search = '';
    this.filter = '';
    this.onPageChange(1);
  }

  mapCommentRating() {
    for (const i of this.data) {
      const n = i.bookComments.length;
      i.rating = n === 0 ? 0 : i.bookComments.map(e => e.rating).reduce((a, b) => a + b, 0) / i.bookComments.length;
    }
  }

}
