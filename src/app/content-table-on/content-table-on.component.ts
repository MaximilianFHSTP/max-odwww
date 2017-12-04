import { Component, OnInit, OnDestroy } from '@angular/core';
import { GodService } from '../services/god.service';
import {LocationService} from '../services/location.service';
import {ExhibitService} from '../services/exhibit.service';

@Component({
  selector: 'app-content-table-on',
  templateUrl: './content-table-on.component.html',
  styleUrls: ['./content-table-on.component.css']
})
export class ContentTableOnComponent implements OnInit {
  private connectionSuccess: boolean;
  private location: any;
  private locationName: string;

  constructor(
    private godService: GodService,
    private exhibitService: ExhibitService,
    private locationService: LocationService
  ) { }

  ngOnInit() {
    this.location = this.locationService.currentLocation;
    this.locationName = this.location.description;
    // TODO get IP address from LocationService
    const ip = this.location.ipAddress;

    // TODO open SocketConnection connectOD(user)
    // if success set connectionSuccess true
    this.connectionSuccess = false;

    this.exhibitService.connectOD();

    localStorage.setItem('onExhibit', JSON.stringify(true));
  }

  public disconnectFromExhibit()
  {
    this.exhibitService.disconnect();
    localStorage.setItem('atExhibitParent', JSON.stringify(0));
    localStorage.setItem('onExhibit', JSON.stringify(false));
  }

  ngOnDestroy() {
    this.disconnectFromExhibit();
  }
}
