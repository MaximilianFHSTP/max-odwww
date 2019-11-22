import {Inject, Injectable} from '@angular/core';
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
    private translateService: TranslateService,
    @Inject('AppStore') private appStore,
  )
  {
  }

  /**
   * Method changes the language of the app and stores it for the user
   * Should be called if the user is already logged in
   * @param lang
   */
  public transmitChangeUserLanguage(lang: number)
  {
    this.updateTranslateService(lang);
    this._currentLanguage = lang;
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
    let langStr = '';

    if(Number(lang) === LanguageTypes.DE)
    {
      langStr = 'de';
    } else
    {
      langStr = 'en';
    }
    this.translateService.use(langStr);
    document.documentElement.setAttribute('lang', langStr);
  }
}
