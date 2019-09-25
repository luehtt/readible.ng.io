import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/http-client.service';
import {DashboardSummary, DashboardTopTen} from '../models/dashboard';
import {Endpoint} from '../common/const';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private endpoint = Endpoint.DASHBOARD;

  constructor(private httpService: HttpClientService) { }

  fetchTopten(): Observable<DashboardTopTen> {
    return this.httpService.get(this.endpoint + '/topten');
  }

  fetchSummary(): Observable<DashboardSummary> {
    return this.httpService.get(this.endpoint + '/summary');
  }

}
