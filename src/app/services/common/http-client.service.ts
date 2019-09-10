import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {retry} from 'rxjs/operators';

import {Common} from '../../common/const';
import {SessionService} from './session.service';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  private endpoint = Common.SERVER_URL;
  private attempt = Common.RETRY_ATTEMPT;

  constructor(private httpClient: HttpClient, private sessionService: SessionService) {
  }

  public fetch(url: string): Observable<any> {
    return this.httpClient.get<any>(this.endpoint + url, {headers: this.initHeaders()}).pipe(retry(this.attempt));
  }

  public get(url: string): Observable<any> {
    return this.httpClient.get<any>(this.endpoint + url, {headers: this.initHeaders()}).pipe(retry(this.attempt));
  }

  public post(url: string, data: object): Observable<any> {
    return this.httpClient.post<any>(this.endpoint + url, data, { headers: this.initHeaders() }).pipe(retry(this.attempt));
  }

  public put(url: string, data: object): Observable<any> {
    return this.httpClient.put<any>(this.endpoint + url, data, { headers: this.initHeaders() }).pipe(retry(this.attempt));
  }

  public delete(url: string): Observable<any> {
    return this.httpClient.delete<any>(this.endpoint + url, {headers: this.initHeaders()}).pipe(retry(this.attempt));
  }

  public initHeaders() {
      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', 'Bearer ' + this.sessionService.getTokenSession());
      return headers;
  }

}
