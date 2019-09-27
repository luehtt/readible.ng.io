import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {ChartOption, FormMessage} from '../../../common/const';
import {StatisticService} from '../../../services/statistic.service';
import {OrderStatistic} from '../../../models/statistic';
import {DataControl, TimestampControl} from '../../../common/function';

@Component({
  selector: 'app-statistic-orders',
  templateUrl: './statistic-order.component.html'
})
export class StatisticOrderComponent implements OnInit {

  chart: any;
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
  data: OrderStatistic[];

  constructor(private service: StatisticService, private alertService: AlertMessageService) {}

  ngOnInit() {
    this.selectedReference = 'day';
    this.selectedRecent = 'fortnight';
    this.selectedValue = 'item';
    this.initTimestamp();
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
    if (fromDate > toDate) { message = FormMessage.SELECTED_DATE_MISMATCHED; }
    if (reference === 'day' && TimestampControl.tooLongDay(fromDate, toDate)) { message = FormMessage.DURATION_TOO_LONG; }
    if (reference === 'day' && TimestampControl.tooLongDay(fromDate, toDate)) { message = FormMessage.DURATION_TOO_LONG; }
    if (reference === 'month' && TimestampControl.tooLongMonth(fromDate, toDate)) { message = FormMessage.DURATION_TOO_LONG; }
    if (reference === 'month' && TimestampControl.isSameMonth(fromDate, toDate)) { message = FormMessage.DURATION_TOO_SHORT; }
    if (reference === 'year' && TimestampControl.isSameYear(fromDate, toDate)) { message = FormMessage.DURATION_TOO_SHORT; }

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
      this.data = res;
      this.loaded = true;
      this.initChart();
      this.alertService.success(startTime, 'GET');
    });
  }

  private initChartData(data: OrderStatistic[], value: string) {
    switch (value) {
      case 'order': return this.initChartDataExtend(data, 'totalOrder', ChartOption.COLOR_BLUE, 'Total orders');
      case 'item': return this.initChartDataExtend(data, 'totalItem', ChartOption.COLOR_GREEN, 'Total items sold');
      case 'price': return this.initChartDataExtend(data, 'totalPrice', ChartOption.COLOR_AMBER, 'Total price sold');
      default: return null;
    }
  }

  private initChartDataExtend(data: OrderStatistic[], property: string, borderColor: string, chartTitle: string) {
    return {
      labels: this.selectedReference === 'day' ? this.data.map(x => x.key.substr(5, 5)) : this.data.map(x => x.key),
      data: data.map(x => x[property]),
      borderColor,
      chartTitle: chartTitle + ' from ' + TimestampControl.jsonDate(this.fromDate) + ' to ' + TimestampControl.jsonDate(this.toDate)
    };
  }

  private initChart() {
    if (this.chart) { this.chart.destroy(); }
    const chartData = this.initChartData(this.data, this.selectedValue);

    this.chartTitle = chartData.chartTitle;
    this.chart = new Chart('canvas', {
      type: ChartOption.CHART_LINE,
      data: {
        labels: chartData.labels,
        datasets: [ {
            data: chartData.data,
            borderColor: chartData.borderColor,
            backgroundColor: ChartOption.TRANSPARENT,
            steppedLine: ChartOption.STEP_MIDDLE
          } ]
      },
      options: ChartOption.DEFAULT_LINE_OPTION
    });
  }


}
