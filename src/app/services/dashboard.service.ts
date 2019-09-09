import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/http-client.service';
import {DashboardSummary, DashboardTop} from '../models/dashboard';
import {Endpoint} from '../common/const';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private endpoint = Endpoint.DASHBOARD;

  constructor(private httpService: HttpClientService) { }

  fetchTop(): Observable<DashboardTop> {
    return this.httpService.get(this.endpoint + '/top');
  }

  fetchCount(): Observable<DashboardSummary> {
    return this.httpService.get(this.endpoint + '/count');
  }

}
