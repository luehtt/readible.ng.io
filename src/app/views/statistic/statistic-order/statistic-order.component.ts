import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { ChartOption, ErrorMessage } from '../../../common/const';
import { StatisticService } from '../../../services/statistic.service';
import { TimestampControl } from '../../../common/function';

interface IChartData {
  name: string;
  color: string;
  title: string;
  labels: string[];
  data: any[];
  responseData: any[];
}

@Component({
  selector: 'app-statistic-orders',
  templateUrl: './statistic-order.component.html'
})
export class StatisticOrderComponent implements OnInit {

  chart: Chart;
  chartData: IChartData;
  chartTitle: string;

  loaded: boolean;
  fromDate: Date;
  toDate: Date;
  fromDateNgb: any;
  toDateNgb: any;

  selectedValue: string;
  selectedReference: string;
  selectedRecent: string;
  latestTimestamp: Date;
  oldestTimestamp: Date;

  constructor(private service: StatisticService, private alertService: AlertMessageService) { }

  ngOnInit() {
    this.selectedReference = 'day';
    this.selectedRecent = 'fortnight';
    this.selectedValue = 'item';
    this.initTimestamp();
    this.initChartData();
  }

  private initChartData() {
    this.chartData = {
      name: 'canvas',
      color: null,
      title: null,
      labels: [],
      data: [],
      responseData: [],
    };
  }

  private initTimestamp() {
    this.service.statisticOrderTimestamp().subscribe(res => {
      this.latestTimestamp = new Date(res.latestOrder.createdAt);
      this.oldestTimestamp = new Date(res.oldestOrder.createdAt);
      this.onSelectRecent();
    });
  }

  onSelectValue() {
    this.initChart();
  }

  onSelectRecent() {
    const toDate = new Date();
    this.toDate = toDate < this.latestTimestamp ? toDate : this.latestTimestamp;
    this.fromDate = new Date();

    switch (this.selectedRecent) {
      case 'week': return this.setRecentDuration('day', 7);
      case 'fortnight': return this.setRecentDuration('day', 14);
      case 'month': return this.setRecentDuration('day', 30);
      case 'year': return this.setRecentDuration('month', 365);
      default: return this.initData();
    }
  }

  private setRecentDuration(reference: string, offset: number) {
    this.selectedReference = reference;
    this.fromDate.setDate(this.toDate.getDate() - offset);
    if (this.fromDate < this.oldestTimestamp) { this.fromDate = this.oldestTimestamp; }
    return this.initData();
  }

  onSelectRange() {
    if (!this.fromDateNgb || !this.toDateNgb) { return; }
    this.fromDate = new Date(TimestampControl.fromNgbDateToJson(this.fromDateNgb));
    this.toDate = new Date(TimestampControl.fromNgbDateToJson(this.toDateNgb));
    if (!this.validateReference(this.selectedReference, this.fromDate, this.toDate)) { return; }
    this.initData();
  }

  private validateReference(reference: string, fromDate: Date, toDate: Date) {
    this.alertService.clear();
    let message: string;
    if (fromDate > toDate) { message = ErrorMessage.SELECTED_DATE_MISMATCHED; }
    if (reference === 'day' && TimestampControl.tooLongDay(fromDate, toDate)) { message = ErrorMessage.DURATION_TOO_LONG; }
    if (reference === 'day' && TimestampControl.tooLongDay(fromDate, toDate)) { message = ErrorMessage.DURATION_TOO_LONG; }
    if (reference === 'month' && TimestampControl.tooLongMonth(fromDate, toDate)) { message = ErrorMessage.DURATION_TOO_LONG; }
    if (reference === 'month' && TimestampControl.isSameMonth(fromDate, toDate)) { message = ErrorMessage.DURATION_TOO_SHORT; }
    if (reference === 'year' && TimestampControl.isSameYear(fromDate, toDate)) { message = ErrorMessage.DURATION_TOO_SHORT; }

    if (!message) { return true; }
    this.alertService.set(message, 'danger');
    return false;
  }

  private initData() {
    this.alertService.clear();
    const fromDate = TimestampControl.jsonDate(this.fromDate);
    const toDate = TimestampControl.jsonDate(this.toDate);

    const startTime = this.alertService.startTime();
    this.service.statisticOrder(this.selectedReference, fromDate, toDate).subscribe(res => {
      this.chartData.responseData = res;
      this.loaded = true;
      this.initChart();
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private calcChartTitle(data: IChartData, value: string): IChartData {
    switch (value) {
      case 'order': return this.calcChartData(data, 'totalOrder', ChartOption.COLOR_BLUE, 'Total orders');
      case 'item': return this.calcChartData(data, 'totalItem', ChartOption.COLOR_GREEN, 'Total items sold');
      case 'price': return this.calcChartData(data, 'totalPrice', ChartOption.COLOR_AMBER, 'Total price sold');
      default: return null;
    }
  }

  private calcChartData(data: IChartData, property: string, color: string, title: string): IChartData {
    data.labels = data.responseData.map(x => x.property);
    data.data = data.responseData.map(x => x[property]);
    data.color = color;
    data.title = title + ' from ' + TimestampControl.jsonDate(this.fromDate) + ' to ' + TimestampControl.jsonDate(this.toDate);
    return data;
  }

  private initChart() {
    if (this.chart) { this.chart.destroy(); }
    const data = this.calcChartTitle(this.chartData, this.selectedValue);

    this.chartTitle = data.title;
    this.chart = new Chart(data.name, {
      type: ChartOption.CHART_LINE,
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          borderColor: data.color,
          backgroundColor: ChartOption.TRANSPARENT,
          steppedLine: 'middle'
        }]
      },
      options: ChartOption.DEFAULT_LINE_OPTION
    });
  }

}
