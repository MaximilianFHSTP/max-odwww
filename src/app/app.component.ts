import { Component, NgZone } from '@angular/core';
import {NativeCommunicationService} from './services/native-communication.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  public platform: String;

  constructor(
    private nativeCommunicationService: NativeCommunicationService
  ) { }

  ngOnInit() {
    this.requestCheckedPlatform();
  }

  public requestCheckedPlatform(){
    this.platform = this.nativeCommunicationService.checkPlatform();
    console.log("Detected Platform " + this.platform);
  }
}
