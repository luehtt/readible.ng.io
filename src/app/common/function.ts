export class DataFunc {
  static include(data: object, search: string, keywords: string[]): boolean {
    search = search.toLocaleLowerCase();
    const n = keywords.length;
    for (let i = 0; i < n; i++) {
      if (data[keywords[i]].toLocaleLowerCase().includes(search)) { return true; }
    }
    return false;
  }

  static includeNumber(data: object, search: string, keywords: string[]): boolean {
    search = search.toLocaleLowerCase();
    const n = keywords.length;
    for (let i = 0; i < n; i++) {
      if (data[keywords[i]].toString().toLocaleLowerCase().includes(search)) { return true; }
    }
    return false;
  }

  static sortString(data: any[], keyword: string, direction: string): any[] {
    switch (direction) {
      case 'asc':
        return data.sort((a, b) => a[keyword].localeCompare(b[keyword]));
      case 'desc':
        return data.sort((a, b) => b[keyword].localeCompare(a[keyword]));
      default:
        return data;
    }
  }

  static sortNumber(data: any[], keyword: string, direction: string): any[] {
    switch (direction) {
      case 'asc':
        return data.sort((a, b) => a[keyword] - b[keyword]);
      case 'desc':
        return data.sort((a, b) => b[keyword] - a[keyword]);
      default:
        return data;
    }
  }

  static normalize(data: string, lowercase: boolean = false): string {
    if (lowercase === true) {
      return data.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    } else {
      return data.replace(/([A-Z])/g, ' $1').trim();
    }
  }

  static normalizeList(data: string[], lowercase: boolean = false) {
    const n = data.length;
    for (let i = 0; i < n; i++) {
      data[i] = this.normalize(data[i], lowercase);
    }
  }
}

export class FileFunc {
  static async convertUrlToBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener(
        'load', () => resolve(reader.result),
        false
      );

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    });
  }

  static async convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener(
        'load', () => resolve(reader.result),
        false
      );

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(file);
    });
  }
}

export class FormFunc {
  static touchControls(controls) {
    for (const i in controls) {
      if (controls.hasValue(i)) {
        controls[i].markAsTouched();
      }
    }
  }

  static toNgbDate(datetime) {
    const date = new Date(datetime);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  static fromNgbDateToJson(data): string {
    return data.year + '-' + data.month + '-' + data.day;
  }

  static toJsonDate(data: Date): string {
    const yyyy = data.getFullYear().toString();
    const mm = data.getMonth() < 9 ? '0' + (data.getMonth() + 1) : '' + (data.getMonth() + 1);
    const dd = data.getDate() < 10 ? '0' + data.getDate() : '' + data.getDate();

    return yyyy + '-' + mm + '-' + dd;
  }

  static convertToRadioYesNo(bool): string {
    if (bool === true) { return 'true'; }
    if (bool === false) { return 'false'; }
  }

  static dateIsSameMonth(date1: Date, date2: Date): boolean {
    if (date1.getFullYear() !== date2.getFullYear()) { return false; }
    return date1.getMonth() === date2.getMonth();
  }

  static dateIsSameYear(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear();
  }
}

export class ImageFunc {
    public static GetIFD(imageString: string): number {
        if (!imageString.includes('data:image/jpeg;base64')) return null;
        const exif = piexif.load(imageString);
        return exif["0th"][piexif.ImageIFD];
    }

    public static TransformCss(orientation: number): string {
        const transform = '';
        switch (orientation) {
            case 2: return transform + 'rotateY(180deg)';
            case 3: return transform + 'rotate(180deg)';
            case 4: return transform + 'rotate(180deg) rotateY(180deg)';
            case 5: return transform + 'rotate(270deg) rotateY(180deg)';
            case 6: return transform + 'translateY(-100%) rotate(90deg)';
            case 7: return transform + 'translateY(-100%) translateX(-100%) rotate(90deg) rotateY(180deg)';
            case 8: return transform + 'translateX(-100%) rotate(270deg)';
            default: return transform + 'none';
        }
    }
  
    public static TransformImage(imageString: string): string {
      if (!imageString.includes('data:image/jpeg;base64')) return imageString;
      const ifd = GetIFD(imageString);
      if (!ifd) return null;
      if (!ifd.Orientation || ifd.Orientation === 0 || ifd.Orientation === 1) return imageString;
      
      // begin to transform taken pictures
      const orientation = ifd.Orientation;
      let image = new Image();
      let base64 = '';

      image.onload = () => {
        let canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        let ctx = canvas.getContext('2d');
        let x = 0;
        let y = 0;
        ctx.save();
        
        switch(orientation) {
          case 2:
            x = -canvas.width;
            ctx.scale(-1, 1);
            break;
          case 3:
            x = -canvas.width;
            y = -canvas.height;
            ctx.scale(-1, -1);
            break;
          case 4:
            y = -canvas.height;
            ctx.scale(1, -1);
            break;
          case 5:
            canvas.width = image.height;
            canvas.height = image.width;
            ctx.translate(canvas.width, canvas.height / canvas.width);
            ctx.rotate(Math.PI / 2);
            y = -canvas.width;
            ctx.scale(1, -1);
            break;
          case 6:
            canvas.width = image.height;
            canvas.height = image.width;
            ctx.translate(canvas.width, canvas.height / canvas.width);
            ctx.rotate(Math.PI / 2);
            break;
          case 7:
            canvas.width = image.height;
            canvas.height = image.width;
            ctx.translate(canvas.width, canvas.height / canvas.width);
            ctx.rotate(Math.PI / 2);
            x = -canvas.height;
            ctx.scale(-1, 1);
            break;
          case 8:
            canvas.width = image.height;
            canvas.height = image.width;
            ctx.translate(canvas.width, canvas.height / canvas.width);
            ctx.rotate(Math.PI / 2);
            x = -canvas.height;
            y = -canvas.width;
            ctx.scale(-1, -1);
            break;
        }
        ctx.drawImage(image, x, y);
        ctx.restore();
        base64 = canvas.toDataURL("image/jpeg", 0.8);
      }
      
      return base64;
    }
}


