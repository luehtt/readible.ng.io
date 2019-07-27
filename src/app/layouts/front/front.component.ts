import { Component, OnInit } from '@angular/core';

import { AlertService } from 'src/app/services/common/alert.service';
import { ShopService } from 'src/app/services/shop.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-front',
  templateUrl: './front.component.html'
})
export class FrontComponent implements OnInit {

  loggedIn = false;

  constructor(public shopService: ShopService, public cartService: CartService,
              public alertService: AlertService, public authService: AuthService) {
  }

  ngOnInit() {
    this.loggedIn = this.authService.isLogged();
  }

  clickLogout() {
    this.authService.logout();
  }

}
