import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { User } from '../../../models/user';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { DataControl } from '../../../common/function';
import { Common } from '../../../common/const';
import { Order } from '../../../models/order';
import { ManagerService } from '../../../services/manager.service';
import { Manager } from '../../../models/manager';
import { PlaceholderService } from '../../../services/common/placeholder.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-manager-detail',
  templateUrl: './manager-detail.component.html'
})
export class ManagerDetailComponent implements OnInit {
  data: Manager;
  account: User;
  id: number;
  userRole: string;

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
    private authService: AuthService,
    public placeholderService: PlaceholderService
  ) { }

  ngOnInit() {
    this.alertService.clear();
    this.id = this.getParam();
    if (!this.id) return;

    this.userRole = this.authService.getToken('role');
    this.initData();
  }

  private getParam(): number | null {
    const value = this.route.snapshot.paramMap.get('id');
    if (DataControl.isDigit(value)) {
      const res = parseInt(value, 10);
      if (!isNaN(res)) return res;
      return this.getParamFailed(value);
    }
    else {
      return this.getParamFailed(value);
    }
  }

  private getParamFailed(parameter: string): null {
    this.alertService.mismatchParameter(parameter);
    return null;
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(
      res => {
        this.data = res.manager;
        this.account = res.user;
        this.orders = DataControl.removeDuplicate(this.data.confirmedOrders, this.data.completedOrders);
        this.alertService.successResponse(startTime);
        this.loaded = true;
      },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  get filterOrder() {
    return DataControl.filter(this.orders, this.orderFilter, ['id', 'statusId', 'totalItem', 'totalPrice', 'createdAt', 'updatedAt']);
  }

  onSortOrder(sortColumn: string) {
    if (!sortColumn) { return; }
    this.orderSortDirection = DataControl.sortDirection(this.orderSortColumn, sortColumn, this.orderSortDirection);
    this.orderSortColumn = sortColumn;
    this.orders = DataControl.sort(this.orders, this.orderSortColumn, this.orderSortDirection);
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


}
