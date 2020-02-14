import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { ChartOption, ErrorMessage } from '../../../common/const';
import { StatisticService } from '../../../services/statistic.service';
import { TimestampControl } from '../../../common/function';

interface IChartData {
  name: string;
  color: string[];
  title: string;
  labels: string[];
  data: any[];
  responseData: any[];
}

@Component({
  selector: 'app-statistic-customers',
  templateUrl: './statistic-customer.component.html'
})
export class StatisticCustomerComponent implements OnInit {
  fromDate: Date;
  toDate: Date;
  fromDateNgb: any;
  toDateNgb: any;
  selectedValue: string;
  latestTimestamp: Date;
  oldestTimestamp: Date;

  ageChartData: IChartData;
  genderChartData: IChartData;
  ageChart: Chart;
  genderChart: Chart;
  chartTitle: string;

  constructor(private service: StatisticService, private alertService: AlertMessageService) { }

  ngOnInit() {
    this.selectedValue = 'item';
    this.initTimestamp();
    this.initIChartData();
  }

  private initIChartData() {
    this.ageChartData = {
      name: 'ageCanvas',
      color: [ChartOption.COLOR_RED, ChartOption.COLOR_GREEN, ChartOption.COLOR_BLUE, ChartOption.COLOR_AMBER],
      data: [],
      responseData: [],
      title: null,
      labels: []
    };

    this.genderChartData = {
      name: 'genderCanvas',
      color: [ChartOption.COLOR_GREEN, ChartOption.COLOR_ROSE],
      data: [],
      responseData: [],
      title: null,
      labels: []
    };
  }

  private initTimestamp() {
    this.service.statisticOrderTimestamp().subscribe(res => {
      this.latestTimestamp = new Date(res.latestOrder.createdAt);
      this.oldestTimestamp = new Date(res.oldestOrder.createdAt);
      this.initDatetime();
    });
  }

  private initDatetime() {
    this.toDate = new Date();
    this.toDate = this.toDate < this.latestTimestamp ? this.toDate : this.latestTimestamp;
    this.fromDate = new Date();
    this.fromDate.setDate(this.toDate.getDate() - 30);
    this.onSelectValue();
  }

  onSelectValue() {
    this.initData();
  }

  onSelectRange() {
    if (!this.fromDateNgb || !this.toDateNgb) { return; }
    this.fromDate = new Date(TimestampControl.fromNgbDateToJson(this.fromDateNgb));
    this.toDate = new Date(TimestampControl.fromNgbDateToJson(this.toDateNgb));

    this.alertService.clear();
    if (this.fromDate >= this.toDate) { this.alertService.set(ErrorMessage.SELECTED_DATE_MISMATCHED, 'warning'); }
    if (this.alertService.hasMessage()) { return; }
    this.initData();
  }

  private initData() {
    this.alertService.clear();
    const fromDate = TimestampControl.jsonDate(this.fromDate);
    const toDate = TimestampControl.jsonDate(this.toDate);
    this.initAgeData(fromDate, toDate);
    this.initGenderData(fromDate, toDate);
  }

  private initAgeData(fromDate: string, toDate: string) {
    const startTime = this.alertService.startTime();
    this.service.statisticCustomer('age', fromDate, toDate).subscribe(res => {
      this.ageChartData.responseData = res;
      this.initAgeChart();
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private initGenderData(fromDate: string, toDate: string) {
    const startTime = this.alertService.startTime();
    this.service.statisticCustomer('gender', fromDate, toDate).subscribe(res => {
      this.genderChartData.responseData = res;
      this.initGenderChart();
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private caclChartTitle(data: IChartData, value: string) {
    switch (value) {
      case 'order': return this.calcChartData(data, 'totalOrder', 'Total orders');
      case 'item': return this.calcChartData(data, 'totalItem', 'Total items sold');
      case 'price': return this.calcChartData(data, 'totalPrice', 'Total price sold');
      default: return data;
    }
  }

  private calcChartData(data: IChartData, property: string, title: string): IChartData {
    data.labels = data.responseData.map(x => x.property);
    data.data = data.responseData.map(x => x[property]);
    data.title = title + ' from ' + TimestampControl.jsonDate(this.fromDate) + ' to ' + TimestampControl.jsonDate(this.toDate);
    return data;
  }

  private initAgeChart() {
    const thisData = this.caclChartTitle(this.ageChartData, this.selectedValue);
    this.chartTitle = thisData.title;

    if (this.ageChart) { this.ageChart.destroy(); }
    this.ageChart = new Chart(thisData.name, {
      type: ChartOption.CHART_DOUGHNUT,
      data: {
        labels: thisData.labels,
        datasets: [{ data: thisData.data, backgroundColor: thisData.color }]
      },
      options: ChartOption.DEFAULT_PIE_OPTION
    });
  }

  private initGenderChart() {
    const thisData = this.caclChartTitle(this.genderChartData, this.selectedValue);
    this.chartTitle = thisData.title;

    if (this.genderChart) { this.genderChart.destroy(); }
    this.genderChart = new Chart(thisData.name, {
      type: ChartOption.CHART_DOUGHNUT,
      data: {
        labels: thisData.labels,
        datasets: [{ data: thisData.data, backgroundColor: thisData.color }]
      },
      options: ChartOption.DEFAULT_PIE_OPTION
    });
  }

}
