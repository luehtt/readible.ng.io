import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Common } from 'src/app/common/const';
import { FormGroupControl } from 'src/app/common/function';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { SessionService } from 'src/app/services/common/session.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  redirect: string;
  failed = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: AuthService,
    private alertService: AlertMessageService,
    private sessionService: SessionService) { }

  ngOnInit(): void {
    this.alertService.clear();
    this.initForm();
    this.redirect = this.route.snapshot.queryParams.redirect;
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (FormGroupControl.validateForm(this.form) === false) { return; }

    const user = new User();
    user.email = this.form.controls.email.value;
    user.password = this.form.controls.password.value;

    this.alertService.clear();
    this.service.login(user).subscribe(res => {
      this.sessionService.setTokenSession(res.token);
      const json = this.sessionService.decodeToken(res.token);
      this.navigateOnRole(json.role);
    }, err => {
      this.failed = true;
      setTimeout(() => { this.failed = false; }, Common.TIME_OUT);
    });
  }

  // this angular built-in redirect cannot use with link having backslash or any other special character
  // better use window.location.href to hot fix redirect
  private navigateOnRole(userRole: string): void {
    if (userRole === 'MANAGER' || userRole === 'ADMIN') {
      this.router.navigate(['admin/dashboard']);
      this.alertService.set('Login succeeded!!', 'success');
    } else if (userRole === 'CUSTOMER') {
      if (!this.redirect || this.redirect === '') {
        window.location.href = environment.thisUrl;
      } else {
        window.location.href = this.redirect;
      }
    }
  }
}
