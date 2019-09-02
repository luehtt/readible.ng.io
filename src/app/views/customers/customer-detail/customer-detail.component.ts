import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {Customer} from 'src/app/models/customer';
import {User} from '../../../models/user';
import {CustomerService} from 'src/app/services/customer.service';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {DataFunc} from '../../../common/function';
import {Const} from '../../../common/const';
import {PlaceholderService} from '../../../services/common/placeholder.service';


@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html'
})
export class CustomerDetailComponent implements OnInit {
  data: Customer;
  account: User;
  id: number;

  orderPage = 1;
  orderPageSize: number = Const.PAGE_SIZE_DEFAULT;
  orderFilter = '';
  orderSorted = 'id';
  orderSortedDirection = 'asc';
  commentPage = 1;
  commentPageSize: number = Const.PAGE_SIZE_DEFAULT;
  commentFilter = '';
  commentSorted = 'bookIsbn';
  commentSortedDirection = 'asc';

  constructor(
    private route: ActivatedRoute,
    private service: CustomerService,
    private alertService: AlertMessageService,
    public placeholderService: PlaceholderService
  ) {}

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.alertService.clear();

    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(
      res => {
        this.data = res.customer;
        this.account = res.user;
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  get filterOrder() {
    return !this.data ? null : this.data.orders.filter(x => x.status.locale.toLowerCase().includes(this.orderFilter.toLowerCase()) ||
      DataFunc.include(x, this.orderFilter, ['createdAt', 'updatedAt']) ||
      DataFunc.includeNumber(x, this.orderFilter, ['id', 'totalItem', 'totalPrice'])
    );
  }

  onSortOrder(sorting: string) {
    if (sorting == null) { return; }
    this.orderSortedDirection = this.orderSorted !== sorting ? 'asc' : this.orderSortedDirection === 'asc' ? 'desc' : 'asc';
    this.orderSorted = sorting;

    switch (this.orderSorted) {
      case 'createdAt': case 'updatedAt':
        this.data.orders = DataFunc.sortString(this.data.orders, this.orderSorted, this.orderSortedDirection);
        break;
      case 'id': case 'totalItem': case 'totalPrice': case 'statusId':
        this.data.orders = DataFunc.sortNumber(this.data.orders, this.orderSorted, this.orderSortedDirection);
        break;
    }
  }

  get filterComment() {
    switch (this.commentFilter) {
      case '1 star': case '2 star': case '3 star': case '4 star': case '5 star':
        const star = parseInt(this.commentFilter.substring(0, 1), 10);
        return !this.data ? null : this.data.bookComments.filter(x => x.rating === star);
      default:
        return !this.data ? null : this.data.bookComments.filter(x => DataFunc.include(x, this.commentFilter, ['comment', 'createdAt', 'bookIsbn']));
    }
  }

  onSortComment(sorting: string) {
    if (sorting == null) {
      return;
    }

    this.commentSortedDirection = this.commentSorted !== sorting ? 'asc' : this.commentSortedDirection === 'asc' ? 'desc' : 'asc';
    this.commentSorted = sorting;

    switch (this.commentSorted) {
      case 'comment': case 'createdAt': case 'bookIsbn':
        this.data.bookComments = DataFunc.sortString(this.data.bookComments, this.commentSorted, this.commentSortedDirection);
        break;
      case 'rating':
        this.data.bookComments = DataFunc.sortNumber(this.data.bookComments, this.commentSorted, this.commentSortedDirection);
        break;
    }
  }


}
