import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endpoint } from '../common/const';
import { BookCategory } from '../models/category';
import { HttpClientService } from './common/http-client.service';


@Injectable({
  providedIn: 'root'
})
export class BookCategoryService {

  private endpoint = Endpoint.BOOK_CATEGORY;

  constructor(private httpService: HttpClientService) { }

  fetch(): Observable<BookCategory[]> {
    return this.httpService.fetch(this.endpoint);
  }

  post(data: BookCategory): Observable<BookCategory> {
    return this.httpService.post(this.endpoint, data);
  }

  put(data: BookCategory): Observable<BookCategory> {
    return this.httpService.put(this.endpoint + '/' + data.id, data);
  }

  get(id: number): Observable<BookCategory> {
    return this.httpService.get(this.endpoint + '/' + id);
  }

  destroy(id: number): Observable<BookCategory> {
    return this.httpService.delete(this.endpoint + '/' + id);
  }
}
