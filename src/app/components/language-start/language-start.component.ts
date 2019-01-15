import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {UserActions} from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import {TransmissionService} from '../../services/transmission.service';
import { LanguageService } from '../../services/language.service';
import * as languageTypes from '../../config/LanguageTypes';

@Component({
  selector: 'app-language-start',
  templateUrl: './language-start.component.html',
  styleUrls: ['./language-start.component.css']
})
@Injectable()
export class LanguageStartComponent implements OnInit
{
  constructor(
    private router: Router,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private languageService: LanguageService
  ) { }

  ngOnInit()
  {
  }

  changeLanguageToGerman(){
    this.languageService.transmitChangeAppLanguage(languageTypes.DE);
  }

  changeLanguageToEnglish(){
    this.languageService.transmitChangeAppLanguage(languageTypes.ENG);
  }
}
