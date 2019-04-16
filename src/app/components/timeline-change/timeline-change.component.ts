import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { NativeResponseService } from '../../services/native/native-response.service';
import { LanguageService } from '../../services/language.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { LocationService } from '../../services/location.service';

export interface Timeline {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-timeline-change',
  templateUrl: './timeline-change.component.html',
  styleUrls: ['./timeline-change.component.css']
})
export class TimelineChangeComponent implements OnInit {

  timelines: Timeline[] = [
    {value: 'timeline-1', viewValue: 'Section based'},
    {value: 'timeline-2', viewValue: 'Stacked'},
    {value: 'timeline-3', viewValue: 'All in one'}
  ];

  private subscriptionNativeBackbutton: Subscription;
  public selectedTimeline: string;

  constructor(
    @Inject('AppStore') private appStore,
    private router: Router,
    public languageService: LanguageService,
    private alertService: AlertService,
    private nativeCommunicationService: NativeCommunicationService,
    private locationService: LocationService
  ) { 
    this.subscriptionNativeBackbutton = this.alertService.getMessageNativeBackbutton().subscribe(() => {
      const elm: HTMLElement = document.getElementById('closebutton') as HTMLElement;
      if(elm){ elm.click(); }
    });
  }

  ngOnInit() {
    if(this.locationService.getTimelineVersion()){
      this.selectedTimeline = this.locationService.getTimelineVersion();
    }else{
      this.selectedTimeline = 'timeline-1';
      this.locationService.setTimelineVersion(this.selectedTimeline);
    }
    
  }

  public timelineChanged(){
    this.locationService.setTimelineVersion(this.selectedTimeline);
  }

  public closeWindow(){
    this.router.navigate(['mainview']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Main View', 'print');
      }
    );
  }
}
