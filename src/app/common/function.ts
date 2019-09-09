import {FormGroup} from '@angular/forms';
import {piexif} from 'piexifjs';

export class DataControl {
  static createTimestamp<T>(item: T): T {
    const timestamp = this.jsonDate();
    item['createdAt'] = timestamp;
    item['updatedAt'] = timestamp;
    return item;
  }

  static updateTimestamp<T>(item: T): T {
    item['updatedAt'] = this.jsonDate();
    return item;
  }

  static toNgbDate(datetime: string) {
    const date = new Date(datetime);
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  static fillDigit(n: number, length: number = 2, char: string = '0'): string {
    return n >= Math.pow(10, length - 1) ? n.toString() : (char.repeat(length) + n.toString()).slice(-length);
  }

  static jsDate(datetime: string): Date {
    return new Date(datetime);
  }

  static fromNgbDateToJson(data: any): string {
    return data.year + '-' + data.month + '-' + data.day;
  }

  static jsonDate(data: Date = new Date()): string {
    console.log(data.getMonth() + 1);
    console.log(data.getDate());

    return data.getFullYear().toString() + '-' + this.fillDigit(data.getMonth() + 1) + '-' + this.fillDigit(data.getDate());
  }

  static jsonDatetime(data: Date = new Date()): string {
    const date = this.jsonDate(data);
    const time = this.fillDigit(data.getHours()) + ':' + this.fillDigit(data.getMinutes()) + ':' + this.fillDigit(data.getSeconds());
    return date + 'T' + time;
  }

  static radioTrueFalse(bool: boolean): string {
    return bool === true ? 'true' : bool === false ? 'false' : '';
  }

  static isSameDay(date1: Date, date2: Date = new Date()): boolean {
    return this.isSameMonth(date1, date2) === false ? false : date1.getDate() !== date2.getDate();
  }

  static isSameMonth(date1: Date, date2: Date = new Date()): boolean {
    return this.isSameYear(date1, date2) === false ? false : date1.getMonth() === date2.getMonth();
  }

  static isSameYear(date1: Date, date2: Date = new Date()): boolean {
    return date1.getFullYear() === date2.getFullYear();
  }

  static tooLongDay(date1: Date, date2: Date, duration: number = 60): boolean {
    return this.diffDayBetween(date1, date2) > duration;
  }

  static tooLongMonth(date1: Date, date2: Date, duration: number = 24): boolean {
    return this.diffMonthBetween(date1, date2) > duration;
  }

  static diffDayBetween(date1: Date, date2: Date = new Date()): number {
    return Math.round(Math.abs(date2.getTime() - date1.getTime()) / 86_000_000);
  }

  static diffMonthBetween(date1: Date, date2: Date = new Date()): number {
    return Math.abs(date2.getMonth() * date2.getFullYear() - date1.getMonth() * date2.getFullYear());
  }

  static diffYearBetween(date1: Date, date2: Date = new Date()): number {
    return Math.abs(date2.getFullYear() - date1.getFullYear());
  }

  static diffDateTimeFromNow(date1: Date, date2: Date = new Date()) {
    [date1, date2] = date1 < date2 ? [date1, date2] : [date2, date1];
    const day = this.diffDayBetween(date1, date2);
    const month = this.diffMonthBetween(date1, date2);
    const year = this.diffYearBetween(date1, date2);
    return { day, month, year };
  }

  static translateDateTimeFromNow(date1: Date, date2: Date = new Date()) {
    const diff = this.diffDateTimeFromNow(date1, date2);
    return diff.day < 60 ? diff.day + ' days ago' : diff.month < 24 ? diff.month + ' months ago' : diff.year + ' years ago';
  }

  static normalize(data: string, lowercase: boolean = false): string {
    return lowercase === true ? data.replace(/([A-Z])/g, ' $1').trim().toLowerCase() : data.replace(/([A-Z])/g, ' $1').trim();
  }

  static normalizeData(data: string[], lowercase: boolean = false): string[] {
    return data.map(x => DataControl.normalize(x, lowercase));
  }

  static filter<T>(data: T[], search: string, properties: string[]): T[] {
    return data ? data.filter(x => this.includes(x, search, properties)) : null;
  }

  static includes(data, search: string, properties: string[]): boolean {
    const s = search.toLocaleLowerCase();
    for (const p of properties) {
      const a = p.split('.');
      const d = this.readObject(data, a).toString();
      if (d.toLocaleLowerCase().includes(s)) { return true; }
    }
    return false;
  }

  static readObject(data: object, properties: string[]) {
    return properties.length === 1 ? data[properties[0]] : this.readObject(data[properties[0]], properties.slice(1));
  }

  static sortDirection (currentSort: string, sort: string, currentDirection: string): string {
    return currentSort !== sort ? 'asc' : currentDirection === 'asc' ? 'desc' : 'asc';
  }

  static sort<T>(data: T[], property: string, direction: string): T[] {
    if (data.length === 0) { return data; }
    switch (direction) {
      case 'asc': return data.sort((a, b) => this.compare(a, b, property));
      case 'desc': return data.sort((a, b) => this.compare(b, a, property));
      default: return data;
    }
  }

  static compare(a, b, p: string) {
    const d = p.split('.');
    const ad = this.readObject(a, d);
    const bd = this.readObject(b, d);

    if (typeof ad !== typeof bd) { return 0; }
    switch (typeof ad) {
      case 'number': return ad - bd;
      case 'boolean': return ad === bd ? 0 : ad ? -1 : 1;
      case 'string': return ad.localeCompare(bd);
    }
  }

  // this method is to join n list into 1 list and remove duplication
  // https://medium.com/dailyjs/how-to-remove-array-duplicates-in-es6-5daa8789641c
  static removeDuplicate<T>(list1: T[], list2: T[]): T[] {
    return [...new Set([...list1, ...list2])];
  }
}

export class FileControl {
  static async convertUrlToBase64(url: string) {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);

      reader.onerror = () => reject(this) ;
      reader.readAsDataURL(blob);
    });
  }

  static async convertFileToBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);

      reader.onerror = () => reject(this) ;
      reader.readAsDataURL(file);
    });
  }

  static checkBase64File(imageString: string, fileType: string): boolean {
    return imageString.includes(fileType + ';base64');
  }

  static getExif(imageString: string, group: string, code: number) {
    const exif = piexif.load(imageString);
    return exif ? exif[group][code] : null;
  }

  static getOrientation(imageString: string): number {
    return this.checkBase64File(imageString, 'jpeg') === false ? null : parseInt(this.getExif(imageString, '0th', 271), 10);
  }

  static transformCss = (orientation: number): string => {
    switch (orientation) {
      case 2: return 'rotateY(180deg)';
      case 3: return 'rotate(180deg)';
      case 4: return 'rotate(180deg) rotateY(180deg)';
      case 5: return 'rotate(270deg) rotateY(180deg)';
      case 6: return 'translateY(-100%) rotate(90deg)';
      case 7: return 'translateY(-100%) translateX(-100%) rotate(90deg) rotateY(180deg)';
      case 8: return 'translateX(-100%) rotate(270deg)';
      default: return 'none';
    }
  }
}

export class FormGroupControl {
  static validateForm(form: FormGroup, customRule: object = null): boolean {
    this.touchControls(form);
    return customRule ? form.invalid || Object.values(customRule).includes(false) : form.invalid;
  }

  static touchControls(form: FormGroup) {
    for (const i in form.controls) {
      form.controls[i].markAsTouched();
    }
  }
}


