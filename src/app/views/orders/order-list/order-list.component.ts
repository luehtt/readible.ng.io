import {Component, OnInit} from '@angular/core';

import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {OrderService} from 'src/app/services/order.service';
import {Order} from 'src/app/models/order';
import {Common} from '../../../common/const';
import {DataControl} from '../../../common/function';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  data: Order[];
  status = 'pending';
  filter = '';
  page = 1;
  pageSize = Common.PAGE_SIZE_HIGHER;
  sortColumn = 'id';
  sortDirection = 'asc';
  loaded: boolean;

  constructor(private service: OrderService, private alertService: AlertMessageService) {
  }

  get dataFilter() {
    return DataControl.filter(this.data, this.filter, ['id', 'customer.fullname', 'phone', 'totalItem', 'totalPrice', 'createdAt', 'updatedAt']);
  }

  ngOnInit() {
    this.alertService.clear();
    this.initData();
  }

  onSelectStatus(value: string) {
    this.status = value;
    this.initData();
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.fetch(this.status).subscribe(
      res => {
        this.data = res;
        this.loaded = true;
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  onSort(sortColumn: string) {
    if (!sortColumn) { return; }
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortColumn, this.sortDirection);
    this.sortColumn = sortColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }
}
