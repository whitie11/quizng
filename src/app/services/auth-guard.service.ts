import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import * as moment from 'moment';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public auth: AuthService, public router: Router) {}

  canActivate(): boolean {
    if (!this.auth.checkLoggedIn().state) {
      this.router.navigate(['login']);
      return false;
    }
    else {
      this.auth.refreshToken();
       return true;
    }

  }

}
