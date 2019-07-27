export class DataImplemented {
  static include(data: object, search: string, keywords: string[]): boolean {
    search = search.toLocaleLowerCase();
    let n = keywords.length;
    for (let i=0; i<n; i++) {
      if (data[keywords[i]].toLocaleLowerCase().includes(search)) return true;
    }
    return false;
  }

  static includeNumber(data: object, search: string, keywords: string[]): boolean {
    search = search.toLocaleLowerCase();
    let n = keywords.length;
    for (let i=0; i<n; i++) {
      if (data[keywords[i]].toString().toLocaleLowerCase().includes(search)) return true;
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

  static sortNumber(data: any[], keyword: string, direction: string) {
    switch (direction) {
      case 'asc':
        return data.sort((a, b) => a[keyword] - b[keyword]);
      case 'desc':
        return data.sort((a, b) => b[keyword] - a[keyword]);
      default:
        return data;
    }
  }
}

export class FileImplemented {
  static async convertUrlToBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        function() {
          resolve(reader.result);
        },
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
        "load",
        function() {
          resolve(reader.result);
        },
        false
      );
  
      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(file);
    });
  }
}

export class FormImplemented {
  static touchControls(controls) {
    for (let i in controls) {
      controls[i].markAsTouched();
    }
  }

  static convertToNgbDate(datetime) {
    let date = new Date(datetime);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }
  
  static convertFromNgbDate(data) {
    return data.year + "-" + data.month + "-" + data.day;
  }
  
  static convertToRadioYesNo(bool) {
    if (bool == true) return "true";
    if (bool == false) return "false";
  }
}
