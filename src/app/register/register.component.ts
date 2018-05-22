import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../services/native-communication.service';
import { WindowRef } from '../WindowRef';
import {UserActions} from '../actions/UserActions';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
@Injectable()
export class RegisterComponent implements OnInit
{
  public name: string;

  constructor(
    private router: Router,
    private nativeCommunicationService: NativeCommunicationService,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private utilitiesService: UtilitiesService
  ) { }

  public requestDeviceInfos(isGuest: boolean)
  {
    this.nativeCommunicationService.registerName = this.name;
    this.nativeCommunicationService.registerIsGuest = isGuest;

    const state = this.appStore.getState();
    const platform = state.platform;

    this.utilitiesService.sendToNative('getDeviceInfos', 'getDeviceInfos');

    /*
    switch (platform) {
      case 'IOS':
        this.winRef.nativeWindow.webkit.messageHandlers.getDeviceInfos.postMessage('get');
      break;

      case 'Android':
        this.winRef.nativeWindow.MEETeUXAndroidAppRoot.getDeviceInfos();
      break;

      default:
        // INFO: Workaround for trying the application in the browser
        const data = {deviceAddress: 'deviceAddress', deviceOS: 'deviceOS', deviceVersion: 'deviceVersion', deviceModel: 'deviceModel'};
        this.nativeCommunicationService.transmitODRegister(data);
        break;
    }*/
  }

  ngOnInit()
  {
    this.name = '';
  }

}
