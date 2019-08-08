import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/http-client.service';
import {Manager, ManagerUser} from '../models/manager';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  private endpoint = 'managers';

  constructor(private httpService: HttpClientService) { }

  fetch(): Observable<Manager[]> {
    return this.httpService.fetch(this.endpoint);
  }

  get(id: number): Observable<ManagerUser> {
    return this.httpService.get(this.endpoint + '/' + id);
  }

  auth(): Observable<Manager> {
    return this.httpService.post(this.endpoint, null);
  }

  register(data): Observable<any> {
    return this.httpService.post('register/manager', data);
  }
}
