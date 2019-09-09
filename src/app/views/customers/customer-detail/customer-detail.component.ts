import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {Customer} from 'src/app/models/customer';
import {User} from '../../../models/user';
import {CustomerService} from 'src/app/services/customer.service';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {DataFunc} from '../../../common/function';
import {Common} from '../../../common/common';
import {PlaceholderService} from '../../../services/common/placeholder.service';
import {Order} from 'src/app/models/order';


@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html'
})
export class CustomerDetailComponent implements OnInit {
  data: Customer;
  account: User;
  id: number;

  orderPage = 1;
  orderPageSize: number = Common.PAGE_SIZE_DEFAULT;
  orderFilter = '';
  orderSortColumn = 'id';
  orderSortDirection = 'asc';
  commentPage = 1;
  commentPageSize: number = Common.PAGE_SIZE_DEFAULT;
  commentFilter = '';
  commentSortColumn = 'bookIsbn';
  commentSortDirection = 'asc';
  loaded: boolean;

  constructor(
    private route: ActivatedRoute,
    private service: CustomerService,
    private alertService: AlertMessageService,
    public placeholderService: PlaceholderService
  ) {}

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.initData();
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.get(this.id).subscribe(
      res => {
        this.data = res.customer;
        this.account = res.user;
        this.loaded = true;
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  get filterOrder(): Order[] {
    return DataFunc.filter(this.data.orders, this.orderFilter, ['id', 'status.locale', 'totalItem', 'totalPrice', 'createdAt', 'updatedAt']);
  }

  onSortOrder(sortColumn: string) {
    if (!sortColumn) { return; }
    this.orderSortDirection = DataFunc.sortDirection(this.orderSortColumn, sortColumn);
    this.orderSortColumn = sortColumn;
    this.data.orders = DataFunc.sort(this.data.orders, this.orderSortColumn, this.orderSortDirection);
  }

  get filterComment() {
    switch (this.commentFilter) {
      case '1 star': case '2 star': case '3 star': case '4 star': case '5 star':
        return DataFunc.filter(this.data.bookComments, this.commentFilter.substring(0, 1), ['rating']);
      default:
        return DataFunc.filter(this.data.bookComments, this.commentFilter, ['bookIsbn', 'comment', 'updatedAt']);
    }
  }

  onSortComment(sortColumn: string) {
    if (!sortColumn) { return; }
    this.commentSortDirection = DataFunc.sortDirection(this.orderSortColumn, sortColumn);
    this.commentSortColumn = sortColumn;
    this.data.bookComments = DataFunc.sort(this.data.bookComments, this.commentSortColumn, this.commentSortDirection);
  }

}
