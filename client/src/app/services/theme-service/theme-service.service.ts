import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkThemeSubject.asObservable();

  constructor(private localStorageService: LocalStorageService) {
    const storedTheme = this.localStorageService.getData('isDarkTheme');
    if (storedTheme) {
      this.isDarkThemeSubject.next(storedTheme === 'true');
    }
  }

  setDarkTheme(isDark: boolean) {
    this.isDarkThemeSubject.next(isDark);
    this.localStorageService.saveData('isDarkTheme', isDark.toString());
  }

  toggleTheme() {
    this.setDarkTheme(!this.isDarkThemeSubject.value);
  }
}