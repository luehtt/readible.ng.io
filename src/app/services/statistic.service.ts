import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClientService } from './common/http-client.service';
import { OrderStatistic } from '../models/statistic';
import { Endpoint } from '../common/const';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  private endpoint = Endpoint.STATISTIC;

  constructor(private httpService: HttpClientService) { }

  statisticCustomer(reference: string, fromDate: string, toDate: string): Observable<OrderStatistic[]> {
    return this.httpService.get(`${this.endpoint}/customers?reference=${reference}&fromDate=${fromDate}&toDate=${toDate}`);
  }

  statisticOrder(reference: string, fromDate: string, toDate: string): Observable<OrderStatistic[]> {
    return this.httpService.get(`${this.endpoint}/orders?reference=${reference}&fromDate=${fromDate}&toDate=${toDate}`);
  }

  statisticOrderTimestamp(): Observable<any> {
    return this.httpService.get(`${this.endpoint}/orders-timestamp`);
  }
}
