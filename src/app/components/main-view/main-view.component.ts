import {Component, OnInit, AfterViewInit, Inject, AfterViewChecked, Injectable, OnDestroy} from '@angular/core';
import {NativeResponseService} from '../../services/native/native-response.service';
import {LocationService} from '../../services/location.service';
import {UserActions} from '../../store/actions/UserActions';
import {LocationActions} from '../../store/actions/LocationActions';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import {Unsubscribe} from 'redux';
import {MatDialog} from '@angular/material';
import {AlertService} from '../../services/alert.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {TransmissionService} from '../../services/transmission.service';
import * as d3 from 'd3';
import { CoaService } from '../../services/coa.service';
import { JsonpCallbackContext } from '@angular/common/http/src/jsonp';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
@Injectable()
export class MainViewComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  private readonly _unsubscribe: Unsubscribe;
  private registerLocationmessage: any;
  private subscriptionBack: Subscription;
  private subscriptionLocationid: Subscription;
  private comingBack: boolean;
  private subscriptionCoaParts: Subscription;
  private subscriptionUserCoaParts: Subscription;
  public user: any;
  public timelineLocations: any;
  public isWeb: boolean;
  public closestExhibit: number;
  public locationId: string;

  /////////////////////
  private stringDates = ['1450', '1600'];
  private parseDate = d3.timeParse('%Y');
  private svgHeight = 3000;
  private svgWidth = 320;
  private y;
  private whichY;

  currentSection = 10;
  sectionList = [
    {code: 10, icon: 'Trumpet', primaryColor: '#823a3a', secondaryColor: '#a85757'},
    {code: 20, icon: 'DocumentSword', primaryColor: '#305978', secondaryColor: '#4b799c'},
    {code: 30, icon: 'Maximilian', primaryColor: '#755300', secondaryColor: '#906e1b'},
    {code: 40, icon: 'Veil', primaryColor: '#1d635d', secondaryColor: '#3c7f7a'},
    {code: 50, icon: 'Shrine', primaryColor: '#5c416a', secondaryColor: '#785d86'},
    {code: 60, icon: 'Tombstone',  primaryColor: '#32633a', secondaryColor: '#4c7d54'}
  ];
  currentEntrance = [];
  sortedExhbits = [];
  mergedDates = [];
  cardPositions = [];
  redirected = false;

  constructor(
    private transmissionService: TransmissionService,
    private locationService: LocationService,
    @Inject('AppStore') private appStore,
    private userActions: UserActions,
    private locationActions: LocationActions,
    private nativeCommunicationService: NativeCommunicationService,
    private nativeResponseService: NativeResponseService,
    private dialog: MatDialog,
    public router: Router,
    private alertService: AlertService,
    private coaService: CoaService
  ){
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this.closestExhibit = state.closestExhibit;
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
  }

  public requestRegisterLocation(id: number, parentId: number, locked: boolean){
    if(!locked && id && parentId){
      if(id === 5001){ this.checkCoaUnlock(); }
      this.transmissionService.transmitLocationRegister({minor: id, major: parentId});
    }
  }

  checkCoaUnlock(){
    let allUnlocked = true;
    this.timelineLocations.forEach(loc => {
      if(loc.id !== 502 && loc.id !== 6000 && loc.locked){
        allUnlocked = false;
      }
    });
   
    if(allUnlocked){
      this.coaService.tryUnlock(24);
    }
  }

  ngOnInit() {
    const state = this.appStore.getState();
    this.user = state.user;
    this.locationService.lookuptable = state.lookupTable;
    this.timelineLocations = this.locationService.getTimelineLocations();
    // console.log(this.timelineLocations);
    this.closestExhibit = state.closestExhibit;
    this.startSection(this.closestExhibit);
    this.isWeb = this.nativeCommunicationService.isWeb;
    this.sortLocationData();

    this.transmissionService.getCoaParts();
    this.transmissionService.getUserCoaParts();
  }

  ngAfterViewChecked(){
    // If boxes lose position after content update, call reDraw()
    if (d3.select('#exh_101').style('position') !== 'absolute'){
      this.reDraw();
      this.goToClosestExhibit();
    } 

    if(this.redirected){
      this.redirected = false;
      this.goToClosestExhibit();
    }
  }

  startSection(closestExhibit: number){
    closestExhibit ? this.currentSection = +((closestExhibit).toString().substring(0,2)) : this.currentSection = 10;
  }

  ngAfterViewInit(){
    // Draw Timeline
    this.y = d3.scaleTime()
      .domain(d3.extent(this.stringDates, (d: any) => this.parseDate(d)))
      .range([0, this.svgHeight]);

    const svg = d3.select('#timeline').append('svg')
        .attr('height', this.svgHeight).attr('width', this.svgWidth);

    const axis = svg.append('g')
      .attr('class', 'y axis').attr('transform', 'translate(0,0)').style('margin-top', '200px')
      .call(d3.axisLeft(this.y).ticks(15).tickFormat(d3.timeFormat('%Y')))
      .selectAll('text').attr('y', 6).attr('x', 6).style('text-anchor', 'start').style('color', '#ffffff');

    svg.select('.domain').attr('stroke-width', '0');
      
    this.whichY = d3.scaleLinear()
    .domain([1450, 1600]).range([0, this.svgHeight]);

    /* Draw and place exhibitions */
    this.sortedExhbits[0].forEach((currentExhibits) => {
      let lineX = 50;
      let prevStart = 0;
      let prevEnd = 0;
      this.mergedDates.length = 0;
    
      currentExhibits.forEach((exh, index) => {
        let boxY = exh.startDate;
        const timespan = exh.endDate - exh.startDate;

        // Look at previous: If not the first, check time overlap with previous event
        // If same timespan -> merge them. If not -> increase x of new line
        if(exh.id !== currentExhibits[0].id && !(exh.startDate >= prevEnd || exh.endDate <= prevStart)) { 
          if(exh.startDate === prevStart && exh.endDate === prevEnd){
            const qtDates = this.mergeDate(exh.startDate); 
            boxY = boxY + (4.6 * qtDates);
          } else { lineX = lineX + 20; }
        } 
        prevStart = exh.startDate;
        prevEnd = exh.endDate;
        
        // Look at next: If there is an event to be displayed next but the timespan is to short: move card
        if(currentExhibits[index + 1] && currentExhibits[index + 1].endDate !== exh.endDate){
          if(timespan < 5 && Math.abs(currentExhibits[index + 1].startDate - exh.startDate) < 5) {
            boxY = boxY - (4.6 - timespan);
          } else if(currentExhibits[index + 1].startDate === exh.startDate) {
            boxY = boxY + 6;
          }
        }

        // Draw event line and save card position
        const line = svg.append('line').attr('x1', lineX).attr('x2', lineX)
          .attr('class', 'timespanline line_'+ exh.parentId)
          .attr('y1', this.whichY(exh.startDate)).attr('y2', this.whichY(exh.endDate))
          .attr('stroke-width', '8').attr('stroke', this.getSectionPrimaryColor(exh.parentId));
          
        this.cardPositions.push({id: exh.id, boxY: boxY, lineX: lineX });

      });
    });
  }

  mergeDate(mDate: number){
    this.mergedDates.push(mDate);
    let count = 0;
    this.mergedDates.forEach((date) => {
      if(date === mDate) {count++;}
    });

    return count;
  }

  reDraw(){
    // Get calculated positions and place cards
    this.cardPositions.forEach((pos) => {
      const card = d3.select('#exh_' + pos.id).style('position','absolute')
          .style('top', (this.whichY(pos.boxY) + 200) +'px').style('left', (pos.lineX + 1) +'px');
    });

    // Hide everything then show only selected section
    d3.selectAll('.card.exhibit').transition().style('display', 'none');
    d3.selectAll('.timespanline').transition().style('opacity', '0');
    d3.selectAll('.card.Sec' + this.currentSection).transition().style('display', 'inline');
    d3.selectAll('.line_' + this.currentSection).transition().style('opacity', '1');
  }

  setCurrentExhibits(){
    this.currentEntrance.length = 0;
    this.sortedExhbits.length = 0;

    const sec1Exhibits = [];
    const sec2Exhibits = [];
    const sec3Exhibits = [];
    const sec4Exhibits = [];
    const sec5Exhibits = [];
    const sec6Exhibits = [];

    this.timelineLocations.forEach((loc) => {
      if (loc.locationTypeId === 5) {
        this.currentEntrance.push(loc);
      } else {
        switch(loc.parentId){
          case 10: sec1Exhibits.push(loc); break;
          case 20: sec2Exhibits.push(loc); break;
          case 30: sec3Exhibits.push(loc); break;
          case 40: sec4Exhibits.push(loc); break;
          case 50: sec5Exhibits.push(loc); break;
          case 60: sec6Exhibits.push(loc); break;
        }
      }  
    });

    this.sortedExhbits.push([sec1Exhibits, sec2Exhibits, sec3Exhibits, sec4Exhibits, sec5Exhibits, sec6Exhibits,]);
  }


  sortLocationData( ){
    const mtimelineLocations = this.timelineLocations;
    // console.log(this.timelineLocations);

    this.timelineLocations.forEach((exh, index) => {
      if(this.timelineLocations[index + 1] && exh.locationTypeId !== 5 && exh.parentId === this.timelineLocations[index + 1].parentId){
        if(!(exh.startDate >= this.timelineLocations[index + 1].endDate || exh.endDate <= this.timelineLocations[index + 1].startDate)){
          if(this.timelineLocations[index + 1].startDate - exh.startDate < 5 && this.timelineLocations[index + 1].endDate !== exh.endDate) {
            mtimelineLocations[index] =  this.timelineLocations[index + 1];
            mtimelineLocations[index + 1] =  exh;
          }
        }
      }
    });    

    this.timelineLocations = mtimelineLocations;
    this.setCurrentExhibits();
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

  getSectionPrimaryColor(sectionId: number){
    let color = '';
    this.sectionList.forEach((section) => {
      if(section.code === sectionId){
        color = section.primaryColor;
      }
    });

    return color;
  }

  getSectionSecondaryColor(sectionId: number){
    let color = '';
    this.sectionList.forEach((section) => {
      if(section.code === sectionId){
        color = section.secondaryColor;
      }
    });
    
    return color;
  }

  displaySection(sectionId: number, auto: boolean){
    this.currentSection = sectionId;
    this.reDraw();
    this.redirected = auto;
  }

  public userCoA(){
    this.router.navigate(['wappen']).then( () =>
      {
        window.scrollTo(0, 0);
        this.nativeCommunicationService.sendToNative('Coat of Arms', 'print');
      }
    );
  }

  isClose(exhibit: number){
    let state = false;
    (this.closestExhibit === exhibit) ? state = true : state = false; 
    return state;
  }

  goToClosestExhibit() {
    if(this.closestExhibit){
      const secCode = (this.closestExhibit).toString().substring(0,2);
      if(secCode !== this.currentSection.toString()){
        this.displaySection(+secCode, true);
      }else{
        this.scrollTo(this.closestExhibit);
      }  
    }
  }

  scroll() {
    const id = this.registerLocationmessage.location;
    
    const secCode = id.toString().substring(0,2);
    if(secCode !== this.currentSection.toString()){
      this.displaySection(+secCode, true);
    }

    this.scrollTo(+id);
  }

  scrollTo(id: number) {
    /* Previous implementation: worked on Android but not on iOS */
    // const el = document.getElementById('exh_'+id);
    // el.scrollIntoView({behavior:'smooth'});

    /* Smooth scrolling as well for Safari / iOS */
    this.smoothScroll(id);
  }

  // sets timeout for scrolling
  scrollToTimeout(yPoint: number, duration: number) {
    setTimeout(() => {
        window.scrollTo(0, yPoint);
    }, duration);
    return;
  }

  /*
  ---------------------------------------------------------------------------
    Scroll functions to implement smooth scrolling as well for Safari / iOS
  ---------------------------------------------------------------------------
  */
  smoothScroll(eID) {
    const startY = currentYPosition();
    const stopY = elmYPosition(eID) - 100;
    const distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 20) {
        window.scrollTo(0, stopY); return;
    }

    // test with other values for steps and speed
    let speed = Math.round(distance / 100);
    if (speed >= 20) {
      speed = 20;
    }
    const step = Math.round(distance / 100);

    let leapY = stopY > startY ? startY + step : startY - step;

    let timer = 0;
    if (stopY > startY) {
      for (let i = startY; i < stopY; i += step) {
          this.scrollToTimeout(leapY, timer * speed);
          leapY += step; 
          if (leapY > stopY) {
            leapY = stopY; 
            timer++;
          }
      } return;
    }

    for (let i = startY; i > stopY; i -= step) {
        this.scrollToTimeout(leapY, timer * speed);
        leapY -= step; 
        if (leapY < stopY) {
          leapY = stopY; 
          timer++;
        } 
    }

  }

  /*
  ------------------------------------------------------------
                      Helper functions
  ------------------------------------------------------------
  */

  public requestRegisterLocationTest(id: number, parentId: number)
  {
    this.nativeResponseService.timelineUpdate({minor: id, major: parentId});
  }

  public checkWifiForWeb()
  {
    this.nativeResponseService.checkWifi({ssid: 'FH_STP_WLAN'});
  }
}

function currentYPosition() {
  // Firefox, Chrome, Opera, Safari
  if (self.pageYOffset) {
    return self.pageYOffset;
  } 
  // Internet Explorer 6 - standards mode
  if (document.documentElement && document.documentElement.scrollTop) {
    return document.documentElement.scrollTop;
  }
  // Internet Explorer 6, 7 and 8
  if (document.body.scrollTop) {
    return document.body.scrollTop;
  }
  return 0;
}

function elmYPosition(eID) {
  const elm = document.getElementById('exh_'+eID);
  let y = 0;
  elm ? y = elm.offsetTop : y = 0;

  // let node  = elm;
  /*while (node.offsetParent && node.offsetParent !== document.body) {
      node = node.offsetParent;
      y += elm.offsetTop;
  }*/
  return y;
}
