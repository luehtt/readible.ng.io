import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/http-client.service';
import {DashboardSummary, DashboardTop} from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private endpointTop = 'dashboard/top';
  private endpointCount = 'dashboard/count';

  constructor(private httpService: HttpClientService) { }

  fetchTop(): Observable<DashboardTop> {
    return this.httpService.get(this.endpointTop);
  }

  fetchCount(): Observable<DashboardSummary> {
    return this.httpService.get(this.endpointCount);
  }

}
