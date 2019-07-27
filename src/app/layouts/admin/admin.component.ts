import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  public toggled = false;
  public loggedIn = false;
  public role: string;

  constructor(private authService: AuthService) {  }

  ngOnInit() {
    this.loggedIn = this.authService.isLogged();
    this.role = this.authService.getToken('role');
  }

  clickLogout() {
    this.authService.logout();
  }

  get userRole() {
    return this.role;
  }

}
