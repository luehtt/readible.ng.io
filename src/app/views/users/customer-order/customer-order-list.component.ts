import { Component, OnInit } from '@angular/core';

import { AlertService } from 'src/app/services/common/alert.service';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order-list.component.html'
})
export class CustomerOrderListComponent implements OnInit {
  data: Order[];
  status = 'pending';

  constructor(private service: OrderService, private alertService: AlertService) {
  }

  ngOnInit() {
    this.alertService.clear();
    this.fetchData();
  }

  fetchData() {
    const startTime = this.alertService.initTime();
    this.service.fetchCustomer(this.status).subscribe(
      res => {
        this.data = res;
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  changeStatus(value: string) {
    this.status = value;
    this.fetchData();
  }
}
