import { Component, OnInit } from '@angular/core';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { ShopService } from 'src/app/services/shop.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-front',
  templateUrl: './front.component.html'
})
export class FrontComponent implements OnInit {

  loggedIn = false;

  constructor(public shopService: ShopService, public cartService: CartService,
              public alertService: AlertMessageService, public authService: AuthService) {
  }

  ngOnInit() {
    this.loggedIn = this.authService.isLogged();
  }

  clickLogout() {
    this.authService.logout();
  }

}
