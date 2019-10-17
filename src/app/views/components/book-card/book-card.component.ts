import { Component, Input, OnInit } from '@angular/core';

import { PlaceholderService } from '../../../services/common/placeholder.service';
import { Book } from '../../../models/book';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html'
})
export class BookCardComponent implements OnInit {
  @Input() input: Book;

  constructor(private placeholderService: PlaceholderService) { }

  ngOnInit() {
    this.input.rating = this.input.bookComments.length === 0 ? 0 : this.input.bookComments.map(e => e.rating).reduce((a, b) => a + b, 0) / this.input.bookComments.length;
    this.input.image = this.input.image ? this.input.image : this.placeholderService.imgHolder(250, 350, this.input.title);
  }
}
