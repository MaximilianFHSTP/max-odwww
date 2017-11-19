import { Component, OnInit } from '@angular/core';
import {NativeCommunicationService} from '../native-communication.service';
import {LocationService} from '../location.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent implements OnInit {
  private user: any;
  private lookuptable: any;

  constructor(
    private nativeCommunicationService: NativeCommunicationService,
    private locationService: LocationService
  ) { }

  public requestRegisterLocation()
  {
    this.nativeCommunicationService.transmitLocationRegister({minor: 100, major: 10});
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.locationService.lookuptable = JSON.parse(localStorage.getItem('lookuptable'));
  }

}
