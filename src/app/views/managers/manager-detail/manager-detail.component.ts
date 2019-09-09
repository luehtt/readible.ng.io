import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {User} from '../../../models/user';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {DataControl} from '../../../common/function';
import {Common} from '../../../common/const';
import {Order} from '../../../models/order';
import {ManagerService} from '../../../services/manager.service';
import {Manager} from '../../../models/manager';
import {PlaceholderService} from '../../../services/common/placeholder.service';

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
  orderPageSize: number = Common.PAGE_SIZE_HIGHER;
  orderFilter = '';
  orderSortColumn = 'id';
  orderSortDirection = 'asc';
  loaded: boolean;

  constructor(
    private route: ActivatedRoute,
    private service: ManagerService,
    private alertService: AlertMessageService,
    public placeholderService: PlaceholderService
  ) {}

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.alertService.clear();
    this.initData();
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(
      res => {
        this.data = res.manager;
        this.account = res.user;
        this.orders = DataControl.removeDuplicate(this.data.confirmedOrders, this.data.completedOrders);
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  get filterOrder() {
    return DataControl.filter(this.orders, this.orderFilter, ['id', 'statusId', 'totalItem', 'totalPrice', 'createdAt', 'updatedAt']);
  }

  onSortOrder(sortColumn: string) {
    if (!sortColumn) { return; }
    this.orderSortDirection = DataControl.sortDirection(this.orderSortColumn, sortColumn);
    this.orderSortColumn = sortColumn;
    this.orders = DataControl.sort(this.orders, this.orderSortColumn, this.orderSortDirection);
  }


}
