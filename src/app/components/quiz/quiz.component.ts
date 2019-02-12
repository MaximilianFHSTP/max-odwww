import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { GodService } from '../../services/god/god.service';
import {LocationService} from '../../services/location.service';
import {ExhibitService} from '../../services/exhibit/exhibit.service';
import {Unsubscribe} from 'redux';
import {LocationActions} from '../../store/actions/LocationActions';
import {NativeCommunicationService} from '../../services/native/native-communication.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import {TransmissionService} from '../../services/transmission.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, OnDestroy {
  public connectionSuccess: boolean;
  public locationName: string;
  public waitingToStart: boolean;
  public notAnswered: boolean;
  public noResponse: boolean;

  public questionId: any;
  public correctAns: any;
  public locationId: any;
  public question: string;
  public answerA: string;
  public answerB: string;
  public answerC: string;
  public answerD: string;
  private answerChar: string;
  public yourAnswer: string;
  public yourPoints: string;
  public yourPointsBar: number;
  public yourStatus = 'Bettelvolk';
  public correctAnswer: string;
  public elaboration: string;

  private firstQuestionOfRun: boolean;
  private startQuizTime: any;
  private quizTime: any;

  private questionStartTime: any;
  private answerTime: any;

  private _location: any;
  private readonly _unsubscribe: Unsubscribe;
  private subscriptionQuestion: any;
  private subscriptionAnswer: Subscription;
  private subscriptionPoints: Subscription;

  constructor(
    private router: Router,
    private transmissionService: TransmissionService,
    private godService: GodService,
    private exhibitService: ExhibitService,
    private locationService: LocationService,
    private nativeCommunicationService: NativeCommunicationService,
    @Inject('AppStore') private appStore,
    private locationActions: LocationActions,
    private alertService: AlertService
  ) {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      this.connectionSuccess = state.connectedToExhibit;
    });
    this.subscriptionQuestion = this.alertService.getQuizQuestion().subscribe(message => {
      this.questionId = message.questionId;
      this.correctAns = message.correctAnswer;
      if(!this.firstQuestionOfRun){
        this.startQuizTime = new Date().getTime();
        this.firstQuestionOfRun = true;
      }
      this.questionStartTime = new Date().getTime();
      this.waitingToStart = false;
      this.notAnswered = true;
      this.yourAnswer = undefined;
      this.answerChar = undefined;
      const progressbar: HTMLElement = document.getElementById('timerbar') as HTMLElement;
      if(progressbar){
        progressbar.remove();
      }
      this.createProgressbar();
      console.log(message);
      this.question = message.question;
      this.answerA = message.answerA;
      this.answerB = message.answerB;
      this.answerC = message.answerC;
      this.answerD = message.answerD;
    });
    this.subscriptionAnswer = this.alertService.getUpdateUserData().subscribe(message => {
      if(this.answerChar !== undefined){
        if(this.answerChar === message.correctAnswer){
          this.exhibitService.updateUserAnswerTable(true);
        }else{
          this.exhibitService.updateUserAnswerTable(false);
        }
      }
      if(this.yourAnswer === undefined || this.yourAnswer === null){
        this.notAnswered = false;
        this.yourAnswer = 'Deine Antwort: keine';
      }
      this.noResponse = false;
      this.elaboration = message.elaboration;
      this.correctAnswer = 'Richtige Antwort ' + message.correctAnswer;
    });
    this.subscriptionPoints = this.alertService.getCorrectPoints().subscribe(message => {
      const points = message;
      if(points<7){
        this.yourPoints = 'Fortschritt: ' + points + '/' + '7 Punkte';
        this.yourStatus = 'Bettelvolk';
        this.yourPointsBar = (points*100)/7;
      }else if(points>=7 && points <13){
        this.yourPoints = 'Fortschritt: ' + points + '/' + '13 Punkte';
        this.yourStatus = 'Buergertum';
        this.yourPointsBar = (points*100)/13;
      }else if(points>=13){
        this.yourPoints = 'Fortschritt: ' + points + '/' + '13 Punkte';
        this.yourStatus = 'Adel';
        this.yourPointsBar = 100;
      }
    });
  }

  ngOnInit() {
    this._location = this.locationService.currentLocation.value;
    this.locationName = this._location.description;
    this.locationId = this._location.parentId;

    const parentLocation = this.locationService.findLocation(this._location.parentId);

    // TODO: get IP address from LocationService
    const url = 'http://' + parentLocation.ipAddress + ':8100';

    this.exhibitService.establishExhibitConnection(url);

    this.exhibitService.connectOD();

    // Weißkunygquiz
    if(this.locationId === 301){
      this.exhibitService.getQuestion();
      this.waitingToStart = true;
      this.exhibitService.getUpdateUserData();
      this.exhibitService.getUserCorrectPoints();
    }

    // localStorage.setItem('onExhibit', JSON.stringify(true));
    this.appStore.dispatch(this.locationActions.changeOnExhibit(false));
    this.locationService.stopLocationScanning();
  }

  ngOnDestroy()
  {
    // Send quizendtime here
    const endQuizTime = new Date().getTime();
    this.quizTime = endQuizTime - this.startQuizTime;
    console.log('onDestroyQuiz', this.quizTime);
    this.exhibitService.sendQuizTime(this.quizTime);
    this.firstQuestionOfRun = false;

    this.exhibitService.disconnect();
    this._unsubscribe();
    this.locationService.startLocationScanning();
    this.subscriptionAnswer.unsubscribe();
    this.subscriptionQuestion.unsubscribe();
    this.subscriptionPoints.unsubscribe();
  }

  public disconnectFromExhibit()
  {
    if(this.nativeCommunicationService.isWeb){
      this.transmissionService.transmitLocationRegister({minor: 301, major: 30});
    } else {
      // Send quizendtime here
      const endQuizTime = new Date().getTime();
      this.quizTime = endQuizTime - this.startQuizTime;
      console.log('DisconnectQuiz', this.quizTime);
      this.exhibitService.sendQuizTime(this.quizTime);
      this.firstQuestionOfRun = false;
      this.exhibitService.disconnect();
    }
  }

  public sendMessageToExhibit()
  {
    this.exhibitService.sendMessage();
  }

  public sendAnswerA()
  {
    const answer = {answerA: true, answerB: false, answerC: false, answerD: false };
    this.answerChar = 'A';
    this.yourAnswer = 'Deine Antwort: A';
    this.notAnswered = false;
    this.noResponse = true;
    const answerDateTime = new Date().getTime();
    this.answerTime = answerDateTime - this.questionStartTime;
    let correct = false;
    if(this.correctAns===this.answerChar){
      correct = true;
    }
    const data = {answerTime: this.answerTime, questionId: this.questionId, correctAnswer: correct};
    this.exhibitService.sendAnswerTime(data);
    this.exhibitService.sendQuizAnswer(answer);
  }

  public sendAnswerB()
  {
    const answer = {answerA: false, answerB: true, answerC: false, answerD: false };
    this.answerChar = 'B';
    this.yourAnswer = 'Deine Antwort: B';
    this.notAnswered = false;
    this.noResponse = true;
    const answerDateTime = new Date().getTime();
    this.answerTime = answerDateTime - this.questionStartTime;
    let correct = false;
    if(this.correctAns===this.answerChar){
      correct = true;
    }
    const data = {answerTime: this.answerTime, questionId: this.questionId, correctAnswer: correct};
    this.exhibitService.sendAnswerTime(data);
    this.exhibitService.sendQuizAnswer(answer);
  }

  public sendAnswerC()
  {
    const answer = {answerA: false, answerB: false, answerC: true, answerD: false };
    this.answerChar = 'C';
    this.yourAnswer = 'Deine Antwort: C';
    this.notAnswered = false;
    this.noResponse = true;
    const answerDateTime = new Date().getTime();
    this.answerTime = answerDateTime - this.questionStartTime;
    let correct = false;
    if(this.correctAns===this.answerChar){
      correct = true;
    }
    const data = {answerTime: this.answerTime, questionId: this.questionId, correctAnswer: correct};
    this.exhibitService.sendAnswerTime(data);
    this.exhibitService.sendQuizAnswer(answer);
  }

  public sendAnswerD()
  {
    const answer = {answerA: false, answerB: false, answerC: false, answerD: true };
    this.answerChar = 'D';
    this.yourAnswer = 'Deine Antwort: D';
    this.notAnswered = false;
    this.noResponse = true;
    const answerDateTime = new Date().getTime();
    this.answerTime = answerDateTime - this.questionStartTime;
    let correct = false;
    if(this.correctAns===this.answerChar){
      correct = true;
    }
    const data = {answerTime: this.answerTime, questionId: this.questionId, correctAnswer: correct};
    this.exhibitService.sendAnswerTime(data);
    this.exhibitService.sendQuizAnswer(answer);
  }

  private createProgressbar() {
    const progressbar: HTMLElement = document.getElementById('progressbar') as HTMLElement;
    console.log('createProgressbar', progressbar);
    const durationTime = '15s';
    progressbar.className = 'progressbar';

    const progressbarinner: HTMLElement = document.createElement('div');
    progressbarinner.id = 'timerbar';
    progressbarinner.className = 'inner';

    progressbarinner.style.animationDuration = durationTime;

    progressbar.appendChild(progressbarinner);

    progressbarinner.style.animationPlayState = 'running';
  }
}
