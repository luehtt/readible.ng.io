export const Const = {
  SERVER_URL: 'https://localhost:5001/api/',
  THIS_URL: 'http://localhost:4200/',
  RETRY_ATTEMPT: 3,
  REGISTER_AGE_LIMIT: 15,
  PAGE_SIZE_SMALLER: 10,
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_HIGHER: 40,
  PAGE_SIZE_HIGHEST: 100,
  RECOMMENDED_VIEWED_BOOK: 6,
  LANGUAGE: ['English', 'Português', 'Français', 'العربية', '日本語', '한국어', '中文', 'Tiếng Việt']
};

export const Endpoint = {
  BOOK: 'books',
  BOOK_CATEGORY: 'book-categories',
  BOOK_COMMENT: 'book-comments',
  SHOP: 'shop',
  ORDER: 'orders',
  CUSTOMER_OTHER: 'customer_orders',
  USER: 'users',
  CUSTOMER: 'customers',
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard'
};

export const FormMessage = {
  GENERAL_REQUIRED: 'This field is required and cannot be omitted',
  GENERAL_MAX_LENGTH: 'The length of this field has exceeded the requirement',
  GENERAL_MIN_LENGTH: 'The length of this field has not meet the requirement',
  GENERAL_MAX_VALUE: 'The value of this field has exceeded the requirement',
  GENERAL_MIN_VALUE: 'The value of this field has not meet the requirement',
  GENERAL_EMAIL: 'The field has not meet email requirement',
  GENERAL_NATURAL_NUMBER: 'The filed must be a natural number',
  GENERAL_NATURAL_NUMBER_EXCLUDE_ZERO: 'The filed must be a natural number and greater than zero',
};
