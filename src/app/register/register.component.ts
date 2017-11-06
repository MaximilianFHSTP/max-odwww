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

  public transmitUserRegister()
  {
    console.log(this.name);
    const data = {identifier: this.name, deviceAddress: '-', deviceOS: 'iOS', deviceVersion: '11.1', deviceModel: 'IPhone X'};
    // this.godService.registerUser(data);
    // TODO detect if iOS or Android and differ between them
    this.winRef.nativeWindow.webkit.messageHandlers.getDeviceInfos.postMessage('get');
  }

  ngOnInit()
  {
    this.name = '';
  }

}
