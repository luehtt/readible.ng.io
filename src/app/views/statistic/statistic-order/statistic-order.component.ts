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
  error: string;
  data: OrderStatistic[];

  constructor(private formBuilder: FormBuilder, private service: StatisticService, private alertService: AlertMessageService) {}

  ngOnInit() {
    this.selectedReference = 'day';
    this.selectedRecent = 'fortnight';
    this.selectedValue = 'item';
    this.initOrderTimestamp();
  }

  selectValue() {
    this.renderChart();
  }

  selectRecent() {
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

  selectRange() {
    this.error = null;
    if (!this.fromDateNgb || !this.toDateNgb) { return; }
    this.fromDate = new Date(FormFunc.fromNgbDateToJson(this.fromDateNgb));
    this.toDate = new Date(FormFunc.fromNgbDateToJson(this.toDateNgb));

    if (this.fromDate >= this.toDate) { this.error = this.SELECTED_DATE_MISMATCHED; }
    if (this.selectedReference === 'day' && FormFunc.dateIsSameMonth(this.fromDate, this.toDate)) { this.error = this.DURATION_TOO_SHORT; }
    if (this.selectedReference === 'year' && FormFunc.dateIsSameYear(this.fromDate, this.toDate)) { this.error = this.DURATION_TOO_SHORT; }
    if (this.error) { return; }
    this.getData();
  }

  private initOrderTimestamp() {
    this.service.statisticOrderTimestamp().subscribe(res => {
      this.latestTimestamp = new Date(res.latestOrder.createdAt);
      this.oldestTimestamp = new Date(res.oldestOrder.createdAt);
      this.selectRecent();
    });
  }

  private getData() {
    this.alertService.clear();
    const fromDate = FormFunc.toJsonDate(this.fromDate);
    const toDate = FormFunc.toJsonDate(this.toDate);

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
        borderColor = ColorCode.DARK_GREEN;
        this.chartTitle = 'Total order ';
        break;
      case 'item':
        values = this.data.map(x => x.totalItem);
        borderColor = ColorCode.DEFAULT;
        this.chartTitle = 'Total items sold ';
        break;
      case 'price':
        values = this.data.map(x => x.totalPrice);
        borderColor = ColorCode.AMBER;
        this.chartTitle = 'Total price sold ';
        break;
    }

    // set title with selectedRange
    this.chartTitle += 'from ' + FormFunc.toJsonDate(this.fromDate) + ' to ' + FormFunc.toJsonDate(this.toDate);

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
