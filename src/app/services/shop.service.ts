import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/http-client.service';
import {Book, BookPagination} from '../models/book';
import {Endpoint} from '../common/common';
import {Customer} from '../models/customer';
import {BookComment} from '../models/comment';
import {Order} from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  private endpoint = Endpoint.SHOP;
  private customerEndpoint = Endpoint.CUSTOMER;

  constructor(private httpService: HttpClientService) {
  }

  fetch(): Observable<BookPagination> {
    return this.httpService.get(this.endpoint);
  }

  fetchPage(page: number, limit: number, category: string): Observable<BookPagination> {
    const endpoint = category && category !== '' ?
      `${this.endpoint}?page=${page}&pageSize=${limit}&category=${category.toLowerCase()}` :
      `${this.endpoint}?page=${page}&pageSize=${limit}`;
    return this.httpService.get(endpoint);
  }

  fetchSearchPage(page: number, limit: number, category: string, search: string): Observable<BookPagination> {
    if (!search || search === '') {
      return this.httpService.get(`${this.endpoint}?page=${page}&pageSize=${limit}`);
    }

    const endpoint = category && category !== '' ?
      `${this.endpoint}?page=${page}&pageSize=${limit}&category=${category.toLowerCase()}&search=${search.toLowerCase()}` :
      `${this.endpoint}?page=${page}&pageSize=${limit}&search=${search.toLowerCase()}`;
    return this.httpService.get(endpoint);
  }

  get(isbn: string): Observable<Book> {
    return this.httpService.get(this.endpoint + '/' + isbn);
  }

  postOrder(data: Order): Observable<Order> {
    return this.httpService.post('orders', data);
  }

  getCustomer(): Observable<Customer> {
    return this.httpService.post(this.customerEndpoint, {});
  }

  mapRating(data: BookComment[], amount: number, property: string) {
    if (!data || !property || amount < 1 ) { return null; }
    const a = [];

    for (let i = 1; i <= amount; i++) { a.push({ name: i, sum: 0, percent: 0 }); }
    for (const d of data) {
      for (let i = 1; i <= amount; i++) {
        if (d[property] !== i) { continue; }
        a[i - 1].sum++;
      }
    }

    for (const d of a) { d.percent = d.sum * 100 / data.length; }
    return a;
  }
}
