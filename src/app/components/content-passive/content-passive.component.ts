import {Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, Inject} from '@angular/core';
import { LocationService } from '../../services/location.service';
import {Unsubscribe} from 'redux';
import {Subscription} from 'rxjs';
import {TransmissionService} from '../../services/transmission.service';
import {CoaService} from '../../services/coa.service';
import {Router} from '@angular/router';
import { NativeCommunicationService } from '../../services/native/native-communication.service';
import * as ContentTypes from '../../config/ContentTypes';
import {LanguageService} from '../../services/language.service';
import * as d3 from 'd3';

@Component(
  {
  selector: 'app-content-passive',
  templateUrl: './content-passive.component.html',
  styleUrls: ['./content-passive.component.css']
  }
)
export class ContentPassiveComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy
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
  mContent = [];
  changeVersion = false;
  pMargin = 0;
  textContent: string;
  eventStartDate = 0;
  eventEndDate = 0;

  constructor(
    private locationService: LocationService,
    private transmissionService: TransmissionService,
    public languageService: LanguageService,
    private coaService: CoaService,
    public router: Router,
    private nativeCommunicationService: NativeCommunicationService,
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
    // console.log(this.location);

    if(this.location.id === 6000 || this.location.id === 6001){
      this.coaService.tryUnlock(33);
    }
  }

  ngAfterViewInit(){
    // if(there are events)
    this.mContent = [];
    this.location.contents.forEach(content => {
      if(content.contentTypeId === ContentTypes.EVENT){
        this.mContent.push({id: content.id, content: content.content, type: content.contentTypeId, year: content.year, top: 0});

        // set timespan according to events
        if(this.eventStartDate === 0){
          this.eventStartDate = content.year;
          this.eventEndDate = content.year;
        }else{
          (content.year < this.eventStartDate) ? this.eventStartDate = content.year : this.eventEndDate = content.year;
        }
      }
    });

    if(this.mContent.length > 0){
      this.drawEventTimeline();
    }
  }

  ngAfterViewChecked(){
    // If boxes lose position after content update, call reDraw()
    if (this.changeVersion){
      this.changeVersion = false;
      this.pMargin = 0;
      this.drawText();
    } 
  }

  drawEventTimeline(){
    // Draw Event Timeline
    const start = this.eventStartDate;  // this.location.startDate;
    const end = this.eventEndDate + 1;  // this.location.endDate + 1;
    const stringDates = [start.toString(),end.toString()];
    const svgHeight = (end - start) * 60;
    const parseDate = d3.timeParse('%Y');

    const y = d3.scaleTime()
      .domain(d3.extent(stringDates, (d: any) => parseDate(d)))
      .range([0, svgHeight]);

    const svg = d3.select('#timeline').append('svg')
        .attr('height', svgHeight).attr('width', 200);

    const axis = svg.append('g')
      .attr('class', 'y axis').attr('transform', 'translate(0,0)')
      .call(d3.axisLeft(y).ticks(end - start).tickFormat(d3.timeFormat('%Y')))
      .selectAll('text').attr('y', 6).attr('x', 6).style('text-anchor', 'start')
      .style('font-size', '1.3em').style('color', this.getSectionPrimaryColor(this.location.parentId));
    svg.select('.domain').attr('stroke-width', '0');
      
    const whichY = d3.scaleLinear().domain([start, end]).range([0, svgHeight]);

    this.mContent.forEach((content, index) => {
      const point = svg.append('line').attr('x1', 50).attr('x2', 50)
        .attr('y1', whichY(content.year)).attr('y2', whichY(content.year + 0.18))
        .attr('stroke-width', '8').attr('stroke', this.getSectionPrimaryColor(this.location.parentId));

        content.top = whichY(content.year);
    });
    
    this.drawText();
  }

  drawText(){
    const progressbar: HTMLElement = document.getElementById('timeline') as HTMLElement;
    // console.log(progressbar.offsetTop);
    d3.select('#timeline').selectAll('p').remove();

    this.mContent.forEach((content, index) => {
      const text = d3.select('#timeline').append('p').text(content.content).style('position', 'absolute')
      .style('left', '50px').style('top', (content.top + progressbar.offsetTop) +'px').style('font-family', 'sans-serif')
      .style('margin', this.pMargin + 'px 20px 0px 75px')
      .style('font-size', '0.8em').style('color', this.getSectionPrimaryColor(this.location.parentId));
    });  
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
    this.changeVersion = true;

    if(sectionId === 'sunthaym'){
      this.coaService.tryUnlock(20);
    } else if(sectionId === 'till'){
      this.coaService.tryUnlock(41);
    }
    
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

  public userCoA(){
    this.router.navigate(['wappen']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Coat of Arms', 'print');
      }
    );
  }
}
