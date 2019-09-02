import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Chart } from 'chart.js';

import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {ColorCode, FormMessage} from '../../../common/const';
import {StatisticService} from '../../../services/statistic.service';
import {OrderStatistic} from '../../../models/statistic';
import {DataFunc, FormFunc} from '../../../common/function';

@Component({
  selector: 'app-statistic-customers',
  templateUrl: './statistic-customer.component.html'
})
export class StatisticCustomerComponent implements OnInit {
  SELECTED_DATE_MISMATCHED = FormMessage.SELECTED_DATE_MISMATCHED;

  ageChart: any;
  genderChart: any;
  chartTitle: string;
  chartOption = {
    responsive: true,
    maintainAspectRatio: false,
    legend: { display: true, position: 'bottom' },
    scales: { xAxes: [{ display: false }], yAxes: [{ display: false }] },
    elements: { line: { tension: 0 } },
    animation: { duration: 0 }
  };

  fromDate: Date;
  toDate: Date;
  fromDateNgb: any;
  toDateNgb: any;
  selectedValue: string;
  latestTimestamp: Date;
  oldestTimestamp: Date;
  ageData: OrderStatistic[];
  genderData: OrderStatistic[];

  constructor(private formBuilder: FormBuilder, private service: StatisticService, private alertService: AlertMessageService) {}

  ngOnInit() {
    this.selectedValue = 'item';
    this.initOrderTimestamp();
  }

  onSelectValue() {
    this.getData();
  }

  onSelectRange() {
    if (!this.fromDateNgb || !this.toDateNgb) { return; }
    this.fromDate = new Date(FormFunc.fromNgbDateToJson(this.fromDateNgb));
    this.toDate = new Date(FormFunc.fromNgbDateToJson(this.toDateNgb));

    this.alertService.clear();
    if (this.fromDate >= this.toDate) { this.alertService.set(this.SELECTED_DATE_MISMATCHED, 'warning'); }
    if (this.alertService.hasMessage()) { return; }
    this.getData();
  }

  private initOrderTimestamp() {
    this.service.statisticOrderTimestamp().subscribe(res => {
      this.latestTimestamp = new Date(res.latestOrder.createdAt);
      this.oldestTimestamp = new Date(res.oldestOrder.createdAt);

      const toDate = new Date();
      this.toDate = toDate < this.latestTimestamp ? toDate : this.latestTimestamp;
      this.fromDate = new Date();
      this.fromDate.setDate(this.toDate.getDate() - 30);
      this.onSelectValue();
    });
  }

  private getData() {
    this.alertService.clear();
    const fromDate = FormFunc.jsonDate(this.fromDate);
    const toDate = FormFunc.jsonDate(this.toDate);

    const startTime1 = this.alertService.startTime();
    this.service.statisticCustomer('age', fromDate, toDate).subscribe(res => {
      this.ageData = res;
      this.renderAgeChart();
      this.alertService.success(startTime1, 'GET');
    });

    const startTime2 = this.alertService.startTime();
    this.service.statisticCustomer('gender', fromDate, toDate).subscribe(res => {
      this.genderData = res;
      this.renderGenderChart();
      this.alertService.success(startTime2, 'GET');
    });
  }

  private renderAgeChart() {
    if (this.ageChart) { this.ageChart.destroy(); }

    const labels = [];
    const values = [];
    for (const i in this.ageData) { if (this.ageData[i]) { labels.push(DataFunc.normalize(i, true)); } }

    // set title with selectedValue
    switch (this.selectedValue) {
      case 'order':
        for (const i in this.ageData) { if (this.ageData[i]) { values.push(this.ageData[i].totalOrder); } }
        this.chartTitle = 'Total order ';
        break;
      case 'item':
        for (const i in this.ageData) { if (this.ageData[i]) { values.push(this.ageData[i].totalItem); } }
        this.chartTitle = 'Total items sold ';
        break;
      case 'price':
        for (const i in this.ageData) { if (this.ageData[i]) { values.push(this.ageData[i].totalPrice); } }
        this.chartTitle = 'Total price sold ';
        break;
    }

    // set title with selectedRange
    this.chartTitle += ' from ' + FormFunc.jsonDate(this.fromDate) + ' to ' + FormFunc.jsonDate(this.toDate);

    // init doughnut chart
    this.ageChart = new Chart('ageCanvas', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [ {
          data: values,
          backgroundColor: [ColorCode.RED, ColorCode.GREEN, ColorCode.BLUE, ColorCode.AMBER],
          steppedLine: 'middle'
        } ]
      },
      options: this.chartOption
    });
  }

  private renderGenderChart() {
    if (this.genderChart) { this.genderChart.destroy(); }

    const labels = [];
    const values = [];
    for (const i in this.genderData) { if (this.genderData[i]) { labels.push(DataFunc.normalize(i, true)); } }

    // set title with selectedValue
    switch (this.selectedValue) {
      case 'order':
        for (const i in this.genderData) { if (this.genderData[i]) { values.push(this.genderData[i].totalOrder); } }
        this.chartTitle = 'Total order ';
        break;
      case 'item':
        for (const i in this.genderData) { if (this.genderData[i]) { values.push(this.genderData[i].totalItem); } }
        this.chartTitle = 'Total items sold ';
        break;
      case 'price':
        for (const i in this.genderData) { if (this.genderData[i]) { values.push(this.genderData[i].totalPrice); } }
        this.chartTitle = 'Total price sold ';
        break;
    }

    // set title with selectedRange
    this.chartTitle += ' from ' + FormFunc.jsonDate(this.fromDate) + ' to ' + FormFunc.jsonDate(this.toDate);

    // init doughnut chart
    this.genderChart = new Chart('genderCanvas', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [ {
          data: values,
          backgroundColor: [ColorCode.VIOLET, ColorCode.ROSE],
          steppedLine: 'middle'
        } ]
      },
      options: this.chartOption
    });
  }

}
