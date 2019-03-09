import {Inject, Injectable} from '@angular/core';
import {GodService} from './god/god.service';
import {TranslateService} from '@ngx-translate/core';
import * as LanguageTypes from '../config/LanguageTypes';
import {Unsubscribe} from 'redux';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private _currentLanguage = LanguageTypes.ENG;
  private readonly _unsubscribe: Unsubscribe;

  constructor(
    private godService: GodService,
    private translateService: TranslateService,
    @Inject('AppStore') private appStore,
  )
  {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      if(state.isLoggedIn && state.language !== this._currentLanguage)
      {
        this.updateTranslateService(state.language);
        this._currentLanguage = state.language;
      }
    });
  }

  /**
   * Method changes the language of the app and stores it for the user
   * Should be called if the user is already logged in
   * @param lang
   */
  public transmitChangeUserLanguage(lang: number)
  {
    this.updateTranslateService(lang);
    this.godService.updateUserLanguage(lang);
  }

  /**
   * Method changes the language of the app
   * Should be called if the user is NOT logged in
   * @param lang
   */
  public transmitChangeAppLanguage(lang: number)
  {
    this.updateTranslateService(lang);
    this._currentLanguage = lang;
  }

  public getCurrentLanguageAsString(): string
  {
    let languageStr = '';

    if(LanguageTypes.DE === Number(this._currentLanguage)){
      languageStr = 'de';
    } else {
      languageStr = 'en';
    }
    return languageStr;
  }

  public getCurrentLanguage(): number
  {
    return Number(this._currentLanguage);
  }

  private updateTranslateService(lang: number)
  {
    if(Number(lang) === LanguageTypes.DE)
    {
      this.translateService.use('de');
    } else
    {
      this.translateService.use('en');
    }
  }
}
