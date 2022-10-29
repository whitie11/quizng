import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { RegisterDTO } from 'src/app/_models/registerDTO';
import { windowCount } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  form = this.fb.group(
    {
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', [Validators.required, Validators.minLength(6)]],
    },
    { validators: this.matchingPasswords('password', 'password2') }
  );

  // passwordMatchValidator(frm: FormGroup) {
  //   return frm.controls['password'].value === frm.controls['password2'].value ? null : {'mismatch': true};
  // }

  matchingPasswords(password: string, password2: string) {
    return (controls: AbstractControl) => {
      if (controls) {
        const Password = controls.get('password')!.value;
        const ConfirmPassword = controls.get('password2')!.value;
        console.log(
          'check what is passed to the validator',
          Password,
          ConfirmPassword
        );
        if (Password !== ConfirmPassword) {
          controls.get('password2')?.setErrors({ not_the_same: true });
          return { mismatchedPassword: true };
        }
      }
      return null;
    };
  }

  flag: boolean = true;
  errorMsg = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  OnSubmit(frm: FormGroup) {
    const regDTO: RegisterDTO = {
      first_name: frm.controls['first_name'].value,
      last_name: frm.controls['last_name'].value,
      username: frm.controls['username'].value,
      email: frm.controls['email'].value,
      password: frm.controls['password'].value,
      password2: frm.controls['password2'].value,
      role: 'StdUser'
    };

    this.authService.register(regDTO).subscribe({
      next: () => {
        // console.log('new user registered');
        window.alert('new user registered');
        this.router.navigate(['/login', regDTO.username, regDTO.password]);
      },
      error: (e) => {
        console.error('login error =>' + JSON.stringify(e.error));
        this.errorMsg = JSON.stringify(e.error);
      },
      complete: () => console.info('complete'),
    });
  }

  cancelReg() {
    this.router.navigate(['/about']);
  }
}
