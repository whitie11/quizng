import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { PlayerChannel } from 'src/app/_models/playerChannel';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  flag: boolean = true;
  errorMsg = '';
  players: PlayerChannel[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.authService.getActivePlayers().subscribe(ap => {
      this.players = ap;
    });

    this.activatedRoute.paramMap.subscribe((params) => {
      this.form.patchValue({
        username: params.get('username') ?? '',
        password: params.get('password') ?? '',
      });
    });


  }

  OnSubmit(form: FormGroup) {
    const x = this.checkIfActivePlayer(form.get('username')!.value)
    if (x) {
      this.errorMsg = 'User already registered to play!';
    } else {
      this.authService
        .login(form.get('username')!.value, form.get('password')!.value)
        .subscribe({
          next: () => {
            this.router.navigate(['/game']);
          },
          error: (e) => {
            console.error(
              'login error =>' + JSON.stringify(e.error.detail + e)
            );
            this.errorMsg = 'Account not found: Try again!';
          },
          complete: () => console.info('complete'),
        });
    }
  }

  checkIfActivePlayer(username: string) {


    if (this.players.length > 0) {
      const l: PlayerChannel | undefined = this.players.find((x) => {
        return x.username === username;
      });
      if (l != undefined) {
        return true;
      }
    }
    return false;
  }
}
