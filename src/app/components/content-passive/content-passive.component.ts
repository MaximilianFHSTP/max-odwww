import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { LocationService } from '../../services/location.service';
import {Unsubscribe} from 'redux';
import {Subscription} from 'rxjs/Subscription';
import {TransmissionService} from '../../services/transmission.service';

@Component(
  {
  selector: 'app-content-passive',
  templateUrl: './content-passive.component.html',
  styleUrls: ['./content-passive.component.css']
  }
)
export class ContentPassiveComponent implements OnInit, OnDestroy
{
  public location: any;
  private readonly _unsubscribe: Unsubscribe;
  private _curLocSubscribe: Subscription;
  currentSection = 'maximilian';
  sectionList = [
    {code: 10, icon: 'Trumpet', primaryColor: '#823a3a', secondaryColor: '#a85757'},
    {code: 20, icon: 'DocumentSword', primaryColor: '#305978', secondaryColor: '#4b799c'},
    {code: 30, icon: 'Maximilian', primaryColor: '#755300', secondaryColor: '#906e1b'},
    {code: 40, icon: 'Veil', primaryColor: '#1d635d', secondaryColor: '#3c7f7a'},
    {code: 50, icon: 'Shrine', primaryColor: '#5c416a', secondaryColor: '#785d86'},
    {code: 60, icon: 'Tombstone',  primaryColor: '#32633a', secondaryColor: '#4c7d54'}
  ];

  constructor(
    private locationService: LocationService,
    private transmissionService: TransmissionService,
    @Inject('AppStore') private appStore
  ) {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this.updateLocationInformation(state.currentLocation);
    });

    this._curLocSubscribe = this.locationService.currentLocation.subscribe(value =>
    {
      this.location = value;
      // console.log(this.location);
    });
  }

  ngOnInit()
  {
    const state = this.appStore.getState();
    this.updateLocationInformation(state.currentLocation);
  }

  updateLocationInformation(value)
  {
    this.location = value;
  }

  ngOnDestroy() {
    this._unsubscribe();
    this._curLocSubscribe.unsubscribe();
  }

  registerLocationLike() {
    this.transmissionService.transmitLocationLike(true);
  }

  registerLocationUnlike() {
    this.transmissionService.transmitLocationLike(false);
  }

  displayVersion(sectionId: string){
    this.currentSection = sectionId;
  }

  getSectionIcon(sectionId: number){
    let icon = '';
    this.sectionList.forEach((section) => {
      if(section.code === sectionId){
        icon = section.icon;
      }
    });

    return icon;
  }
}
