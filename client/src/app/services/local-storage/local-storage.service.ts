import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() {
    if (!this.isLocalStorageAvailable()) {
      console.error('Local Storage is not available.');
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  public saveData(key: string, value: string) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    } else {
      console.warn('Local Storage is not available. Data not saved.');
    }
  }

  public getData(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    }
    console.warn('Local Storage is not available.');
    return null;
  }

  public removeData(key: string) {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  public clearData() {
    if (this.isLocalStorageAvailable()) {
      localStorage.clear();
    }
  }
}
