import { Component, OnInit } from '@angular/core';
import { Common } from 'src/app/common/const';
import { AuthService } from 'src/app/services/auth/auth.service';


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

  ngOnInit(): void {
    this.loggedIn = this.authService.isLogged();
    this.role = this.authService.getToken('role');
  }

  onLogout(): void {
    this.authService.logout();
  }

  get userRole(): string {
    return this.role;
  }

}
