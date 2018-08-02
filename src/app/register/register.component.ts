import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../services/native-communication.service';
import { WindowRef } from '../WindowRef';
import {UserActions} from '../actions/UserActions';
import { UtilitiesService } from '../services/utilities.service';
import { AppComponent } from '../app.component';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
@Injectable()
export class RegisterComponent implements OnInit
{
  public name: string;
  public registered: boolean = true;

  constructor(
    private router: Router,
    private nativeCommunicationService: NativeCommunicationService,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private utilitiesService: UtilitiesService,
    private appComponent: AppComponent
  ) { }

  public requestDeviceInfos(isGuest: boolean)
  {
    this.nativeCommunicationService.registerName = this.name;
    this.nativeCommunicationService.registerIsGuest = isGuest;

    this.appComponent.registered = true;

    const state = this.appStore.getState();
    const platform = state.platform;

    this.utilitiesService.sendToNative('getDeviceInfos', 'getDeviceInfos');

    if (platform !== 'IOS' && platform !== 'Android')
    {
      const data = {deviceAddress: 'deviceAddress', deviceOS: 'deviceOS', deviceVersion: 'deviceVersion', deviceModel: 'deviceModel'};
      this.nativeCommunicationService.transmitODRegister(data);
    }
  }

  ngOnInit()
  {
    this.name = '';

  }

}
