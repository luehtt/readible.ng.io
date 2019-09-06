import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {ChartOption, FormMessage} from '../../../common/const';
import {StatisticService} from '../../../services/statistic.service';
import {OrderStatistic} from '../../../models/statistic';
import {DataFunc} from '../../../common/function';

@Component({
  selector: 'app-statistic-orders',
  templateUrl: './statistic-order.component.html'
})
export class StatisticOrderComponent implements OnInit {

  DURATION_TOO_LONG = FormMessage.DURATION_TOO_LONG;
  DURATION_TOO_SHORT = FormMessage.DURATION_TOO_SHORT;
  SELECTED_DATE_MISMATCHED = FormMessage.SELECTED_DATE_MISMATCHED;

  chart: any;
  chartTitle: string;
  chartOption = ChartOption.DEFAULT_LINE_OPTION;

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
      case 'week': return this.setRecentDuration(this.selectedRecent, 7);
      case 'fortnight': return this.setRecentDuration(this.selectedRecent, 14);
      case 'month': return this.setRecentDuration(this.selectedRecent, 30);
      case 'year': return this.setRecentDuration(this.selectedRecent, 365);
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
    this.fromDate = new Date(DataFunc.fromNgbDateToJson(this.fromDateNgb));
    this.toDate = new Date(DataFunc.fromNgbDateToJson(this.toDateNgb));
    if (!this.validateReference(this.selectedReference, this.fromDate, this.toDate)) { return; }
    this.initData();
  }

  private validateReference(reference: string, from: Date, to: Date) {
    let message: string;
    if (reference === 'day' && DataFunc.tooLongDay(from, to)) { message = this.DURATION_TOO_LONG };
    if (reference === 'day' && DataFunc.tooLongDay(from, to)) { message = this.DURATION_TOO_LONG };
    if (reference === 'month' && DataFunc.tooLongMonth(from, to)) { message = this.DURATION_TOO_LONG };
    if (reference === 'month' && DataFunc.isSameMonth(from, to)) { message = this.DURATION_TOO_SHORT };
    if (reference === 'year' && DataFunc.isSameYear(from, to)) { message = this.DURATION_TOO_SHORT };

    if (!message) return true;
    this.alertService.set(message, 'danger');
    return false;
  }

  private initData() {
    this.alertService.clear();
    const fromDate = DataFunc.jsonDate(this.fromDate);
    const toDate = DataFunc.jsonDate(this.toDate);

    const startTime = this.alertService.startTime();
    this.service.statisticOrder(this.selectedReference, fromDate, toDate).subscribe(res => {
      this.data = res;
      this.loaded = true;
      this.initChart();
      this.alertService.success(startTime, 'GET');
    });
  }

  private initChartData(value: string) {
    switch (value) {
      case 'order': return this.initChartDataExtend(this.data, 'totalOrder', Chart.BLUE, 'Total orders');
      case 'item': return this.initChartDataExtend(this.data, 'totalItem', Chart.BLUE, 'Total items sold');
      case 'price': return this.initChartDataExtend(this.data, 'totalPrice', Chart.BLUE, 'Total price sold');
      default: return null;
    }
  }

  private initChartDataExtend(data, property: string, borderColor: string, chartTitle: string) {
    return {
      labels: this.selectedReference === 'day' ? this.data.map(x => x.key.substr(0, 10)) : this.data.map(x => x.key),
      data: data.map(x => x[property]),
      borderColor: borderColor,
      chartTitle: chartTitle + ' from ' + DataFunc.jsonDate(this.fromDate) + ' to ' + DataFunc.jsonDate(this.toDate)
    }
  }

  private initChart() {
    if (this.chart) { this.chart.destroy(); }
    const chartData = this.initChartData(this.selectedValue);

    // init line chart
    this.chartTitle = chartData.chartTitle;
    this.chart = new Chart(ChartOption.CANVAS, {
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
      options: this.chartOption
    });
  }


}
