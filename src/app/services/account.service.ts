import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/http-client.service';
import {SessionService} from './auth/session.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private endpoint = 'accounts';

  constructor(private httpService: HttpClientService, private sessionService: SessionService) { }

  get(): Observable<any> {
    return this.httpService.get(this.endpoint);
  }

  put(data: any): Observable<any> {
    const json = this.sessionService.getTokenSessionJson();
    return this.httpService.put(this.endpoint + '/' + json.role.toLowerCase(), data);
  }

  postPassword(currentPassword: string, updatePassword: string): Observable<any> {
    return this.httpService.post('update-password', {currentPassword, updatePassword});
  }
}
