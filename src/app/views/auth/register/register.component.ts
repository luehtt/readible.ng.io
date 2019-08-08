import {Component, OnInit} from '@angular/core';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';

import {AuthService} from 'src/app/services/auth/auth.service';
import {FormFunc} from 'src/app/common/function';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {Const, FormMessage} from 'src/app/common/const';

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
  customValidator = { confirm: true, birth: true, username: true, email: true };

  constructor(private formBuilder: FormBuilder, private service: AuthService, private alertService: AlertMessageService) { }

  ngOnInit() {
    this.ngOnInitForm();
  }

  ngOnInitForm() {
    const recommendedYear = new Date().getFullYear() - 40;

    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirm: ['', [Validators.required]],
      fullname: ['', [Validators.required]],
      gender: ['male', [Validators.required]],
      birth: [recommendedYear, [Validators.required]],
      address: [''],
      phone: [''],
    });
  }

  validateConfirm() {
    const p = this.form.controls.password.value;
    const c = this.form.controls.confirm.value;
    this.customValidator.confirm = p === c;
  }

  validateBirth() {
    this.customValidator.birth = true;
    const year = new Date().getFullYear() - this.form.controls.birth.value;
    if (year > Const.REGISTER_UPPER_LIMIT) { this.customValidator.birth = false; }
    if (year < Const.REGISTER_LOWER_LIMIT) { this.customValidator.birth = false; }
  }

  clickSummit() {
    // validate built-in validator
    if (this.form.invalid) {
      FormFunc.touchControls(this.form.controls);
      return;
    }
    // validate custom validator
    for (const f in this.customValidator) {
      if (this.customValidator[f] === false) {
        FormFunc.touchControls(this.form.controls);
        return;
      }
    }

    const data = {
      username: this.form.controls.username.value,
      password: this.form.controls.password.value,
      email: this.form.controls.email.value,
      birth: this.form.controls.birth.value,
      fullname: this.form.controls.fullname.value,
      male: this.form.controls.gender.value === 'male',
      address: this.form.controls.address.value,
      phone: this.form.controls.phone.value
    };

    this.service.register(data).subscribe(res => {
      if (res.success === true) {
        window.location.href = Const.THIS_URL + '/login';
      } else {
        if (data.username) { this.customValidator.username = false; }
        if (data.email) { this.customValidator.email = false; }
      }
    }, err => {
      this.alertService.failed(err);
    });

  }

}
