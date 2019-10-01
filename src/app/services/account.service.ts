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

  put(data, userRole: string): Observable<any> {
    return this.httpService.put(this.endpoint + '/' + userRole.toLowerCase(), data);
  }

  password(currentPassword: string, updatePassword: string): Observable<any> {
    return this.httpService.post('update-password', { currentPassword, updatePassword });
  }
}
