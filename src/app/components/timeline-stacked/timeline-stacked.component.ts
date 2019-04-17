import { Component, OnInit, AfterViewInit, Inject, AfterViewChecked, Injectable, OnDestroy} from '@angular/core';
import { QuestionnaireDialogComponent } from '../questionnaire-dialog/questionnaire-dialog.component';
import { MatDialog } from '@angular/material';
import { NativeResponseService } from '../../services/native/native-response.service';
import { LocationService } from '../../services/location.service';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { AlertService } from '../../services/alert.service';
import { CoaService } from '../../services/coa.service';
import { LanguageService } from '../../services/language.service';
import { TransmissionService } from '../../services/transmission.service';
import { Router } from '@angular/router';
import { Unsubscribe } from 'redux';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import * as LanguageTypes from '../../config/LanguageTypes';
import * as LocationTypes from '../../config/LocationTypes';

@Component({
  selector: 'app-timeline-stacked',
  templateUrl: './timeline-stacked.component.html',
  styleUrls: ['./timeline-stacked.component.css']
})
@Injectable()
export class TimelineStackedComponent implements OnInit, OnDestroy {
  private readonly _unsubscribe: Unsubscribe;
  private registerLocationmessage: any;
  private subscriptionBack: Subscription;
  private subscriptionLocationid: Subscription;
  private subscriptionCoaParts: Subscription;
  private subscriptionUserCoaParts: Subscription;
  private subscriptionSwipe: Subscription;

  public user: any;
  public timelineLocations: any;
  public isWeb: boolean;
  public closestExhibit: number;
  public prevClosestExhibit = 0;
  public locationId: string;
  public currentSection: number;
  public redirected = false;
  public updatePart = false;
  public germanLang = LanguageTypes.DE;
  public sectionList = [
    {code: 10, icon: 'Trumpet', primaryColor: '#823a3a', secondaryColor: '#a85757'},
    {code: 20, icon: 'DocumentSword', primaryColor: '#305978', secondaryColor: '#4b799c'},
    {code: 30, icon: 'Maximilian', primaryColor: '#755300', secondaryColor: '#906e1b'},
    {code: 40, icon: 'Veil', primaryColor: '#1d635d', secondaryColor: '#3c7f7a'},
    {code: 50, icon: 'Shrine', primaryColor: '#5c416a', secondaryColor: '#785d86'},
    {code: 60, icon: 'Tombstone',  primaryColor: '#32633a', secondaryColor: '#4c7d54'}
  ];
  public currentEntrance = [];
  public sortedExhibits = [];
  public exhibitsSortedBySection = [];
  public mergedDates = [];
  public cardPositions = [];

  private stringDates = ['1450', '1530'];
  private parseDate = d3.timeParse('%Y');
  private svgHeight = 1600;
  private svgWidth = 320;
  private y;
  private whichY;

