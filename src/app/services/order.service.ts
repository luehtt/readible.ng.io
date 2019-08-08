import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/http-client.service';
import {Order} from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private endpoint = 'orders';

  constructor(private httpService: HttpClientService) { }

  fetch(status: string): Observable<Order[]> {
    if (!status || status === '') {
      return this.httpService.fetch(this.endpoint);
    } else {
      return this.httpService.fetch(this.endpoint + '?status=' + status);
    }
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

  fetchCustomer(status: string): Observable<Order[]> {
    return this.httpService.fetch(this.endpoint + '?status=' + status);
  }

  getCustomer(id: number): Observable<Order> {
    return this.httpService.get(this.endpoint + '/' + id);
  }
}
