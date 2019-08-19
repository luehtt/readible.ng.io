import {Injectable} from '@angular/core';

import {ColorCodeList, Const} from '../../common/const';

@Injectable({
  providedIn: 'root'
})
export class PlaceholderService {

  private url = Const.PLACEHOLDER_URL;

  constructor() {
  }

  public imgHolder(width: number, height: number, text: string): string {
    const iter = text[0].toLocaleLowerCase().charCodeAt(0);
    const color = ColorCodeList[iter % ColorCodeList.length].substring(1);
    const initial = text[0].toLocaleUpperCase();

    return `${this.url}${width}x${height}/${color}/ffffff/?text=${initial}`;
  }

}
