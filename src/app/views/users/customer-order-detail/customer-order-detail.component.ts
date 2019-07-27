import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OrderService } from 'src/app/services/order.service';
import { AlertService } from 'src/app/services/common/alert.service';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-customer-order-detail',
  templateUrl: './customer-order-detail.component.html'
})
export class CustomerOrderDetailComponent implements OnInit {

  data: Order;
  id: number;

  constructor(private route: ActivatedRoute, private service: OrderService, private alertService: AlertService) {
  }

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.alertService.clear();

    const startTime = this.alertService.initTime();
    this.service.getCustomer(this.id).subscribe(
      res => {
        this.data = res;
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

}
