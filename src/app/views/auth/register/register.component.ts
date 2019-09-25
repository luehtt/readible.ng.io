import {Component, OnInit} from '@angular/core';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';

import {AuthService} from 'src/app/services/auth/auth.service';
import {DataControl, FormGroupControl} from 'src/app/common/function';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {Common, FormMessage} from 'src/app/common/const';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  USERNAME_EXISTED = FormMessage.USERNAME_EXISTED;
  EMAIL_EXISTED = FormMessage.EMAIL_EXISTED;
  CONFIRM_PASSWORD_MISMATCHED = FormMessage.CONFIRM_PASSWORD_MISMATCHED;
  REGISTER_AGE_LIMIT = FormMessage.REGISTER_AGE_LIMIT;

  form: FormGroup;
  customRule = { confirm: true, birth: true, username: true, email: true };
  conflictUsername: string[];
  conflictEmail: string[];

  constructor(private formBuilder: FormBuilder, private service: AuthService, private alertService: AlertMessageService) { }

  ngOnInit() {
    this.alertService.clear();
    this.initForm();
    this.conflictUsername = [];
    this.conflictEmail = [];
  }

  initForm() {
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

  validateUsername() {
    const username = this.form.controls.username.value;
    this.customRule.username = !this.conflictUsername.includes(username);
  }

  validateEmail() {
    const email = this.form.controls.email.value;
    this.customRule.email = !this.conflictEmail.includes(email)
  }

  validateConfirm() {
    const p = this.form.controls.password.value;
    const c = this.form.controls.confirm.value;
    this.customRule.confirm = p === c;
  }

  validateBirth() {
    this.customRule.birth = true;
    const year = new Date().getFullYear() - this.form.controls.birth.value;
    if (year > Common.REGISTER_UPPER_LIMIT) { this.customRule.birth = false; }
    if (year < Common.REGISTER_LOWER_LIMIT) { this.customRule.birth = false; }
  }

  private retrieveData(form: FormGroup) {
    return {
      username: this.form.controls.username.value,
      password: this.form.controls.password.value,
      email: this.form.controls.email.value,
      fullname: form.controls.fullname.value,
      birth: form.controls.birth.value,
      male: form.controls.male.value,
      address: form.controls.address.value,
      phone: form.controls.phone.value,
      createdAt: DataControl.jsonDate(),
    };
  }

  onSubmit() {
    this.alertService.clear();
    if (FormGroupControl.validateForm(this.form, this.customRule)) { return; }

    const data = this.retrieveData(this.form);
    this.service.register(data).subscribe(res => {
      if (res.usernameConflict === false && res.emailConflict === false) {
        window.location.href = Common.THIS_URL + '/login';
      } else {
        if (res.usernameConflict === true) {
          const username = data.username;
          this.conflictUsername.filter(x => x != username);
          this.conflictUsername.push(username);
          this.customRule.username = false;
        }
        if (res.emailConflict === true) {
          const email = data.email;
          this.conflictEmail.filter(x => x != email);
          this.conflictEmail.push(email);
          this.customRule.email = false;
        }
      }
    }, err => {
      this.alertService.failed(err);
    });

  }

}
