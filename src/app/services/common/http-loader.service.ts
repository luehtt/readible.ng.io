import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface HttpLoaderState {
  show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HttpLoaderService {
  private loaderSubject = new Subject<HttpLoaderState>();
  loaderState = this.loaderSubject.asObservable();
  
  constructor() { }
  
  show() {
    this.loaderSubject.next(<HttpLoaderState>{ show: true });
  }
  
  hide() {
    this.loaderSubject.next(<HttpLoaderState>{ show: false });
  }
}