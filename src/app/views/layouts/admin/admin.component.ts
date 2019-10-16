import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth/auth.service';
import { Common } from 'src/app/common/const';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  public toggled = false;
  public loggedIn = false;
  public role: string;
  public selectMenu = 'dashboard';
  public version = Common.VERSION;

  constructor(private authService: AuthService) {  }

  ngOnInit() {
    this.loggedIn = this.authService.isLogged();
    this.role = this.authService.getToken('role');
  }

  onLogout() {
    this.authService.logout();
  }

  get userRole() {
    return this.role;
  }

}
