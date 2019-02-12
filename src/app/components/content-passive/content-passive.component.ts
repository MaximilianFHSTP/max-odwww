import {Component, OnInit, AfterViewInit, OnDestroy, Inject} from '@angular/core';
import { LocationService } from '../../services/location.service';
import {Unsubscribe} from 'redux';
import {Subscription} from 'rxjs';
import {TransmissionService} from '../../services/transmission.service';
import * as ContentTypes from '../../config/ContentTypes';
import * as d3 from 'd3';

@Component(
  {
  selector: 'app-content-passive',
  templateUrl: './content-passive.component.html',
  styleUrls: ['./content-passive.component.css']
  }
)
export class ContentPassiveComponent implements OnInit, AfterViewInit, OnDestroy
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
  mContent = [
    {id: 10, content: 'Event 1', type: 3, year: 1468},
    {id: 20, content: 'DocumentSword', type: 1, year: 0},
    {id: 30, content: 'Vorlesungen der Chorherren Wolfgang Winthager und Johannes Swarcz an der Universität Wien', type: 3, year: 1469},
    {id: 40, content: 'Veil', type: 1, year: 0},
    {id: 50, content: 'Event 3', type: 3, year: 1470},
    {id: 60, content: 'Tombstone',  type: 1, year: 0}
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

  ngAfterViewInit(){
    // if(there are events)
    this.drawEventTimeline();
    
  }

  drawEventTimeline(){
    // Draw Event Timeline
    const start = this.location.startDate;
    const end = this.location.endDate + 1;
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
      if(content.type === ContentTypes.EVENT){

        const point = svg.append('line').attr('x1', 50).attr('x2', 50)
          .attr('y1', whichY(content.year)).attr('y2', whichY(content.year + 0.18))
          .attr('stroke-width', '8').attr('stroke', this.getSectionPrimaryColor(this.location.parentId));
          
        const text = d3.select('#timeline').append('p').text(content.content).style('position', 'absolute')
        .style('left', '50px').style('top', whichY(content.year) +'px').style('font-family', 'sans-serif')
        .style('margin', '75px 20px 0px 75px')
        .style('font-size', '0.8em').style('color', this.getSectionPrimaryColor(this.location.parentId));
      }
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
}
