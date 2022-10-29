import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { JWTPayload } from '../_models/JWTPayload';
import { AuthService } from './auth.service';

const ACCESS_TOKEN_KEY = 'access-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const USER_KEY = 'auth-user';
const USER_ROLE_KEY = 'auth-user-role';
const USER_ID_KEY = 'auth-user-id';
const EXPIRES_AT = 'expires-at';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveTokens(token: any): void {
    const accessToken = token.access;
    const payload = <JWTPayload>jwt_decode(accessToken);
    const expiresAt = moment.unix(payload.exp);

    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.sessionStorage.removeItem(EXPIRES_AT);
    window.sessionStorage.removeItem(USER_ID_KEY);
    window.sessionStorage.removeItem(USER_ROLE_KEY);

    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token.access);
    window.sessionStorage.setItem(REFRESH_TOKEN_KEY, token.refresh);
    window.sessionStorage.setItem(EXPIRES_AT, JSON.stringify(expiresAt.valueOf()));
    window.sessionStorage.setItem(USER_ID_KEY, payload.user_id.toString());
    window.sessionStorage.setItem(USER_ROLE_KEY, payload.role);
  }

public saveRefreshedAccessToken(token: any) {
    const accessToken = token.access;
    const payload = <JWTPayload>jwt_decode(accessToken);
    const expiresAt = moment.unix(payload.exp);

    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(EXPIRES_AT);
    // window.sessionStorage.removeItem(USER_ID_KEY);

    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token.access);
    window.sessionStorage.setItem(EXPIRES_AT, JSON.stringify(expiresAt.valueOf()));
    // window.sessionStorage.setItem(USER_ID_KEY, payload.user_id.toString());

}



  public getAccessToken(): string | null {
   return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  // this.auth.refreshToken();
  }

  public getRefreshToken(): string | null {
    return window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
   }

  public saveUser(user: string): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, user);
  }

  public getUser(): string {
    if (window.sessionStorage.getItem(USER_KEY)) {
      return window.sessionStorage.getItem(USER_KEY)!;
    } else return '';
  }

  public getRole(): string {
    if (window.sessionStorage.getItem(USER_ROLE_KEY)) {
      return window.sessionStorage.getItem(USER_ROLE_KEY)!;
    } else return '';
  }

  public getUserID (): number {
    if (window.sessionStorage.getItem(USER_ID_KEY)) {
      return parseInt(window.sessionStorage.getItem(USER_ID_KEY)!,10);
    }
    else return 0;
  }

}
