import {Component, OnInit} from '@angular/core';

import {AlertService} from 'src/app/services/common/alert.service';
import {OrderService} from 'src/app/services/order.service';
import {Order} from 'src/app/models/order';
import {Const} from '../../../common/const';
import {DataImplemented} from '../../../common/function';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  data: Order[];
  status = 'pending';
  filter = '';
  page = 1;
  pageSize: number = Const.PAGE_SIZE_HIGHER;
  sorted = 'title';
  sortedDirection = 'asc';

  constructor(private service: OrderService, private alertService: AlertService) {
  }

  get dataFilter() {
    return !this.data ? null : this.data.filter(x => x.customer.fullname.toLowerCase().includes(this.filter.toLowerCase()) ||
      DataImplemented.include(x, this.filter, ['address', 'phone', 'createdAt', 'updatedAt']) ||
      DataImplemented.includeNumber(x, this.filter, ['id', 'totalItem', 'totalPrice']));
  }

  ngOnInit() {
    this.alertService.clear();
    this.fetchData();
  }

  changeStatus(value: string) {
    this.status = value;
    this.fetchData();
  }

  fetchData() {
    const startTime = this.alertService.initTime();
    this.service.fetch(this.status).subscribe(
      res => {
        this.data = res;
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  onSort(sorting: string) {
    if (sorting == null) {
      return;
    }

    this.sortedDirection = this.sorted !== sorting ? 'asc' : (this.sortedDirection === 'asc' ? 'desc' : 'asc');
    this.sorted = sorting;

    switch (this.sorted) {
      case 'address': case 'phone': case 'createdAt': case 'updatedAt':
        this.data = DataImplemented.sortString(this.data, this.sorted, this.sortedDirection);
        break;
      case 'id': case 'totalItem': case 'totalPrice':
        this.data = DataImplemented.sortNumber(this.data, this.sorted, this.sortedDirection);
        break;
      case 'customer':
        this.data = this.sortedDirection === 'asc' ?
          this.data.sort((a, b) => a.customer.fullname.localeCompare(b.customer.fullname)) :
          this.data = this.data.sort((a, b) => b.customer.fullname.localeCompare(a.customer.fullname));
        break;
    }
  }
}
