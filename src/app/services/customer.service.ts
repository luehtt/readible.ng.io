import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/httpclient.service';
import {Customer, CustomerUser} from '../models/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private endpoint = 'customers';

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
