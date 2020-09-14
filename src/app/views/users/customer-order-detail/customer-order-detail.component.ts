import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataControl } from 'src/app/common/function';
import { Order } from 'src/app/models/order';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { OrderService } from 'src/app/services/order.service';


@Component({
  selector: 'app-customer-order-detail',
  templateUrl: './customer-order-detail.component.html'
})
export class CustomerOrderDetailComponent implements OnInit {

  data: Order;
  id: number;

  constructor(private route: ActivatedRoute, private router: Router, private service: OrderService, private alertService: AlertMessageService) {
  }

  ngOnInit(): void {
    this.alertService.clear();
    this.id = this.getParam();
    if (!this.id) { return; }
    this.initData();
  }

  private getParam(): number | null {
    const value = this.route.snapshot.paramMap.get('id');

    if (DataControl.isDigit(value)) {
      const res = parseInt(value, 10);
      if (!isNaN(res)) { return res; }
      return this.getParamFailed(value);
    } else {
      return this.getParamFailed(value);
    }
  }

  private getParamFailed(parameter: string): null {
    this.alertService.mismatchParameter(parameter);
    return null;
  }

  private initData(): void {
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(
      res => {
        this.data = res;
        this.alertService.successResponse(startTime);
      },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  onDelete(): void {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.delete(this.id).subscribe(
      res => {
        this.alertService.successResponse(startTime);
        this.router.navigate(['/customer/orders']);
      }, err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

}
