export const Common = {
  SERVER_URL: 'https://localhost:44388/api/',
  THIS_URL: 'http://localhost:4200/',
  PLACEHOLDER_URL: 'https://via.placeholder.com/',
  RETRY_ATTEMPT: 3,
  REGISTER_LOWER_LIMIT: 12,
  REGISTER_UPPER_LIMIT: 100,
  PAGE_SIZE_SMALLER: 15,
  PAGE_SIZE_DEFAULT: 30,
  PAGE_SIZE_HIGHER: 60,
  PAGE_SIZE_HIGHEST: 120,
  LIMIT_VIEWED_BOOK: 6,
  TIME_OUT: 8000,
  INITIAL_YEAR: new Date().getFullYear() - 3,
  LANGUAGE: ['English', 'Português', 'Français', 'العربية', '日本語', '한국어', '中文', 'Tiếng Việt'],
  
  METHOD: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
  }
};

export const Endpoint = {
  BOOK: 'books',
  BOOK_CATEGORY: 'book-categories',
  BOOK_COMMENT: 'book-comments',
  SHOP: 'shop',
  ORDER: 'orders',
  USER: 'users',
  CUSTOMER: 'customers',
  MANAGER: 'managers',
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  ACCOUNT: 'accounts',
  STATISTIC: 'statistic'
};

export const ErrorMessage = {
  DURATION_TOO_LONG: 'The selected duration too long to request.',
  DURATION_TOO_SHORT: 'The selected duration too short to request.',
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
  REGISTER_AGE_LIMIT: 'The age must be higher than ' + Common.REGISTER_LOWER_LIMIT + ' and lower than ' + Common.REGISTER_UPPER_LIMIT,
  CONFIRM_PASSWORD_ERROR: 'The two password does not match!',
  UPDATE_PASSWORD_ERROR: 'The current password does not match the one entered!'
};

export const ChartOption = {
  COLOR_BLUE: '#2196f3',
  COLOR_TEAL: '#009688',
  COLOR_PURPLE: '#9c27b0',
  COLOR_VIOLET: '#673ab7',
  COLOR_GREEN: '#4caf50',
  COLOR_AMBER: '#ffc107',
  COLOR_RED: '#f44336',
  COLOR_CYAN: '#00bcd4',
  COLOR_ROSE: '#e91e63',
  COLOR_BROWN: '#795548',

  COLOR_LIST: [
    '#2196f3',
    '#009688',
    '#9c27b0',
    '#673ab7',
    '#4caf50',
    '#ffc107',
    '#f44336',
    '#00bcd4',
    '#e91e63',
    '#795548'
  ],

  TRANSPARENT: 'transparent',
  CHART_LINE: 'line',
  CHART_BAR: 'bar',
  STEP_MIDDLE: 'middle',

  DEFAULT_LINE_OPTION: {
    responsive: true,
    maintainAspectRatio: false,
    legend: { display: false },
    scales: { xAxes: [{ display: true }], yAxes: [{ display: true }] },
    elements: { line: { tension: 0 } },
    animation: { duration: 0 }
  },

  DEFAULT_PIE_OPTION: {
    responsive: true,
    maintainAspectRatio: false,
    legend: { display: true, position: 'bottom' },
    scales: { xAxes: [{ display: false }], yAxes: [{ display: false }] },
    elements: { line: { tension: 0 } },
    animation: { duration: 0 }
  }
};


// TIFF Tag Reference, Baseline TIFF Tags
// read more at https://www.awaresystems.be/imaging/tiff/tifftags/baseline.html
export const ExifCode = {
  MAKE: 271,
  MODEL: 272,
  ORIENTATION: 274,
}

