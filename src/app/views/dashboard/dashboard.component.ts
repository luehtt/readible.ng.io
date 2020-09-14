import { Component, OnInit } from '@angular/core';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { DashboardService } from 'src/app/services/dashboard.service';
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

  ngOnInit(): void {
    this.alertService.clear();
    this.initTopBook();
    this.initSummary();
  }

  private initTopBook(): void {
    const startTime = this.alertService.startTime();
    this.service.fetchSummary().subscribe(res => {
      this.count = res;
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private initSummary(): void {
    const startTime = this.alertService.startTime();
    this.service.fetchTopTen().subscribe(res => {
      this.top = res;
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }
}
