import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppConfig {
  apiKey: string;
  userName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  public config$: Observable<AppConfig | null> = this.configSubject.asObservable();

  constructor() {
    // Try to load config from sessionStorage
    const savedConfig = sessionStorage.getItem('appConfig');
    if (savedConfig) {
      this.configSubject.next(JSON.parse(savedConfig));
    }
  }

  setConfig(config: AppConfig): void {
    this.configSubject.next(config);
    sessionStorage.setItem('appConfig', JSON.stringify(config));
  }

  getConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  clearConfig(): void {
    this.configSubject.next(null);
    sessionStorage.removeItem('appConfig');
  }

  isConfigured(): boolean {
    return this.configSubject.value !== null && !!this.configSubject.value.apiKey;
  }
}
