import {Component, Input, OnInit} from '@angular/core';
import {FormMessage} from 'src/app/common/const';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html'
})
export class FormErrorComponent implements OnInit {

  @Input() input: any;

  GENERAL_REQUIRED = FormMessage.GENERAL_REQUIRED;
  GENERAL_MAX_LENGTH = FormMessage.GENERAL_MAX_LENGTH;
  GENERAL_MIN_LENGTH = FormMessage.GENERAL_MIN_LENGTH;
  GENERAL_MAX_VALUE = FormMessage.GENERAL_MAX_VALUE;
  GENERAL_MIN_VALUE = FormMessage.GENERAL_MIN_VALUE;
  GENERAL_EMAIL = FormMessage.GENERAL_EMAIL;
  GENERAL_NATURAL_NUMBER = FormMessage.GENERAL_NATURAL_NUMBER;
  GENERAL_NATURAL_NUMBER_EXCLUDE_ZERO = FormMessage.GENERAL_NATURAL_NUMBER_EXCLUDE_ZERO;

  constructor() { }

  ngOnInit() {

  }

}