  constructor(
    private transmissionService: TransmissionService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private nativeCommunicationService: NativeCommunicationService,
    private nativeResponseService: NativeResponseService,
    private alertService: AlertService,
    private dialog: MatDialog,
    public router: Router,
    public coaService: CoaService,
    public languageService: LanguageService
  ){
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this.closestExhibit = state.closestExhibit;
      if(this.prevClosestExhibit !== this.closestExhibit){
        if(this.prevClosestExhibit !== 0){ this.buttonAnimationOn(); }
        this.prevClosestExhibit = this.closestExhibit;
      }
      this.timelineLocations = this.locationService.getTimelineLocations();
      this.sortLocationData();
    });
    this.subscriptionLocationid = this.alertService.getMessageLocationid().subscribe(message => {
      this.registerLocationmessage = message;
    });
    this.subscriptionCoaParts = this.alertService.getMessageCoaParts().subscribe(message => {
      this.coaService.setCoaParts(message.data);
    });
    this.subscriptionUserCoaParts = this.alertService.getMessageUserCoaParts().subscribe(message => {
      this.coaService.setUserCoaParts(message.data);
    });
  }

  ngOnDestroy() {
    this._unsubscribe();
    if (this.subscriptionBack){
      this.subscriptionBack.unsubscribe();
    }
    if (this.subscriptionLocationid){
      this.subscriptionLocationid.unsubscribe();
    }
    if (this.subscriptionCoaParts){
      this.subscriptionCoaParts.unsubscribe();
    }
    if (this.subscriptionUserCoaParts){
      this.subscriptionUserCoaParts.unsubscribe();
    }
    if(this.subscriptionSwipe){
      this.subscriptionSwipe.unsubscribe();
    }
  }

  ngOnInit() {
    const state = this.appStore.getState();
    this.user = state.user;

    switch (this.locationService.getTimelineVersion()) {
      case 'timeline-2':
        this.router.navigate(['timelineStacked']).then( () =>
          {
            this.nativeCommunicationService.sendToNative('Timeline stacked', 'print');
          }
        );
        break;
      case 'timeline-3':
        this.router.navigate(['timelineAllinone']).then( () =>
          {
            this.nativeCommunicationService.sendToNative('Timeline allinone', 'print');
          }
        );
        break;
      default:
        // stay here
        break;
    }
    

    if(state.language !== this.languageService.getCurrentLanguage){
      this.languageService.transmitChangeUserLanguage(state.language);
    }
    
    this.locationService.lookuptable = state.lookupTable;
    this.timelineLocations = this.locationService.getTimelineLocations();
    
    this.closestExhibit = state.closestExhibit;
    this.currentSection = this.locationService.getLastSection();
    if(!this.currentSection) {this.currentSection = 10;}

    this.isWeb = this.nativeCommunicationService.isWeb;
    this.sortLocationData();

    this.transmissionService.getCoaParts();
    this.transmissionService.getUserCoaParts();
    if(this.locationService.getVisitedAll() && !this.locationService.getQuestionsDismissed()){
      // Enable questionnaire dialog in next release
      // setTimeout(() => this.displayQuestionnaireDialog());
    }
  }

  mergeDate(mDate: number){
    this.mergedDates.push(mDate);
    let count = 0;
    this.mergedDates.forEach((date) => { if(date === mDate) {count++;} });
    return count;
  }

  sortLocationData( ){
    // Ad hoc reordering and adjustments
    const mtimelineLocations = this.timelineLocations;
    let exhX;

    this.timelineLocations.forEach((exh, index) => {

      // Fix cases in wich the timespan of the next exhibit would pass over the current one
      if(this.timelineLocations[index + 1] && exh.locationTypeId !== 5 && exh.parentId === this.timelineLocations[index + 1].parentId){
        if(!(exh.startDate >= this.timelineLocations[index + 1].endDate || exh.endDate <= this.timelineLocations[index + 1].startDate)){
          if(this.timelineLocations[index + 1].startDate - exh.startDate < 5 && this.timelineLocations[index + 1].endDate !== exh.endDate) {
            mtimelineLocations[index] =  this.timelineLocations[index + 1];
            mtimelineLocations[index + 1] =  exh;
          }
        }
      }
      
      // Fix positioning of specific exhibits (502-5001)
      if(exh.id === 502){
        exhX = index;
      }else if(exhX && exh.id === 5001){
        mtimelineLocations[index] =  this.timelineLocations[exhX];
        mtimelineLocations[exhX] =  exh;
      }

      // Adjust Maximilian's death (6001)
      if(exh.id === 6001){
        mtimelineLocations[index].endDate = mtimelineLocations[index].startDate + 0.5;
      }
    });

    this.timelineLocations = mtimelineLocations;
    this.setCurrentExhibits();
  }

  setCurrentExhibits(){
    this.currentEntrance.length = 0;
    this.sortedExhibits.length = 0;
    this.exhibitsSortedBySection.length = 0;

    const sec1Exh = [];
    const sec2Exh = [];
    const sec3Exh = [];
    const sec4Exh = [];
    const sec5Exh = [];
    const sec6Exh = [];

    this.timelineLocations.forEach((loc) => {
      if (loc.locationTypeId === 5) {
        this.currentEntrance.push(loc);
      } else {
        switch(loc.parentId){
          case 10: sec1Exh.push(loc); break;
          case 20: sec2Exh.push(loc); break;
          case 30: sec3Exh.push(loc); break;
          case 40: sec4Exh.push(loc); break;
          case 50: sec5Exh.push(loc); break;
          case 60: sec6Exh.push(loc); break;
        }
      }  
    });
    
    this.timelineLocations.forEach((loc) => {
      if(loc.locationTypeId === 5) {
        this.exhibitsSortedBySection.push([loc]);
      }
    });

    this.timelineLocations.forEach((loc) => {
      if(loc.locationTypeId !== 5) {
        switch(loc.parentId){
          case 10: this.exhibitsSortedBySection[0].push(loc); break;
          case 20: this.exhibitsSortedBySection[1].push(loc); break;
          case 30: this.exhibitsSortedBySection[2].push(loc); break;
          case 40: this.exhibitsSortedBySection[3].push(loc); break;
          case 50: this.exhibitsSortedBySection[4].push(loc); break;
          case 60: this.exhibitsSortedBySection[5].push(loc); break;
        }
      }
    });
    
    this.exhibitsSortedBySection[3].sort(this.compare);

    console.log(this.exhibitsSortedBySection);

    this.sortedExhibits.push(sec1Exh, sec2Exh, sec3Exh, sec4Exh, sec5Exh, sec6Exh);
  }

  compare(a, b){
    if (a.id.toString().split('').pop() < b.id.toString().split('').pop()){
      return -1;
    }
    if (a.id.toString().split('').pop() > b.id.toString().split('').pop()){
      return 1;
    }
    return 0;
  }

  getSectionPrimaryColor(sectionId: number){
    let color = '';
    this.sectionList.forEach((section) => {
      if(section.code === sectionId){
        color = section.primaryColor;
      }
    });

    return color;
  }

  /* ------------- Navbar and Toolbar buttons ------------- */
  public userCoA(){
    this.router.navigate(['wappen']).then( () => {
      window.scrollTo(0, 0);
      this.nativeCommunicationService.sendToNative('Coat of Arms', 'print');
    });
  }

  /* ------ Enter Exhibit View (check CoA and Wifi) ------- */

  public requestRegisterLocation(id: number, parentId: number, locked: boolean, typeId: number){
    if(!locked && id && parentId){
      if(id === 5001){  this.checkCoaUnlock();  }
      else if(id === 502 || id === 6001 || id === 6000){ this.checkQuestionsUnlock(); }
      if(typeId === LocationTypes.ACTIVE_EXHIBBIT_AT || 
         typeId === LocationTypes.ACTIVE_EXHIBIT_BEHAVIOR_AT || 
         typeId === LocationTypes.NOTIFY_EXHIBIT_AT){ 
        this.checkWifi(); 
      }

      this.locationService.setPreviousState(this.currentSection, window.pageYOffset || document.documentElement.scrollTop);
      this.transmissionService.transmitLocationRegister({minor: id, major: parentId});
    }
  }

  public checkWifi(){
    this.nativeResponseService.getWifiDataFromGoD();
  }

  checkAllUnlock(): boolean{
    let allUnlocked = true;
    this.timelineLocations.forEach(loc => {
      if(loc.id !== 502 && loc.id !== 6000 && loc.locked){
        allUnlocked = false;
      }
    });
   
    return allUnlocked;
  }

  checkCoaUnlock(){
    if(this.checkAllUnlock()){
      this.coaService.tryUnlock(24);
    }
  }

  checkQuestionsUnlock(){
    if(this.checkAllUnlock()){
      this.locationService.setVisitedAll(true);
    }
  }

  /* -------- Location Button and Scroll Functions -------- */

  isClose(exhibit: number){
    let state = false;
    (this.closestExhibit === exhibit) ? state = true : state = false; 
    return state;
  }

  buttonAnimationOn(){
    d3.select('.locationbutton').transition().style('box-shadow', '0px 0px 18px #888').transition().style('box-shadow', 'none');
  }

  goToClosestExhibit() {
    if(this.closestExhibit){
      const loc = this.getLocation(this.closestExhibit);
      if(loc && !loc.locked){
        this.scrollTo(loc.id);
      }
    }
  }

  scroll() {
    const loc = this.getLocation(this.registerLocationmessage.location);
    if(loc){
      this.scrollTo(loc.id);
    }
  }

  scrollTo(id: number) {
    const card = document.getElementById('exh_'+id);
    if(card && card.offsetTop !== 0){
      d3.transition().duration(1000).tween('scroll', this.scrollTween((card.offsetTop - 170) ));
    } else {
      this.redirected = true;
    }
  }

  scrollTween(offset: any) {
    return function() {
      const i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
      return function(t) { scrollTo(0, i(t)); };
    };
  }

  getLocation(id: any){
    let loc;
    this.timelineLocations.forEach((exh) => {if(exh.id === id){loc = exh;}});
    return loc;
  }

  /* ---------------- Questionnaire Dialog ---------------- */

  displayQuestionnaireDialog(){
    window.scrollTo(0, 0);
    const dialogRef = this.dialog.open(QuestionnaireDialogComponent,
      {data: { username: ''},
        disableClose: true,
        autoFocus: false
      });
    dialogRef.afterClosed().subscribe(result =>{
      if(result === 'confirm'){
        this.locationService.setVisitedAll(false);
        this.router.navigate(['questionnaire']).then( () => {
          window.scrollTo(0, 0);
          this.nativeCommunicationService.sendToNative('Questionnaire', 'print');
        });
      }else if(result === 'done'){
        this.locationService.setVisitedAll(false); 
        this.locationService.setQuestionsDismissed(true);
        // TODO check database        
      }else{
        this.locationService.setVisitedAll(false);
        this.locationService.setQuestionsDismissed(true);
      }
    });
  }

  /*
  ------------------------------------------------------------
                      Helper functions
  ------------------------------------------------------------
  */

  public requestRegisterLocationTest(id: number, parentId: number){
    this.nativeResponseService.timelineUpdate({minor: id, major: parentId});
  }

  public checkWifiForWeb(){
    this.nativeResponseService.getWifiDataFromGoD();
  }
}
