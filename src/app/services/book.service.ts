import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/httpclient.service';
import {Book} from '../models/book';
import {Endpoint} from '../common/const';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private endpoint = Endpoint.BOOK;

  constructor(private httpService: HttpClientService) { }

  fetch(): Observable<Book[]> {
    return this.httpService.fetch(this.endpoint);
  }

  get(isbn: string): Observable<Book> {
    return this.httpService.get(this.endpoint + '/' + isbn);
  }

  post(data: Book): Observable<Book> {
    return this.httpService.post(this.endpoint, data);
  }

  put(data: Book): Observable<Book> {
    return this.httpService.put(this.endpoint + '/' + data.isbn, data);
  }

  destroy(isbn: string): Observable<Book> {
    return this.httpService.delete(this.endpoint + '/' + isbn);
  }
}
