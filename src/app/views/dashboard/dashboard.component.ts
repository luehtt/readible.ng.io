import { Component, OnInit } from '@angular/core';

import { DashboardService } from 'src/app/services/dashboard.service';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { DashboardSummary, DashboardTop } from '../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  top: DashboardTop;
  count: DashboardSummary;

  constructor(
    private service: DashboardService,
    private alertService: AlertMessageService,
  ) {}

  ngOnInit() {
    this.alertService.clear();

    const startTime1 = this.alertService.startTime();
    this.service.fetchCount().subscribe(res => {
      this.count = res;
      this.alertService.success(startTime1, 'GET');
    }, err => {
      this.alertService.failed(err);
    });

    const startTime2 = this.alertService.startTime();
    this.service.fetchTop().subscribe(res => {
      this.top = res;
      this.alertService.success(startTime2, 'GET');
    }, err => {
      this.alertService.failed(err);
    });

  }

}
