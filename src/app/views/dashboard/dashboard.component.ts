import { Component, OnInit } from '@angular/core';

import { DashboardService } from 'src/app/services/dashboard.service';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { DashboardSummary, DashboardTopTen } from '../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  top: DashboardTopTen;
  count: DashboardSummary;

  constructor(
    private service: DashboardService,
    private alertService: AlertMessageService,
  ) {}

  ngOnInit() {
    this.alertService.clear();
    this.initTopBook();
    this.initSummary();
  }

  private initTopBook() {
    const startTime = this.alertService.startTime();
    this.service.fetchSummary().subscribe(res => {
      this.count = res;
      this.alertService.success(startTime, 'GET');
    }, err => {
      this.alertService.failed(err);
    });
  }

  private initSummary() {
    const startTime = this.alertService.startTime();
    this.service.fetchTopten().subscribe(res => {
      this.top = res;
      this.alertService.success(startTime, 'GET');
    }, err => {
      this.alertService.failed(err);
    });
  }
}
