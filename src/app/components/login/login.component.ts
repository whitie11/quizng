import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.form.patchValue({
        username: (params.get('username') ?? ''),
        password: (params.get('password') ?? '')
      })
  });
  }

  OnSubmit(form: FormGroup) {
    this.authService
      .login(form.get('username')!.value, form.get('password')!.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/game']);
        },
        error: (e) => {
          console.error('login error =>' + JSON.stringify(e.error.detail + e));
          this.errorMsg = 'Account not found: Try again!';
        },
        complete: () => console.info('complete')
    });
  }
}
