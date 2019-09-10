import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/http-client.service';
import {Order} from '../models/order';
import {Endpoint} from '../common/const';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private endpoint = Endpoint.ORDER;

  constructor(private httpService: HttpClientService) { }

  fetch(status: string): Observable<Order[]> {
    return status ? this.httpService.fetch(this.endpoint + '?status=' + status) : this.httpService.fetch(this.endpoint);
  }

  get(id: number): Observable<Order> {
    return this.httpService.get(this.endpoint + '/' + id);
  }

  put(data: Order): Observable<Order> {
    return this.httpService.put(this.endpoint + '/' + data.id, data);
  }

  putStatus(data: Order, status: string): Observable<Order> {
    return this.httpService.put(this.endpoint + '/' + data.id + '?status=' + status, data);
  }

}
