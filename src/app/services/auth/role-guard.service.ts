import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';

import {AuthService} from './auth.service';
import {SessionService} from '../common/session.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(public sessionService: SessionService, public authService: AuthService, public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const expectedRoles = route.data.expectedRoles;
    let loginNeeded = false;

    if (!this.authService.isLogged()) {
      loginNeeded = true;
    } else {
      const json = this.sessionService.getTokenSessionJson();
      if (!json) {
        loginNeeded = true;
      } else {
        let matchedRole = false;
        for (const role of expectedRoles) {
          if (json.role === role) { matchedRole = true; }
        }
        if (matchedRole === false) { loginNeeded = true; }
      }
    }

    if (loginNeeded) { this.router.navigate(['login']); }
    return !loginNeeded;
  }
}
