import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() {}

  setTokenSession(data): void {
    if (!data) { return; }
    const json = this.decodeToken(data);
    localStorage.setItem('access_token', data);
    localStorage.setItem('expired_at', json.expiration + ' GMT+00:00');
  }

  getTokenSession(): string {
    return localStorage.getItem('access_token');
  }

  getTokenSessionJson(): any {
    const token = localStorage.getItem('access_token');
    return !token ? null : this.decodeToken(token);
  }

  clearTokenSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expired_at');
  }

  decodeToken(token): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

      const json = JSON.parse(jsonPayload);
      json.role = json['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      json.expiration = json['http://schemas.microsoft.com/ws/2008/06/identity/claims/expiration'];
      json.username = json.sub;

      return json;
    } catch (err) {
      return null;
    }
  }

}
