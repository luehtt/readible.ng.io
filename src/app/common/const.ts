export const Const = {
  SERVER_URL: 'https://localhost:5001/api/',
  THIS_URL: 'http://localhost:4200/',
  RETRY_ATTEMPT: 3,
  REGISTER_LOWER_LIMIT: 15,
  REGISTER_UPPER_LIMIT: 100,
  PAGE_SIZE_SMALLER: 15,
  PAGE_SIZE_DEFAULT: 30,
  PAGE_SIZE_HIGHER: 60,
  PAGE_SIZE_HIGHEST: 120,
  LIMIT_VIEWED_BOOK: 6,
  INITIAL_YEAR: 2018,
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
  DURATION_TOO_LONG: 'The selected duration too long to request efficiently.',
  DURATION_TOO_SHORT: 'The selected duration too short to request efficiently.',
  SELECTED_DATE_MISMATCHED: 'The selected date is not optimized.',
  GENERAL_REQUIRED: 'This field is required and cannot be omitted',
  GENERAL_MAX_LENGTH: 'The length of this field has exceeded the requirement',
  GENERAL_MIN_LENGTH: 'The length of this field has not meet the requirement',
  GENERAL_MAX_VALUE: 'The value of this field has exceeded the requirement',
  GENERAL_MIN_VALUE: 'The value of this field has not meet the requirement',
  GENERAL_EMAIL: 'The field has not meet email requirement',
  GENERAL_NATURAL_NUMBER: 'The filed must be a natural number',
  GENERAL_NATURAL_NUMBER_EXCLUDE_ZERO: 'The filed must be a natural number and greater than zero',
  USERNAME_EXISTED: 'The username has existed in the database',
  EMAIL_EXISTED: 'The email has existed in the database',
  CONFIRM_PASSWORD_MISMATCHED: 'The confirm password is not the same as password',
  REGISTER_AGE_LIMIT: 'The age must be higher than ' + Const.REGISTER_LOWER_LIMIT + ' and lower than ' + Const.REGISTER_UPPER_LIMIT,
};

export const ColorCode = {
  PRIMARY: '#0062cc',
  DEFAULT: '#2bbbad',
  UNIQUE: '#880e4f',
  SUCCESS: '#00c851',
  PURPLE: '#a6c',
  AMBER: '#ffa000',
  DARK_GREEN: '#388e3c',
  DANGER: '#ff3547',
  PINK: '#ec407a'
};
