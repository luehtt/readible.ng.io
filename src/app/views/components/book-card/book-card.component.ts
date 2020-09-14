import { Component, Input, OnInit } from '@angular/core';
import { Book } from '../../../models/book';
import { PlaceholderService } from '../../../services/common/placeholder.service';


@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html'
})
export class BookCardComponent implements OnInit {
  @Input() input: Book;

  constructor(private placeholderService: PlaceholderService) { }

  ngOnInit(): void {
    if (!this.input.bookComments.length) {
      this.input.rating = 0;
    } else {
      const sumRating = this.input.bookComments.map(e => e.rating).reduce((a, b) => a + b, 0);
      this.input.rating = sumRating / this.input.bookComments.length;
    }
    this.input.image = this.input.image ? this.input.image : this.placeholderService.imgHolder(250, 350, this.input.title);
  }
}
