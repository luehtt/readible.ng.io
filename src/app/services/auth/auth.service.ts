import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClientService } from '../common/http-client.service';
import { SessionService } from '../common/session.service';


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

  logout(): void {
    this.sessionService.clearTokenSession();
    window.location.href = environment.thisUrl;
  }

  getToken(value: string): string {
    const token = this.sessionService.getTokenSessionJson();
    return !token || !token[value] ? null : token[value];
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
