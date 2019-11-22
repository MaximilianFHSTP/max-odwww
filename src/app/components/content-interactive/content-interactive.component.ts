import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { Unsubscribe } from 'redux';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { CoaService } from '../../services/coa.service';

@Component({
  selector: 'app-content-interactive',
  templateUrl: './content-interactive.component.html',
  styleUrls: ['./content-interactive.component.css']
})
export class ContentInteractiveComponent implements OnInit {

  public location: any;
  public locationStatusNotAtLocation = false;
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
    private router: Router,
    private coaService: CoaService,
    public languageService: LanguageService,
    private nativeCommunicationService: NativeCommunicationService,
    @Inject('AppStore') private appStore)
  { }

  ngOnInit() {
    const state = this.appStore.getState();
    this.updateLocationInformation(state.currentLocation);
    this.location = this.locationService.getCurrentLocation();

    if (state.closestExhibit !== this.location.id){
      this.locationStatusNotAtLocation = true;
    }
  }

  updateLocationInformation(value) {
    this.location = value;
  }

  playEducationQuiz() {
    this.router.navigate(['educationQuiz']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Education Quiz', 'print');
      }
    );
  }

  playARBooks(){
    // Call AR for accounting books
    this.nativeCommunicationService.sendToNative('triggerAR', 'triggerAR');
  }

  playARPanels(){
    this.coaService.tryUnlock(30);
    // Call AR for sunthaym panels
    this.nativeCommunicationService.sendToNative('triggerAR', 'triggerAR');
  }

  playARShrine(){
    this.coaService.tryUnlock(40);
    // Call AR for shrine
    this.nativeCommunicationService.sendToNative('triggerAR', 'triggerAR');
  }

  displayVersion(sectionId: string) {
    this.currentSection = sectionId;
  }

  getSectionIcon(sectionId: number) {
    let icon = '';
    this.sectionList.forEach((section) => {
      if(section.code === sectionId){
        icon = section.icon;
      }
    });

    return icon;
  }
}
