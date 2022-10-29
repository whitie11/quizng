import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs';
import { isLoggedIn } from '../_models/isLoggedIn';
import { TokenStorageService } from './token-storage.service';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { JWTPayload } from '../_models/JWTPayload';
import { RegisterDTO } from '../_models/registerDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  loggedOutState: isLoggedIn = {
    state: false,
    username: 'Please Login',
    userID: 0,
    role: '',
  };

  isLoginSubject = new BehaviorSubject<isLoggedIn>(this.loggedOutState);

  // apiRoot = 'http://quizicalserver.duckdns.org/';
  apiRoot = environment.apiRoot;
  constructor(
    private http: HttpClient,
    private tokenService: TokenStorageService,
    private router: Router
  ) {}

  login(username: string, password: string) {
    return this.http
      .post(this.apiRoot.concat('user/token/'), { username, password })
      .pipe(
        tap((response) => {
          this.setLoginState(username, response);
        }),
        shareReplay()
      );
  }

  register(regDTO: any) {
    return this.http
      .post(this.apiRoot.concat('user/register/'), regDTO);
  }

  change_pw(oldPW: string, newPW: string) {
    return this.http
      .post(this.apiRoot.concat('user/change_pw/'), {'old_password': oldPW, 'new_password': newPW});
  }

  change_pw_confirm(token: string, password: string ) {
    return this.http
      .post(this.apiRoot.concat('user/reset_pw/confirm/'), {'token': token, 'password': password});
  }

  reset_pw_email(email: string ) {
    return this.http
      .post(this.apiRoot.concat('user/reset_pw/'), {'email': email});
  }

  setLoginState(username: string, res: any) {
    const accessToken = res.access;
    const payload = <JWTPayload>jwt_decode(accessToken);
    const userID = payload.user_id
    const newloginState: isLoggedIn = {
      state: true,
      username: username,
      userID: userID,
      role: payload.role
    };
    this.tokenService.saveTokens(res);
    this.tokenService.saveUser(username);

    this.isLoginSubject.next(newloginState);
  }

  logout() {
    this.tokenService.signOut();
    this.isLoginSubject.next(this.loggedOutState);
    this.router.navigate(['/login']);
  }

  getExpiration() {
    const expiration = window.sessionStorage.getItem('expires-at');
    if (expiration) {
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt);
    } else {
      return null;
    }
  }

  isLoggedIn() {
    return this.isLoginSubject.asObservable();
  }

  refreshToken() {
    const tokenExpiresAt = this.getExpiration();
    // if (tokenExpiresAt) {
    //   if (!moment().isBetween(tokenExpiresAt.subtract(1, 'days'),tokenExpiresAt)) {
        const refreshToken = this.tokenService.getRefreshToken()
        if (refreshToken) {
          this.getRefreshedAccessToken(refreshToken).subscribe();
          // this.http.post(this.apiRoot.concat('token/refresh/'), { refresh: refreshToken })
          // .pipe(
          //   tap((response) => this.tokenService.saveRefreshedAccessToken(response)),
          //   shareReplay()
          // )
          // .subscribe();
      //   }
      // }
      //TODO cleanup/logout send to login
    }
  }

  getRefreshedAccessToken(refreshToken: any) {
  return this.http.post(this.apiRoot.concat('user/token/refresh/'), { refresh: refreshToken })
    .pipe(
      tap(response=> {
        this.tokenService.saveRefreshedAccessToken(response);
      return response;
      }),
      shareReplay()
    )
  }


  checkLoggedIn() {
    // const x = this.getExpiration();
    // TODO is this in time?
    const x = moment().isBefore(this.getExpiration());
    const y = this.tokenService.getAccessToken();
    const user = this.tokenService.getUser();
    const role = this.tokenService.getRole();
    const userID = this.tokenService.getUserID();

    if (x && y && user) {
      const newloginState: isLoggedIn = {
        state: true,
        username: user,
        userID: userID,
        role: role,
      };
      this.isLoginSubject.next(newloginState);

      return newloginState;
    } else {
      this.isLoginSubject.next(this.loggedOutState);
      return this.loggedOutState;
    }
  }
}
