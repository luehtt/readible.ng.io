import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorMessage } from 'src/app/common/const';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html'
})
export class FormErrorComponent implements OnInit {

  @Input() input: FormControl;

  GENERAL_REQUIRED = ErrorMessage.GENERAL_REQUIRED;
  GENERAL_MAX_LENGTH = ErrorMessage.GENERAL_MAX_LENGTH;
  GENERAL_MIN_LENGTH = ErrorMessage.GENERAL_MIN_LENGTH;
  GENERAL_MAX_VALUE = ErrorMessage.GENERAL_MAX_VALUE;
  GENERAL_MIN_VALUE = ErrorMessage.GENERAL_MIN_VALUE;
  GENERAL_EMAIL = ErrorMessage.GENERAL_EMAIL;
  GENERAL_NATURAL_NUMBER = ErrorMessage.GENERAL_NATURAL_NUMBER;
  GENERAL_NATURAL_NUMBER_EXCLUDE_ZERO = ErrorMessage.GENERAL_NATURAL_NUMBER_EXCLUDE_ZERO;

  constructor() { }

  ngOnInit(): void {

  }

}
