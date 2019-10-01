import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { ChartOption, ErrorMessage } from '../../../common/const';
import { StatisticService } from '../../../services/statistic.service';
import { OrderStatistic } from '../../../models/statistic';
import { TimestampControl } from '../../../common/function';

interface IChartData {
  name: string;
  data: OrderStatistic[];
  color: string[];
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
  chartType = 'doughnut';

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
      data: []
    }

    this.genderChartData = {
      name: 'genderCanvas',
      color: [ChartOption.COLOR_GREEN, ChartOption.COLOR_ROSE],
      data: []
    }
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
      this.ageChartData.data = res;
      this.alertService.successResponse(startTime);
      this.initChart(this.ageChartData);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private initGenderData(fromDate: string, toDate: string) {
    const startTime = this.alertService.startTime();
    this.service.statisticCustomer('gender', fromDate, toDate).subscribe(res => {
      this.genderChartData.data = res;
      this.alertService.successResponse(startTime);
      this.initChart(this.genderChartData);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private calcChartValue(data: OrderStatistic[], value: string) {
    switch (value) {
      case 'order': return this.calcChartValueData(data, 'totalOrder', 'Total orders');
      case 'item': return this.calcChartValueData(data, 'totalItem', 'Total items sold');
      case 'price': return this.calcChartValueData(data, 'totalPrice', 'Total price sold');
      default: return null;
    }
  }

  private calcChartValueData(data: OrderStatistic[], property: string, chartTitle: string) {
    return {
      labels: data.map(x => x.property),
      data: data.map(x => x[property]),
      chartTitle: chartTitle + ' from ' + TimestampControl.jsonDate(this.fromDate) + ' to ' + TimestampControl.jsonDate(this.toDate)
    };
  }

  private initChart(chart: IChartData) {
    const chartData = this.calcChartValue(chart.data, this.selectedValue);
    this.chartTitle = chartData.chartTitle;

    // have tried to include chart as variable and failed miserably
    // better just use distinct variable for each chart and do not include in any interface
    switch (chart.name) {
      case 'ageCanvas':
        if (this.ageChart) this.ageChart.destroy();
        this.ageChart = new Chart(chart.name, {
          type: this.chartType,
          data: {
            labels: chartData.labels,
            datasets: [{ data: chartData.data, backgroundColor: chart.color, }]
          },
          options: ChartOption.DEFAULT_PIE_OPTION
        });
        return;

      case 'genderCanvas':
        if (this.genderChart) this.genderChart.destroy();
        this.genderChart = new Chart(chart.name, {
          type: this.chartType,
          data: {
            labels: chartData.labels,
            datasets: [{ data: chartData.data, backgroundColor: chart.color, }]
          },
          options: ChartOption.DEFAULT_PIE_OPTION
        });
        return;
    }
  }

}
