import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import {LanguageService} from '../../services/language.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  private subscriptionNativeBackbutton: Subscription;
  showMenu = true;
  showInfo = '';

  constructor(
    private router: Router,
    public languageService: LanguageService,
    private alertService: AlertService,
    private nativeCommunicationService: NativeCommunicationService
  ) { 
    this.subscriptionNativeBackbutton = this.alertService.getMessageNativeBackbutton().subscribe(() => {
      const elm: HTMLElement = document.getElementById('closebutton') as HTMLElement;
      if(elm){ elm.click(); }
    });
  }

  ngOnInit() {
  }

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }

  show(option: string){
    switch(option){
      case 'showWifiInfo':
        this.showMenu = false;
        this.showInfo = option;
        break;
      case 'showMenu':
        this.showMenu = true;
        this.showInfo = '';
        break;
    }
  }

}
