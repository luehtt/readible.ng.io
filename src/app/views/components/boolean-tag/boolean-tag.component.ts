import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-boolean-tag',
  templateUrl: './boolean-tag.component.html'
})
export class BooleanTagComponent implements OnInit {
  @Input() condition: boolean;
  @Input() trueStyle: string;
  @Input() falseStyle: string;
  @Input() trueValue: string;
  @Input() falseValue: string;

  constructor() { }

  ngOnInit(): void {
  }
}
