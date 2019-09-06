import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  data: Order;
  id: number;
  loaded: boolean;

  constructor(private route: ActivatedRoute, private service: OrderService, private alertService: AlertMessageService) {
  }

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.initData();
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.get(this.id).subscribe(
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

  onChangeStatus(value) {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.putStatus(this.data, value).subscribe(
      res => {
        this.data.status = res.status;
        this.data.statusId = res.statusId;
        this.data.updatedAt = res.updatedAt;
        this.alertService.success(startTime, 'PUT');
      }, err => {
        this.alertService.failed(err);
      }
    );
  }


}
