import { Injectable } from '@angular/core';
import {GodService} from './god/god.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(
    private godService: GodService
  ) { }

  public transmitChangeUserLanguage(lang: number)
  {
    this.godService.updateUserLanguage(lang);
  }
}
