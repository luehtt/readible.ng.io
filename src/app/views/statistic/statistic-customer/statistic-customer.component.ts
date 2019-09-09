import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Chart } from 'chart.js';

import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {ChartOption, FormMessage} from '../../../common/const';
import {StatisticService} from '../../../services/statistic.service';
import {OrderStatistic} from '../../../models/statistic';
import {DataFunc, ControlFunc} from '../../../common/function';

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
  ageData: OrderStatistic[];
  genderData: OrderStatistic[];

  ageChart: any;
  genderChart: any;
  chartTitle: string;
  ageChartColor = [Chart.RED, Chart.GREEN, Chart.BLUE, Chart.AMBER];
  genderChartColor = [Chart.VIOLET, Chart.ROSE];

  constructor(private formBuilder: FormBuilder, private service: StatisticService, private alertService: AlertMessageService) {}

  ngOnInit() {
    this.selectedValue = 'item';
    this.initTimestamp();
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
    this.fromDate = new Date(ControlFunc.fromNgbDateToJson(this.fromDateNgb));
    this.toDate = new Date(ControlFunc.fromNgbDateToJson(this.toDateNgb));

    this.alertService.clear();
    if (this.fromDate >= this.toDate) { this.alertService.set(FormMessage.SELECTED_DATE_MISMATCHED, 'warning'); }
    if (this.alertService.hasMessage()) { return; }
    this.initData();
  }

  private initData() {
    const fromDate = ControlFunc.jsonDate(this.fromDate);
    const toDate = ControlFunc.jsonDate(this.toDate);
    this.initAgeData(fromDate, toDate);
    this.initGenderData(fromDate, toDate);
  }

  private initAgeData(fromDate, toDate) {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.statisticCustomer('age', fromDate, toDate).subscribe(res => {
      this.ageData = res;
      this.alertService.success(startTime, 'GET');
      this.initChart(this.ageChart, this.ageData, this.ageChartColor);
    });
  }

  private initGenderData(fromDate, toDate) {
    const startTime = this.alertService.startTime();
    this.service.statisticCustomer('gender', fromDate, toDate).subscribe(res => {
      this.genderData = res;
      this.alertService.success(startTime, 'GET');
      this.initChart(this.genderChart, this.genderData, this.genderChartColor);
    });
  }

  private initChartData(data: OrderStatistic[], value: string) {
    switch (value) {
      case 'order': return this.initChartDataExtend(data, 'totalOrder', 'Total orders');
      case 'item': return this.initChartDataExtend(data, 'totalItem', 'Total items sold');
      case 'price': return this.initChartDataExtend(data, 'totalPrice', 'Total price sold');
      default: return null;
    }
  }

  private initChartDataExtend(data, property: string, chartTitle: string) {
    return {
      labels: data.map(x => x.key),
      data: data.map(x => x[property]),
      chartTitle: chartTitle + ' from ' + ControlFunc.jsonDate(this.fromDate) + ' to ' + ControlFunc.jsonDate(this.toDate)
    };
  }

  private initChart(chart, data: OrderStatistic[], colors: string[]) {
    if (chart) { chart.destroy(); }
    const chartData = this.initChartData(data, this.selectedValue);

    // init doughnut chart
    this.chartTitle = chartData.chartTitle;
    this.ageChart = new Chart('ageCanvas', {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [ {
          data: chartData.data,
          backgroundColor: colors,
        } ]
      },
      options: ChartOption.DEFAULT_PIE_OPTION
    });
  }

}
