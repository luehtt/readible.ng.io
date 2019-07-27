import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {User} from '../../../models/user';
import {AlertService} from 'src/app/services/common/alert.service';
import {DataImplemented} from '../../../common/function';
import {Const} from '../../../common/const';
import {Order} from '../../../models/order';
import {ManagerService} from '../../../services/manager.service';
import {Manager} from '../../../models/manager';

@Component({
  selector: 'app-manager-detail',
  templateUrl: './manager-detail.component.html'
})
export class ManagerDetailComponent implements OnInit {
  data: Manager;
  account: User;
  id: number;

  // this.orders is a combine list of confirmedOrders and completedOrders
  orders: Order[];
  orderPage = 1;
  orderPageSize: number = Const.PAGE_SIZE_HIGHEST;
  orderFilter = '';
  orderSorted = 'id';
  orderSortedDirection = 'asc';

  constructor(
    private route: ActivatedRoute,
    private service: ManagerService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.alertService.clear();

    const startTime = this.alertService.initTime();
    this.service.get(this.id).subscribe(
      res => {
        this.data = res.manager;
        this.account = res.user;

        // this method is to join n list into 1 list and remove duplication
        // do NOT freak out, read more here:
        // https://medium.com/dailyjs/how-to-remove-array-duplicates-in-es6-5daa8789641c
        this.orders = [...new Set([...this.data.confirmedOrders, ...this.data.completedOrders])];
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  get filterOrder() {
    return !this.data ? null : this.orders.filter(x => x.status.locale.toLowerCase().includes(this.orderFilter.toLowerCase()) ||
      DataImplemented.include(x, this.orderFilter, ['createdAt', 'updatedAt']) ||
      DataImplemented.includeNumber(x, this.orderFilter, ['id', 'totalItem', 'totalPrice'])
    );
  }

  onSortOrder(sorting: string) {
    if (sorting == null) { return; }
    this.orderSortedDirection = this.orderSorted !== sorting ? 'asc' : (this.orderSortedDirection === 'asc' ? 'desc' : 'asc');
    this.orderSorted = sorting;

    switch (this.orderSorted) {
      case 'createdAt': case 'updatedAt':
        this.orders = DataImplemented.sortString(this.orders, this.orderSorted, this.orderSortedDirection);
        break;
      case 'id': case 'totalItem': case 'totalPrice': case 'statusId':
        this.orders = DataImplemented.sortNumber(this.orders, this.orderSorted, this.orderSortedDirection);
        break;
    }
  }


}
