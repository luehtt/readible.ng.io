import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/http-client.service';
import {Customer, CustomerUser} from '../models/customer';
import {Endpoint} from '../common/const';

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

  auth(): Observable<Customer> {
    return this.httpService.post(this.endpoint, null);
  }
}
