import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../../WindowRef';
import {UserActions} from '../../store/actions/UserActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import {TransmissionService} from '../../services/transmission.service';

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
    private transmissionService: TransmissionService,
    private winRef: WindowRef,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private nativeCommunicationService: NativeCommunicationService
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
    this.transmissionService.registerIsGuest = true;
    const state = this.appStore.getState();
    const platform = state.platform;

    this.nativeCommunicationService.sendToNative('getDeviceInfos', 'getDeviceInfos');

    if (platform !== 'IOS' && platform !== 'Android')
    {
      const data = {deviceAddress: 'deviceAddress', deviceOS: 'deviceOS', deviceVersion: 'deviceVersion', deviceModel: 'deviceModel'};
      this.transmissionService.transmitODRegister(data);
    }
  }

}
