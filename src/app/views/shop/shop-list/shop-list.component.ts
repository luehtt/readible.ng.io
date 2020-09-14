import { Component, OnInit } from '@angular/core';
import { Common } from 'src/app/common/const';
import { Book } from 'src/app/models/book';
import { BookCategory } from 'src/app/models/category';
import { Pagination } from 'src/app/models/pagination';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { ShopService } from 'src/app/services/shop.service';


@Component({
  selector: 'app-shop-list',
  templateUrl: './shop-list.component.html'
})
export class ShopListComponent implements OnInit {

  data: Book[];
  pagination: Pagination;
  categories: BookCategory[];

  search: string;
  category: string;
  currentPage: number;
  defaultLimit = Common.PAGE_SIZE_DEFAULT;

  constructor(private service: ShopService, private alertService: AlertMessageService) {
  }

  ngOnInit(): void {
    this.onClear();
    this.initCategories();
  }

  private initCategories(): void {
    const startTime = this.alertService.startTime();
    this.service.fetchCategory().subscribe(res => {
      this.categories = res;
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private initData(): void {
    const startTime = this.alertService.startTime();
    this.service.fetch(this.currentPage, this.defaultLimit, this.category, this.search).subscribe(res => {
      this.pagination = res.pagination;
      this.data = res.data;
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  onChangePage(page: number): void {
    this.alertService.clear();
    this.currentPage = page;
    this.initData();
  }

  onSetCategory(name: string): void {
    this.category = name.toLowerCase();
    this.onChangePage(1);
  }

  onSetSearch(): void {
    this.onChangePage(1);
  }

  onClear(): void {
    this.alertService.clear();
    this.search = '';
    this.category = '';
    this.currentPage = 1;
    this.initData();
  }

}

