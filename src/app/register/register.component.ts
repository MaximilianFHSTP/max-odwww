import { Component, OnInit } from '@angular/core';
import { WindowRef } from '../WindowRef';
import { GodService } from '../god.service';
import { CommunicationService } from '../communication.service';
import { Router } from '@angular/router';

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
    private godService: GodService,
    private communicationService: CommunicationService,
    private router: Router
  ) { }

  public requestDeviceInfos()
  {
    this.communicationService.registerName = this.name;
    // TODO detect if iOS or Android and differ between them
    this.winRef.nativeWindow.webkit.messageHandlers.getDeviceInfos.postMessage('get');
  }

  ngOnInit()
  {
    this.name = '';
  }

}
