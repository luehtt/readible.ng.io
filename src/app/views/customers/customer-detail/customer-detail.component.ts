import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Customer } from 'src/app/models/customer';
import { User } from '../../../models/user';
import { CustomerService } from 'src/app/services/customer.service';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { DataControl } from '../../../common/function';
import { Common } from '../../../common/const';
import { PlaceholderService } from '../../../services/common/placeholder.service';
import { Order } from 'src/app/models/order';
import { BookCommentService } from 'src/app/services/comment.service';
import { AuthService } from 'src/app/services/auth/auth.service';


@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html'
})
export class CustomerDetailComponent implements OnInit {
  data: Customer;
  account: User;
  id: number;
  userRole: string;
  loaded: boolean;

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

  constructor(
    private route: ActivatedRoute,
    private service: CustomerService,
    private alertService: AlertMessageService,
    private commentService: BookCommentService,
    private authService: AuthService,
    private placeholderService: PlaceholderService
  ) { }

  ngOnInit() {
    this.alertService.clear();
    this.id = this.getParam();
    if (!this.id) { return; }

    this.userRole = this.authService.getToken('role');
    this.initData();
  }

  private getParam(): number | null {
    const value = this.route.snapshot.paramMap.get('id');
    if (DataControl.isDigit(value)) {
      const res = parseInt(value, 10);
      if (!isNaN(res)) { return res; }
      return this.getParamFailed(value);
    } else {
      return this.getParamFailed(value);
    }
  }

  private getParamFailed(parameter: string): null {
    this.alertService.mismatchParameter(parameter);
    return null;
  }

  private initData() {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(
      res => {
        this.data = res.customer;
        this.account = res.user;
        this.loaded = true;
        this.alertService.successResponse(startTime);
      },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  get imageData() {
    return this.data.image ? this.data.image : this.placeholderService.imgHolder(300, 300, this.data.fullname);
  }

  get filterOrder(): Order[] {
    return DataControl.filter(this.data.orders, this.orderFilter, ['id', 'status.locale', 'totalItem', 'totalPrice', 'createdAt', 'updatedAt']);
  }

  onSortOrder(sortColumn: string) {
    if (!sortColumn) { return; }
    this.orderSortDirection = DataControl.sortDirection(this.orderSortColumn, sortColumn, this.orderSortDirection);
    this.orderSortColumn = sortColumn;
    this.data.orders = DataControl.sort(this.data.orders, this.orderSortColumn, this.orderSortDirection);
  }

  get filterComment() {
    switch (this.commentFilter) {
      case '1 star': case '2 star': case '3 star': case '4 star': case '5 star':
        return DataControl.filter(this.data.bookComments, this.commentFilter.substring(0, 1), ['rating']);
      default:
        return DataControl.filter(this.data.bookComments, this.commentFilter, ['bookIsbn', 'comment', 'updatedAt']);
    }
  }

  onSortComment(sortColumn: string) {
    if (!sortColumn) { return; }
    this.commentSortDirection = DataControl.sortDirection(this.commentSortColumn, sortColumn, this.commentSortDirection);
    this.commentSortColumn = sortColumn;
    this.data.bookComments = DataControl.sort(this.data.bookComments, this.commentSortColumn, this.commentSortDirection);
  }

  onSetEnabled() {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    const item = DataControl.clone(this.account);
    item.active = !this.account.active;

    this.service.put(this.data.userId).subscribe(
      res => {
        this.account = DataControl.read(res, this.account);
        this.alertService.successResponse(startTime);
      },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  onDeleteComment(id: number) {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.commentService.destroy(id).subscribe(res => {
      this.data.bookComments = DataControl.deleteItem(this.data.bookComments, res, 'id');
      this.alertService.successResponse(startTime);
    },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

}
