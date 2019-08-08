import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from '../common/http-client.service';
import {SessionService} from './session.service';
import {Const} from 'src/app/common/const';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpService: HttpClientService, private sessionService: SessionService) {
  }

  login(data): Observable<any> {
    return this.httpService.post('login', data);
  }

  register(data): Observable<any> {
    return this.httpService.post('register', data);
  }

  logout() {
    this.sessionService.clearTokenSession();
    window.location.href = Const.THIS_URL;
  }

  getToken(value: string): string {
    const token = this.sessionService.getTokenSessionJson();
    return token[value];
  }

  isLogged(): boolean {
    const expiration = localStorage.getItem('expired_at');
    if (!expiration) { return false; }

    if (new Date(expiration) < new Date()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('expired_at');
      return false;
    }

    const token = localStorage.getItem('access_token');
    return !!token;
  }

}
