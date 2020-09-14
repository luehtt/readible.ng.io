import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endpoint } from '../common/const';
import { DashboardSummary, DashboardTopTen } from '../models/dashboard';
import { HttpClientService } from './common/http-client.service';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private endpoint = Endpoint.DASHBOARD;

  constructor(private httpService: HttpClientService) { }

  fetchTopTen(): Observable<DashboardTopTen> {
    return this.httpService.get(this.endpoint + '/topten');
  }

  fetchSummary(): Observable<DashboardSummary> {
    return this.httpService.get(this.endpoint + '/summary');
  }

}
