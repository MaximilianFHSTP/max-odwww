import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '../communication.service';

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
    private communicationService: CommunicationService,
  ) { }

  public requestDeviceInfos()
  {
    this.communicationService.registerName = this.name;

    // TODO detect if iOS or Android and differ between them
    // this.winRef.nativeWindow.webkit.messageHandlers.getDeviceInfos.postMessage('get');

    // INFO Workaround for trying the application in the browser
    const data = {deviceAddress: 'deviceAddress', deviceOS: 'deviceOS', deviceVersion: 'deviceVersion', deviceModel: 'deviceModel'};
    this.communicationService.transmitODRegister(data);
  }

  ngOnInit()
  {
    this.name = '';
    if (localStorage.getItem('user') && localStorage.getItem('lookuptable'))
    {
      this.router.navigate(['/mainview']);
    }
  }

}
