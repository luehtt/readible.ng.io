import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Chart } from 'chart.js';

import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {ColorCode, FormMessage} from '../../../common/const';
import {StatisticService} from '../../../services/statistic.service';
import {OrderStatistic} from '../../../models/statistic';
import {FormFunc} from '../../../common/function';

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
  chartOption = {
    responsive: true,
    maintainAspectRatio: false,
    legend: { display: false },
    scales: { xAxes: [{ display: true }], yAxes: [{ display: true }] },
    elements: { line: { tension: 0 } },
    animation: { duration: 0 }
  };

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

  constructor(private formBuilder: FormBuilder, private service: StatisticService, private alertService: AlertMessageService) {}

  ngOnInit() {
    this.selectedReference = 'day';
    this.selectedRecent = 'fortnight';
    this.selectedValue = 'item';
    this.initTimestamp();
  }

  onSelectValue() {
    this.renderChart();
  }

  onSelectRecent() {
    const toDate = new Date();
    this.toDate = toDate < this.latestTimestamp ? toDate : this.latestTimestamp;
    this.fromDate = new Date();
    switch (this.selectedRecent) {
      case 'week':
        this.selectedReference = 'day';
        this.fromDate.setDate(this.toDate.getDate() - 7);
        if (this.fromDate < this.oldestTimestamp) { this.fromDate = this.oldestTimestamp; }
        return this.getData();
      case 'fortnight':
        this.selectedReference = 'day';
        this.fromDate.setDate(this.toDate.getDate() - 14);
        if (this.fromDate < this.oldestTimestamp) { this.fromDate = this.oldestTimestamp; }
        return this.getData();
      case 'month':
        this.selectedReference = 'day';
        this.fromDate.setDate(this.toDate.getDate() - 30);
        if (this.fromDate < this.oldestTimestamp) { this.fromDate = this.oldestTimestamp; }
        return this.getData();
      case 'year':
        this.selectedReference = 'month';
        this.fromDate.setDate(this.toDate.getDate() - 365);
        if (this.fromDate < this.oldestTimestamp) { this.fromDate = this.oldestTimestamp; }
        return this.getData();
      default:
        return this.getData();
    }
  }

  onSelectRange() {
    if (!this.fromDateNgb || !this.toDateNgb) { return; }
    this.fromDate = new Date(FormFunc.fromNgbDateToJson(this.fromDateNgb));
    this.toDate = new Date(FormFunc.fromNgbDateToJson(this.toDateNgb));

    this.alertService.clear();
    if (this.fromDate >= this.toDate) { this.alertService.set(this.SELECTED_DATE_MISMATCHED, 'warning'); }
    if (this.selectedReference === 'day' && FormFunc.tooLongDay(this.fromDate, this.toDate)) { this.alertService.set(this.DURATION_TOO_LONG, 'warning'); }
    if (this.selectedReference === 'month' && FormFunc.tooLongMonth(this.fromDate, this.toDate)) { this.alertService.set(this.DURATION_TOO_LONG, 'warning'); }
    if (this.selectedReference === 'month' && FormFunc.isSameMonth(this.fromDate, this.toDate)) { this.alertService.set(this.DURATION_TOO_SHORT, 'warning'); }
    if (this.selectedReference === 'year' && FormFunc.isSameYear(this.fromDate, this.toDate)) { this.alertService.set(this.DURATION_TOO_SHORT, 'warning'); }
    if (this.alertService.hasMessage()) { return; }
    this.getData();
  }

  private initTimestamp() {
    this.service.statisticOrderTimestamp().subscribe(res => {
      this.latestTimestamp = new Date(res.latestOrder.createdAt);
      this.oldestTimestamp = new Date(res.oldestOrder.createdAt);
      this.onSelectRecent();
    });
  }

  private getData() {
    this.alertService.clear();
    const fromDate = FormFunc.jsonDate(this.fromDate);
    const toDate = FormFunc.jsonDate(this.toDate);

    const startTime = this.alertService.startTime();
    this.service.statisticOrder(this.selectedReference, fromDate, toDate).subscribe(res => {
      this.data = res;
      this.renderChart();
      this.alertService.success(startTime, 'GET');
    });
  }

  private renderChart() {
    if (this.chart) { this.chart.destroy(); }

    let labels = [];
    switch (this.selectedReference) {
      case 'day': labels = this.data.map(x => x.key.substr(0, 10)); break;
      default: labels = this.data.map(x => x.key); break;
    }

    let values = [];
    let borderColor = '';

    // set title with selectedValue
    switch (this.selectedValue) {
      case 'order':
        values = this.data.map(x => x.totalOrder);
        borderColor = ColorCode.GREEN;
        this.chartTitle = 'Total order ';
        break;
      case 'item':
        values = this.data.map(x => x.totalItem);
        borderColor = ColorCode.BLUE;
        this.chartTitle = 'Total items sold ';
        break;
      case 'price':
        values = this.data.map(x => x.totalPrice);
        borderColor = ColorCode.AMBER;
        this.chartTitle = 'Total price sold ';
        break;
    }

    // set title with selectedRange
    this.chartTitle += 'from ' + FormFunc.jsonDate(this.fromDate) + ' to ' + FormFunc.jsonDate(this.toDate);

    // init line chart
    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels,
        datasets: [ {
            data: values,
            borderColor,
            backgroundColor: 'transparent',
            steppedLine: 'middle'
          } ]
      },
      options: this.chartOption
    });
  }


}
