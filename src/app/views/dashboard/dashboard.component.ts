import { Component, OnInit } from '@angular/core';

import { DashboardService } from 'src/app/services/dashboard.service';
import { AlertService } from 'src/app/services/common/alert.service';
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
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.alertService.clear();

    this.service.fetchCount().subscribe(res => {
      this.count = res;
    }, err => {
      this.alertService.failed(err);
    });

    this.service.fetchTop().subscribe(res => {
      this.top = res;
    }, err => {
      this.alertService.failed(err);
    });

  }

}
