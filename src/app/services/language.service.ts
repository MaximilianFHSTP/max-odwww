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
      if(state.language !== this._currentLanguage)
      {
        this.updateTranslateService(state.language);
        this._currentLanguage = state.language;
      }
    });
  }

  public transmitChangeUserLanguage(lang: number)
  {
    this.updateTranslateService(lang);
    this.godService.updateUserLanguage(lang);
  }

  public getCurrentLanguageAsString(): string
  {
    switch (this._currentLanguage)
    {
      case LanguageTypes.DE: return 'de';
      default: return 'en';
    }
  }

  private updateTranslateService(lang: number)
  {
    if(lang === LanguageTypes.DE)
    {
      this.translateService.use('de');
    } else
    {
      this.translateService.use('en');
    }
  }
}
