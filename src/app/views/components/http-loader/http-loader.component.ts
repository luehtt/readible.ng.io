import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpLoaderService, HttpLoaderState } from 'src/app/services/common/http-loader.service';

@Component({
  selector: 'app-http-loader',
  templateUrl: './http-loader.component.html'
})
export class HttpLoader implements OnInit, OnDestroy {
  show = false;
  subscription: Subscription;

  constructor(private loaderService: HttpLoaderService) { }

  ngOnInit() {
    this.subscription = this.loaderService.loaderState.subscribe((state: HttpLoaderState) => {
      this.show = state.show;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}