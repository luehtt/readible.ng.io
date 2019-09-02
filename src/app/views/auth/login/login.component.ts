import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'src/app/models/user';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { SessionService } from 'src/app/services/auth/session.service';
import { FormFunc } from 'src/app/common/function';
import { Const } from 'src/app/common/const';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  redirect: string;

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
              private service: AuthService, private alertService: AlertMessageService, private sessionService: SessionService) { }

  ngOnInit() {
    this.initForm();
    this.redirect = this.route.snapshot.queryParams.redirect;
  }

  private initForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      FormFunc.touchControls(this.form.controls);
      return;
    }

    const user = new User();
    user.email = this.form.controls.email.value;
    user.password = this.form.controls.password.value;

    this.alertService.clear();
    this.service.login(user).subscribe(res => {
      this.sessionService.setTokenSession(res.token);
      const json = this.sessionService.decodeToken(res.token);

      // this angular built-in redirect cannot use with link having backslash or any other special character
      // better use window.location.href to hot fix redirect
      if (json.role === 'MANAGER' || json.role === 'ADMIN') {
        this.router.navigate(['admin/dashboard']);
        this.alertService.set('Login succeeded!!', 'success');
      } else if (json.role === 'CUSTOMER') {
        if (!this.redirect || this.redirect === '') {
          window.location.href = Const.THIS_URL;
        } else {
          window.location.href = this.redirect;
        }
      }
    }, err => {
      this.alertService.failed(err);
    });
  }
}
