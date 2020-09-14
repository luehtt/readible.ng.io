import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endpoint } from '../common/const';
import { Manager, ManagerUser } from '../models/manager';
import { User } from '../models/user';
import { HttpClientService } from './common/http-client.service';


@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  private endpoint = Endpoint.MANAGER;

  constructor(private httpService: HttpClientService) { }

  fetch(): Observable<Manager[]> {
    return this.httpService.fetch(this.endpoint);
  }

  get(id: number): Observable<ManagerUser> {
    return this.httpService.get(this.endpoint + '/' + id);
  }

  put(id: number): Observable<User> {
    return this.httpService.put(this.endpoint + '/' + id, {});
  }

  auth(): Observable<Manager> {
    return this.httpService.post(this.endpoint, {});
  }

  register(data): Observable<any> {
    return this.httpService.post('register-manager', data);
  }
}
