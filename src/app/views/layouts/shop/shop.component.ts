import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { ShopService } from 'src/app/services/shop.service';
import { CartService } from '../../../services/cart.service';


@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html'
})
export class ShopComponent implements OnInit {

  loggedIn = false;

  constructor(
    public shopService: ShopService,
    public cartService: CartService,
    public alertService: AlertMessageService,
    public authService: AuthService) {
  }

  ngOnInit(): void {
    this.loggedIn = this.authService.isLogged();
  }

  onLogout(): void {
    this.authService.logout();
  }


}
