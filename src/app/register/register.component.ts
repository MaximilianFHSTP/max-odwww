import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../services/native-communication.service';
import { WindowRef } from '../WindowRef';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit
{
  public name: string;

  constructor(
    private router: Router,
    private nativeCommunicationService: NativeCommunicationService,
    private winRef: WindowRef,
  ) { }

  public requestDeviceInfos()
  {
    this.nativeCommunicationService.registerName = this.name;

    // TODO detect if iOS or Android and differ between them
    if(this.nativeCommunicationService.isIOS){
      this.winRef.nativeWindow.webkit.messageHandlers.getDeviceInfos.postMessage('get');
    }else if(this.nativeCommunicationService.isAndroid){
      this.winRef.nativeWindow.MEETeUXAndroidAppRoot.getDeviceInfos();
    }else{
      // INFO Workaround for trying the application in the browser
      const data = {deviceAddress: 'deviceAddress', deviceOS: 'deviceOS', deviceVersion: 'deviceVersion', deviceModel: 'deviceModel'};
      this.nativeCommunicationService.transmitODRegister(data);
    }



  }

  ngOnInit()
  {
    this.name = '';
  /*  if (localStorage.getItem('user') && localStorage.getItem('lookuptable'))
    {
      this.router.navigate(['/mainview']).then( () =>
      {
        // send success to native & start beacon scan
        // TODO: switch für iOS & Android
        this.winRef.nativeWindow.webkit.messageHandlers.registerOD.postMessage('success');
      });

    }*/
  }

}
