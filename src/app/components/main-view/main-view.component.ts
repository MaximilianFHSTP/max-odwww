import { Component, OnInit, AfterViewInit, Inject, AfterViewChecked, Injectable, OnDestroy} from '@angular/core';
import { MatDialog } from '@angular/material';
import { NativeResponseService } from '../../services/native/native-response.service';
import { LocationService } from '../../services/location.service';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import { AlertService } from '../../services/alert.service';
import { CoaService } from '../../services/coa.service';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Unsubscribe } from 'redux';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import * as LanguageTypes from '../../config/LanguageTypes';
import * as LocationTypes from '../../config/LocationTypes';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
@Injectable()
export class MainViewComponent implements OnInit, AfterViewInit, AfterViewChecked {
  private readonly _unsubscribe: Unsubscribe;
  private registerLocationmessage: any;
  private subscriptionBack: Subscription;
  private subscriptionLocationid: Subscription;
  private subscriptionCoaParts: Subscription;
  private subscriptionUserCoaParts: Subscription;
  private subscriptionSwipe: Subscription;
  private subscriptionVersionCheck: Subscription;

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
  public sortedExhbits = [];
  public mergedDates = [];
  public cardPositions = [];
  public mOs = '';

  private stringDates = ['1450', '1530'];
  private parseDate = d3.timeParse('%Y');
  private svgHeight = 1600;
  private svgWidth = 320;
  private y;
  private whichY;
  public enabledQuestions = false;

  constructor(
    public locationService: LocationService,
    private translate: TranslateService,
    @Inject('AppStore') private appStore,
    private nativeCommunicationService: NativeCommunicationService,
    private nativeResponseService: NativeResponseService,
    private alertService: AlertService,
    private dialog: MatDialog,
    public router: Router,
    public coaService: CoaService,
    public languageService: LanguageService
  ){}

  ngOnInit() {
    this.timelineLocations = this.locationService.getTimelineLocations();
    this.currentSection = this.locationService.getLastSection();
    if(!this.currentSection) {this.currentSection = 10;}

    this.isWeb = this.nativeCommunicationService.isWeb;
    this.sortLocationData();

    if(this.nativeCommunicationService.isIOS) {this.mOs = 'ios'; }
    else if(this.nativeCommunicationService.isAndroid) {this.mOs = 'android'; }
    else if(this.nativeCommunicationService.isWeb) {this.mOs = ''; }
  }

  /* ----- Sort Data, Draw Timeline, Check for changes ---- */

