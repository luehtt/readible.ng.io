import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endpoint } from '../common/const';
import { Book, BookPagination } from '../models/book';
import { BookCategory } from '../models/category';
import { Customer } from '../models/customer';
import { Order } from '../models/order';
import { BookCategoryService } from './category.service';
import { HttpClientService } from './common/http-client.service';


@Injectable({
  providedIn: 'root'
})
export class ShopService {

  private endpoint = Endpoint.SHOP;
  private customerEndpoint = Endpoint.CUSTOMER;
  private orderEndpoint = Endpoint.ORDER;

  constructor(private httpService: HttpClientService, private categoryService: BookCategoryService) {
  }

  fetchAll(): Observable<BookPagination> {
    return this.httpService.get(this.endpoint);
  }

  fetch(page: number, pageSize: number, category: string, search: string): Observable<BookPagination> {
    const categoryQuery = category ? '&category=' + category : '';
    const searchQuery = search ? '&search=' + search : '';
    const pageQuery = '?page=' + page + '&pageSize=' + pageSize;
    return this.httpService.get(this.endpoint + pageQuery + categoryQuery + searchQuery);
  }

  fetchCategory(): Observable<BookCategory[]> {
    return this.categoryService.fetch();
  }

  get(isbn: string): Observable<Book> {
    return this.httpService.get(this.endpoint + '/' + isbn);
  }

  getSimilar(isbn: string): Observable<Book[]> {
    return this.httpService.get(this.endpoint + '/similar/' + isbn);
  }

  postOrder(data: Order): Observable<Order> {
    return this.httpService.post(this.orderEndpoint, data);
  }

  getCustomer(): Observable<Customer> {
    return this.httpService.post(this.customerEndpoint, {});
  }

}
