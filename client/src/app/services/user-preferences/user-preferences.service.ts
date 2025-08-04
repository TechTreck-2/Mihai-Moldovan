import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly STORAGE_KEY = 'UserPreferences';
  private preferencesSubject = new BehaviorSubject<any>({});
  public preferences$ = this.preferencesSubject.asObservable();

  constructor(private localStorageService: LocalStorageService) { 
    // Initialize with current preferences
    const initialPrefs = this.getAllPreferences();
    this.preferencesSubject.next(initialPrefs);
  }

  private getAllPreferences(): any {
    const data = this.localStorageService.getData(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private saveAllPreferences(preferences: any): void {
    this.localStorageService.saveData(this.STORAGE_KEY, JSON.stringify(preferences));
    this.preferencesSubject.next(preferences);
  }

  setPreference(key: string, value: any): void {
    const preferences = this.getAllPreferences();
    preferences[key] = value;
    this.saveAllPreferences(preferences);
  }

  getPreference(key: string): any {
    const preferences = this.getAllPreferences();
    return preferences[key] !== undefined ? preferences[key] : null;
  }

  removePreference(key: string): void {
    const preferences = this.getAllPreferences();
    delete preferences[key];
    this.saveAllPreferences(preferences);
  }

  clearPreferences(): void {
    this.localStorageService.removeData(this.STORAGE_KEY);
    this.preferencesSubject.next({});
  }

  // Get observable for a specific preference
  getPreferenceObservable(key: string): Observable<any> {
    return new Observable(observer => {
      const subscription = this.preferences$.subscribe(prefs => {
        observer.next(prefs[key]);
      });
      return () => subscription.unsubscribe();
    });
  }
}