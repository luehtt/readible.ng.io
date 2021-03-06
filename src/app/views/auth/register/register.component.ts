import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Common, ErrorMessage } from 'src/app/common/const';
import { FormGroupControl, TimestampControl } from 'src/app/common/function';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  USERNAME_EXISTED = ErrorMessage.USERNAME_EXISTED;
  EMAIL_EXISTED = ErrorMessage.EMAIL_EXISTED;
  CONFIRM_PASSWORD_MISMATCHED = ErrorMessage.CONFIRM_PASSWORD_MISMATCHED;
  REGISTER_AGE_LIMIT = ErrorMessage.REGISTER_AGE_LIMIT;

  form: FormGroup;
  customRule = { confirm: true, birth: true, username: true, email: true };
  conflictUsername: string[];
  conflictEmail: string[];

  constructor(private formBuilder: FormBuilder, private service: AuthService, private alertService: AlertMessageService) { }

  ngOnInit(): void {
    this.alertService.clear();
    this.initForm();
    this.conflictUsername = [];
    this.conflictEmail = [];
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]],
      fullname: ['', [Validators.required]],
      male: ['', [Validators.required]],
      birth: ['', [Validators.required]],
      address: [''],
      phone: [''],
    });
  }

  validateUsername(): void {
    const username = this.form.controls.username.value;
    this.customRule.username = !this.conflictUsername.includes(username);
  }

  validateEmail(): void {
    const email = this.form.controls.email.value;
    this.customRule.email = !this.conflictEmail.includes(email);
  }

  validateConfirm(): void {
    this.customRule.confirm = this.form.controls.password.value === this.form.controls.confirm.value;
  }

  validateBirth(): void {
    this.customRule.birth = true;
    const year = new Date().getFullYear() - this.form.controls.birth.value;
    if (year > Common.REGISTER_UPPER_LIMIT) { this.customRule.birth = false; }
    if (year < Common.REGISTER_LOWER_LIMIT) { this.customRule.birth = false; }
  }

  private retrieveData(form: FormGroup): any {
    return {
      username: this.form.controls.username.value,
      password: this.form.controls.password.value,
      email: this.form.controls.email.value,
      fullname: form.controls.fullname.value,
      birth: form.controls.birth.value,
      male: form.controls.male.value,
      address: form.controls.address.value,
      phone: form.controls.phone.value,
      createdAt: TimestampControl.jsonDate(),
    };
  }

  onSubmit(): void {
    this.alertService.clear();
    if (FormGroupControl.validateForm(this.form, this.customRule) === false) { return; }

    const data = this.retrieveData(this.form);
    this.service.register(data).subscribe(res => {
      if (!res.usernameConflict && !res.emailConflict) {
        window.location.href = environment.thisUrl + '/login';
      } else {
        if (res.usernameConflict === true) {
          const username = data.username;
          this.conflictUsername.filter(x => x !== username);
          this.conflictUsername.push(username);
          this.customRule.username = false;
        }
        if (res.emailConflict === true) {
          const email = data.email;
          this.conflictEmail.filter(x => x !== email);
          this.conflictEmail.push(email);
          this.customRule.email = false;
        }
      }
    }, err => {
      this.alertService.errorResponse(err);
    });
  }

}
