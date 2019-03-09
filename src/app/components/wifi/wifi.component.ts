import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import {LanguageService} from '../../services/language.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wifi',
  templateUrl: './wifi.component.html',
  styleUrls: ['./wifi.component.css']
})
export class WifiComponent implements OnInit {
  private subscriptionNativeBackbutton: Subscription;

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

}
