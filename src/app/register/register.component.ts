import { Component, OnInit } from '@angular/core';
import { WindowRef } from '../WindowRef';
import { GodService } from '../god.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit
{
  public name: string;

  constructor(
    private winRef: WindowRef,
    private godService: GodService
  ) { }

  public transmitODRegister(result)
  {
    const deviceAddress: string = result.deviceAddress;
    const deviceOS: string = result.deviceOS;
    const deviceVersion: string = result.deviceVersion;
    const deviceModel: string = result.deviceModel;

    const data = {identifier: this.name, deviceAddress, deviceOS, deviceVersion, deviceModel};
    this.godService.registerOD(data);
  }

  public requestDeviceInfos()
  {
    // TODO detect if iOS or Android and differ between them
    this.winRef.nativeWindow.webkit.messageHandlers.getDeviceInfos.postMessage('get');
  }

  ngOnInit()
  {
    this.name = '';
  }

}