  ngAfterViewInit(){
    // Draw Timeline
    this.y = d3.scaleTime().domain(d3.extent(this.stringDates, (d: any) => this.parseDate(d))).range([0, this.svgHeight]);
    const svg = d3.select('#timeline').append('svg').attr('height', this.svgHeight).attr('width', this.svgWidth);
    const axis = svg.append('g')
      .attr('class', 'y axis').attr('transform', 'translate(0,0)').style('margin-top', '200px')
      .call(d3.axisLeft(this.y).ticks(10).tickFormat(d3.timeFormat('%Y')))
      .selectAll('text').attr('y', 6).attr('x', 6).style('text-anchor', 'start').style('color', '#ffffff');

    svg.select('.domain').attr('stroke-width', '0');
    this.whichY = d3.scaleLinear().domain([1450, 1530]).range([0, this.svgHeight]);

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
          .attr('stroke-width', '8').attr('stroke', this.getSectionPrimaryColor(exh.parentId)).style('opacity', '0');

        this.cardPositions.push({id: exh.id, boxY: boxY, lineX: lineX });
      });
    });
  }

  ngAfterViewChecked(){
    // If boxes lose position after content update, call reDraw()
    if (d3.select('#exh_101').style('position') !== 'absolute'){
      this.reDraw();
    }

    // If changing section, monitor need for new scroll
    if(this.redirected){
      this.redirected = false;
      this.goToClosestExhibit();
    }

    // If changing section, monitor need for new icon
    if (this.updatePart){
      this.colorSVGIcons();
      this.updatePart = false;
    }
  }

  reDraw(){
    // Get calculated positions and place cards
    this.cardPositions.forEach((pos) => {
      const card = d3.select('#exh_' + pos.id)
      .style('position','absolute').style('top', (this.whichY(pos.boxY) + 200) +'px').style('left', (pos.lineX + 2) +'px');
    });

    // Hide everything then show only selected section
    if(this.locationService.isSaveLastLocation()){
      this.showTimeline();
    } else {
      this.hideTimeline();
      this.showTimeline();
    }
    this.colorSVGIcons();

    if(this.locationService.isSaveLastLocation()){
      d3.transition().duration(0).tween('scroll', this.scrollTween(this.locationService.getLastWindowOffset() - window.scrollY));
      this.locationService.cleanLastLocation();
    }
  }

  hideTimeline(){
    d3.selectAll('.card.exhibit').transition().duration(0).style('opacity', '0').style('display', 'none');
    d3.selectAll('.timespanline').transition().duration(0).style('opacity', '0');
  }

  showTimeline(){
    const fade = 0; // or 150
    d3.selectAll('.card.lckfalse.Sec' + this.currentSection).transition().duration(fade).style('opacity', '1').style('display', 'inline');
    d3.selectAll('.card.lcktrue.Sec' + this.currentSection).transition().duration(fade).style('opacity', '0.5').style('display', 'inline');
    d3.selectAll('.line_' + this.currentSection).transition().duration(fade).style('opacity', '1');
  }

  colorSVGIcons(){
    switch(this.currentSection){
      case 10:
        d3.selectAll('.sectionColorSvg').attr('fill', '#a85757');
        d3.selectAll('li.Sec10 .sectionColorSvg').attr('fill', '#ffffff'); break;
      case 20:
        d3.selectAll('.sectionColorSvg').attr('fill', '#4b799c');
        d3.selectAll('li.Sec20 .sectionColorSvg').attr('fill', '#ffffff'); break;
      case 30:
        d3.selectAll('.sectionColorSvg').attr('fill', '#906e1b');
        d3.selectAll('li.Sec30 .sectionColorSvg').attr('fill', '#ffffff'); break;
      case 40:
        d3.selectAll('.sectionColorSvg').attr('fill', '#3c7f7a');
        d3.selectAll('li.Sec40 .sectionColorSvg').attr('fill', '#ffffff'); break;
      case 50:
        d3.selectAll('.sectionColorSvg').attr('fill', '#785d86');
        d3.selectAll('li.Sec50 .sectionColorSvg').attr('fill', '#ffffff'); break;
      case 60:
        d3.selectAll('.sectionColorSvg').attr('fill', '#4c7d54');
        d3.selectAll('li.Sec60 .sectionColorSvg').attr('fill', '#ffffff'); break;
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
    this.sortedExhbits.length = 0;

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

    this.sortedExhbits.push([sec1Exh, sec2Exh, sec3Exh, sec4Exh, sec5Exh, sec6Exh,]);
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

  handleSwipe(direction: any) {


    if (direction['swipe'] === 'right') {
      if (this.currentSection >= 20){
        this.currentSection -= 10;
        const elm: HTMLElement = document.getElementById('Sec'+this.currentSection) as HTMLElement;
        if(elm){ elm.click(); }
      }
    }
    else if (direction['swipe'] === 'left'){
      if (this.currentSection <= 50){
        this.currentSection += 10;
        const elm: HTMLElement = document.getElementById('Sec'+this.currentSection) as HTMLElement;
       if(elm){ elm.click(); }
      }
    }
  }

  displaySection(sectionId: number, auto: boolean){
    this.currentSection = sectionId;
    this.redirected = auto;
    this.updatePart = true;
    this.reDraw();
  }

  public userCoA(){
    this.router.navigate(['wappen']).then( () => {
      window.scrollTo(0, 0);
      this.nativeCommunicationService.sendToNative('Coat of Arms', 'print');
    });
  }

  public helpScreen(){
    this.router.navigate(['help']).then( () => {
      window.scrollTo(0, 0);
      this.nativeCommunicationService.sendToNative('Help Screen', 'print');
    });
  }

  /* ------ Enter Exhibit View ------- */

  public requestRegisterLocation(id: number, parentId: number, typeId: number){
    if(id && parentId){
      if(typeId === LocationTypes.PASSIVE_EXHIBIT ||
        typeId === LocationTypes.DOOR){
          this.locationService.saveCurrentLocation(this.getLocation(id));
          this.router.navigate(['/passive']).then( () => {
            window.scrollTo(0, 0);
          });
      }
      else if(typeId === LocationTypes.INTERACTIVE_EXHIBIT){
          this.locationService.saveCurrentLocation(this.getLocation(id));
          this.router.navigate(['/interactive']).then( () => {
            window.scrollTo(0, 0);
          });
      }
      else if(typeId === LocationTypes.NOTIFY_EXHIBIT_AT){
        this.locationService.saveCurrentLocation(this.getLocation(id));
        this.router.navigate(['/tableNotifyAt']).then( () => {
          window.scrollTo(0, 0);
        });
      }
      else if(typeId === LocationTypes.ACTIVE_EXHIBIT_BEHAVIOR_AT){
        this.locationService.saveCurrentLocation(this.getLocation(id));
        this.router.navigate(['/tableat']).then( () => {
          window.scrollTo(0, 0);
        });
      }

      this.locationService.setPreviousState(this.currentSection, window.pageYOffset || document.documentElement.scrollTop);
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
        (loc.parentId !== this.currentSection) ? this.displaySection(loc.parentId, true) : this.scrollTo(loc.id);
      }
    }
  }

  scroll() {
    const loc = this.getLocation(this.registerLocationmessage.location);
    if(loc){
      if(loc.parentId !== this.currentSection){
        this.displaySection(loc.parentId, true);
      }
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

  get ariaSec1(): string { return this.translate.instant('ariaLabels.ariaSec1'); }
  get ariaSec2(): string { return this.translate.instant('ariaLabels.ariaSec2'); }
  get ariaSec3(): string { return this.translate.instant('ariaLabels.ariaSec3'); }
  get ariaSec4(): string { return this.translate.instant('ariaLabels.ariaSec4'); }
  get ariaSec5(): string { return this.translate.instant('ariaLabels.ariaSec5'); }
  get ariaSec6(): string { return this.translate.instant('ariaLabels.ariaSec6'); }
  get ariaCoaBtn(): string { return this.translate.instant('ariaLabels.ariaCoaBtn'); }
  get ariaQstBtn(): string { return this.translate.instant('ariaLabels.ariaQstBtn'); }
  get ariaLocBtn(): string { return this.translate.instant('ariaLabels.ariaLocBtn'); }

  /*
  ------------------------------------------------------------
                      Helper functions
  ------------------------------------------------------------
  */

  public requestRegisterLocationTest(id: number, parentId: number){
    this.nativeResponseService.timelineUpdate({minor: id, major: parentId});
  }
}
