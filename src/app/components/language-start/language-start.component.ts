import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import { LanguageService } from '../../services/language.service';
import {TranslateService} from '@ngx-translate/core';
import * as languageTypes from '../../config/LanguageTypes';

@Component({
  selector: 'app-language-start',
  templateUrl: './language-start.component.html',
  styleUrls: ['./language-start.component.css']
})
@Injectable()
export class LanguageStartComponent implements OnInit
{
  public language: string;

  constructor(
    private router: Router,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    
   }

  ngOnInit(){ 
    this.language = this.languageService.getCurrentLanguageAsString();
    
  }

  changeLanguageToGerman(){
    this.language = 'de';
    this.languageService.transmitChangeAppLanguage(languageTypes.DE);
  }

  changeLanguageToEnglish(){
    this.language = 'en';
    this.languageService.transmitChangeAppLanguage(languageTypes.ENG);  
  }

  isSelected(lang: string){
    let selected = false;
    (this.language === lang) ? selected = true : selected = false;
    return selected;
  }
}
