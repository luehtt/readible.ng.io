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

  show(): void {
    this.loaderSubject.next({ show: true } as HttpLoaderState);
  }

  hide(): void {
    this.loaderSubject.next({ show: false } as HttpLoaderState);
  }
}
