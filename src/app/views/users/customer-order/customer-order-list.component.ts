import { Component, OnInit } from '@angular/core';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order-list.component.html'
})
export class CustomerOrderListComponent implements OnInit {
  data: Order[];
  status = 'pending';

  constructor(private service: OrderService, private alertService: AlertMessageService) {
  }

  ngOnInit() {
    this.alertService.clear();
    this.fetchData();
  }

  fetchData() {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
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
