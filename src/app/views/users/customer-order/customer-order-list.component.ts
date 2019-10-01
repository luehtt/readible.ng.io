import { Component, OnInit } from '@angular/core';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order';
import { DataControl } from 'src/app/common/function';
import { Common } from 'src/app/common/const';

@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order-list.component.html'
})
export class CustomerOrderListComponent implements OnInit {
  data: Order[];
  page = 1;
  pageSize: number = Common.PAGE_SIZE_SMALLER;
  filter = '';
  sortColumn = 'id';
  sortDirection = 'asc';

  constructor(private service: OrderService, private alertService: AlertMessageService) {
  }

  ngOnInit() {
    this.alertService.clear();
    this.fetchData();
  }

  private fetchData() {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.fetch(null).subscribe(
      res => {
        this.data = res;
        this.alertService.successResponse(startTime);
      },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  get dataFilter(): Order[] {
    return DataControl.filter(this.data, this.filter, ['id', 'status.locale', 'totalItem', 'totalPrice', 'createdAt', 'updatedAt']);
  }

  onSort(sortColumn: string) {
    if (!sortColumn) { return; }
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortColumn, this.sortDirection);
    this.sortColumn = sortColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }

}
