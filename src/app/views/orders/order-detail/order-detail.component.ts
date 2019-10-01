import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order';
import { AuthService } from '../../../services/auth/auth.service';
import { DataControl } from '../../../common/function';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  data: Order;
  id: number;
  loaded: boolean;
  userRole: string;

  constructor(private route: ActivatedRoute, private router: Router, private service: OrderService, private alertService: AlertMessageService, private authService: AuthService) {
  }

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
        this.data = res;
        this.loaded = true;
        this.alertService.successResponse(startTime);
      },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  onChangeStatus(value: string) {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.putStatus(this.data, value).subscribe(
      res => {
        this.data = DataControl.remove(this.data, ['confirmedManager', 'completedManager']);
        this.data = DataControl.read(res, this.data, true);
        this.alertService.successResponse(startTime);
      }, err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  onDelete() {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.delete(this.id).subscribe(
      res => {
        this.alertService.successResponse(startTime);
        this.router.navigate(['/admin/books']);
      }, err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }
}
