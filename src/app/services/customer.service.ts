import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endpoint } from '../common/const';
import { Customer, CustomerUser } from '../models/customer';
import { User } from '../models/user';
import { HttpClientService } from './common/http-client.service';


@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private endpoint = Endpoint.CUSTOMER;

  constructor(private httpService: HttpClientService) { }

  fetch(): Observable<Customer[]> {
    return this.httpService.fetch(this.endpoint);
  }

  get(id: number): Observable<CustomerUser> {
    return this.httpService.get(this.endpoint + '/' + id);
  }

  put(id: number): Observable<User> {
    return this.httpService.put(this.endpoint + '/' + id, {});
  }

  auth(): Observable<Customer> {
    return this.httpService.post(this.endpoint, {});
  }
}
