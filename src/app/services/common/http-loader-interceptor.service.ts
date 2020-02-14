import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { HttpLoaderService } from './http-loader.service';

@Injectable({
  providedIn: 'root'
})
export class HttpLoaderInterceptorService implements HttpInterceptor {
  constructor(private loaderService: HttpLoaderService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.showLoader();
    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) { this.onEnd(); }
    }, err => {
        this.onEnd();
    }));
  }

  private onEnd() {
    this.hideLoader();
  }

  private showLoader() {
    this.loaderService.show();
  }

  private hideLoader() {
    this.loaderService.hide();
  }
}
