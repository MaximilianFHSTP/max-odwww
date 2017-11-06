import { Component, OnInit } from '@angular/core';
import { WindowRef } from '../WindowRef';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(
    private winRef: WindowRef
  ) { }

  ngOnInit() {
  }

  register() {
    // TODO detect if iOS or Android and differ between them
    this.winRef.nativeWindow.webkit.messageHandlers.getDeviceInfos.postMessage("get");
  }

}
