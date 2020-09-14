import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endpoint } from '../common/const';
import { BookComment } from '../models/comment';
import { HttpClientService } from './common/http-client.service';


@Injectable({
  providedIn: 'root'
})
export class BookCommentService {

  private endpoint = Endpoint.BOOK_COMMENT;

  constructor(private httpService: HttpClientService) { }

  fetch(): Observable<BookComment[]> {
    return this.httpService.get(this.endpoint);
  }

  post(data: BookComment): Observable<BookComment> {
    return this.httpService.post(this.endpoint, data);
  }

  put(data: BookComment): Observable<BookComment> {
    return this.httpService.put(this.endpoint + '/' + data.id, data);
  }

  destroy(id: number): Observable<BookComment> {
    return this.httpService.delete(this.endpoint + '/' + id);
  }
}
