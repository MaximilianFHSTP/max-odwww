import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../WindowRef';
import {UserActions} from '../actions/UserActions';
import { AppComponent } from '../app.component';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';
import { NativeCommunicationService } from '../services/native-communication.service';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-start-view',
  templateUrl: './start-view.component.html',
  styleUrls: ['./start-view.component.css']
})
@Injectable()
export class StartViewComponent implements OnInit
{
  constructor(
    private router: Router,
    private nativeCommunicationService: NativeCommunicationService,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private utilitiesService: UtilitiesService
  ) { }


  ngOnInit()
  {
  }

  forwardToRegister(){
    this.router.navigate(['/register']);
  }

  forwardToLogin(){
    this.router.navigate(['/login']);
  }

  loginAsGuest(){
    this.nativeCommunicationService.registerIsGuest = true;
    const state = this.appStore.getState();
    const platform = state.platform;

    this.utilitiesService.sendToNative('getDeviceInfos', 'getDeviceInfos');

    if (platform !== 'IOS' && platform !== 'Android')
    {
      const data = {deviceAddress: 'deviceAddress', deviceOS: 'deviceOS', deviceVersion: 'deviceVersion', deviceModel: 'deviceModel'};
      this.nativeCommunicationService.transmitODRegister(data);
    }
  }

}
