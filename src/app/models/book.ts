import { BookComment } from './comment';
import { BookCategory } from './category';
import { Pagination } from './pagination';

export class Book {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  published: string;
  price: number;
  discount: number;
  page: number;
  language: string;
  active: boolean;
  image: string;
  viewed: number;
  info: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;

  bookComments: BookComment[];
  category: BookCategory;
  originalImage: string;
  actualPrice: number;
  rating: number;
  totalSold: number;
}


export interface BookPagination {
  pagination: Pagination;
  data: Book[];
}
