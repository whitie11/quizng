import { Component, OnInit } from '@angular/core';
import { Observable, subscribeOn } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { isLoggedIn } from 'src/app/_models/isLoggedIn';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  isLoggedIn?: isLoggedIn;
  isLoggedIn$: Observable<isLoggedIn>;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = authService.isLoggedIn();

  }

  ngOnInit(): void {
this.isLoggedIn$.subscribe((d) => {
      this.isLoggedIn = {
        state: d.state,
        username: d.username,
        userID: d.userID,
        role: d.role
      };
    });
  }
}
