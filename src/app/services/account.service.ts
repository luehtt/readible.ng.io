import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClientService } from './common/http-client.service';
import { Endpoint } from '../common/const';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private endpoint = Endpoint.ACCOUNT;

  constructor(private httpService: HttpClientService) { }

  get(): Observable<any> {
    return this.httpService.get(this.endpoint);
  }

  put(data: any, userRole: string): Observable<any> {
    userRole = userRole.toLowerCase() === 'admin' ? 'manager' : userRole.toLowerCase();
    return this.httpService.put(this.endpoint + '/' + userRole, data);
  }

  password(currentPassword: string, updatePassword: string): Observable<any> {
    return this.httpService.post('update-password', { currentPassword, updatePassword });
  }
}
