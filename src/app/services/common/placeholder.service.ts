import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

import {ChartOption, Common} from '../../common/const';

@Injectable({
  providedIn: 'root'
})
export class PlaceholderService {

  private url = environment.placeHolderUrl;
  private colors = ChartOption.COLOR_LIST;

  constructor() {
  }

  public imgHolder(width: number, height: number, text: string): string {
    const iter = text[0].toLocaleLowerCase().charCodeAt(0);
    const color = this.colors[iter % this.colors.length].substring(1);
    const initial = text[0].toLocaleUpperCase();

    return `${this.url}${width}x${height}/${color}/ffffff/?text=${initial}`;
  }

}
