import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpLoaderService, HttpLoaderState } from 'src/app/services/common/http-loader.service';

@Component({
  selector: 'app-http-loader',
  templateUrl: './http-loader.component.html'
})
export class HttpLoaderComponent implements OnInit, OnDestroy {
  show = false;
  subscription: Subscription;

  constructor(private loaderService: HttpLoaderService) { }

  ngOnInit(): void {
    this.subscription = this.loaderService.loaderState.subscribe((state: HttpLoaderState) => {
      this.show = state.show;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
