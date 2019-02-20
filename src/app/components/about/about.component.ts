import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import {LanguageService} from '../../services/language.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private nativeCommunicationService: NativeCommunicationService
  ) { }

  ngOnInit() {
  }

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }

}
