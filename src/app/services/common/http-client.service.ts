import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Common } from '../../common/const';
import { SessionService } from './session.service';


@Injectable({
  providedIn: 'root'
})
export class HttpClientService {
  private endpoint = environment.serverUrl;
  private attempt = Common.RETRY_ATTEMPT;

  constructor(private httpClient: HttpClient, private sessionService: SessionService) {
  }

  public fetch(url: string) {
    return this.httpClient.get<any>(this.endpoint + url, {headers: this.initHeaders()}).pipe(retry(this.attempt));
  }

  public get(url: string) {
    return this.httpClient.get<any>(this.endpoint + url, {headers: this.initHeaders()}).pipe(retry(this.attempt));
  }

  public post(url: string, data: object) {
    return this.httpClient.post<any>(this.endpoint + url, data, { headers: this.initHeaders() }).pipe(retry(this.attempt));
  }

  public put(url: string, data: object) {
    return this.httpClient.put<any>(this.endpoint + url, data, { headers: this.initHeaders() }).pipe(retry(this.attempt));
  }

  public delete(url: string) {
    return this.httpClient.delete<any>(this.endpoint + url, {headers: this.initHeaders()}).pipe(retry(this.attempt));
  }

  public initHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
	  const bearer = this.sessionService.getTokenSession();
	  if (bearer) headers = headers.append('Authorization', 'Bearer ' + bearer);
    return headers;
  }

}
