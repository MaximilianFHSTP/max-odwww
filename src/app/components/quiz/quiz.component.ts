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
import {TranslateService} from '@ngx-translate/core';
import {TransmissionService} from '../../services/transmission.service';
import * as languageTypes from '../../config/LanguageTypes';
import {CoaService} from '../../services/coa.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, OnDestroy {
  private subscriptionNativeBackbutton: Subscription;
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

  public yourPoints = this.translate.instant('quiz.progress')+' ...';
  public yourStatus = '...';
  public yourStatusText;
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
    private coaService: CoaService,
    private alertService: AlertService,
    private translate: TranslateService
  ) {
    this._unsubscribe = this.appStore.subscribe(() => {
      const state = this.appStore.getState();
      // this.updateLocationStatus(state.locationStatus);
      this.connectionSuccess = state.connectedToExhibit;
    });
    this.subscriptionQuestion = this.alertService.getQuizQuestion().subscribe(message => {
      const state = this.appStore.getState();
      const language = state.language;
      this.questionId = message.questionId;
      this.correctAns = message.correctAnswer;
      if(!this.firstQuestionOfRun){
        this.startQuizTime = new Date().getTime();
        this.firstQuestionOfRun = true;
        this.exhibitService.getInitialUserCorrectPoints();
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
      if(language === languageTypes.DE){
        this.question = message.questionGer;
        this.answerA = message.answerAGer;
        this.answerB = message.answerBGer;
        this.answerC = message.answerCGer;
        this.answerD = message.answerDGer;
      } else if(language === languageTypes.ENG){
        this.question = message.questionEng;
        this.answerA = message.answerAEng;
        this.answerB = message.answerBEng;
        this.answerC = message.answerCEng;
        this.answerD = message.answerDEng;
      }

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
        this.yourAnswer = this.translate.instant('quiz.yourAnswer') + ' ' + this.translate.instant('quiz.none');
      }
      this.noResponse = false;
      const state = this.appStore.getState();
      const language = state.language;
      if(language === languageTypes.DE){
        this.elaboration = message.elaborationGer;
      }else if(language === languageTypes.ENG){
        this.elaboration = message.elaborationEng;
      }
      this.correctAnswer = this.translate.instant('quiz.rightAnswer') + message.correctAnswer;
    });
    this.subscriptionPoints = this.alertService.getCorrectPoints().subscribe(message => {
      console.log('subscription points');
      const points = message;
      if(points<7){
        this.yourPoints = this.translate.instant('quiz.progress') + points + '/' + '7 ' + this.translate.instant('quiz.points');
        this.yourStatus = 'Bettelvolk';
        this.yourStatusText = this.translate.instant('quiz.beggars');
        const progressbar: HTMLElement = document.getElementById('pointsbarinner') as HTMLElement;
        progressbar.style.width = ((points*100)/7) + '%';
      }else if(points>=7 && points <13){
        this.yourPoints = this.translate.instant('quiz.progress') + points + '/' + '13 ' + this.translate.instant('quiz.points');
        this.yourStatus = 'Buergertum';
        this.yourStatusText = this.translate.instant('quiz.bourgeoisie');
        const progressbar: HTMLElement = document.getElementById('pointsbarinner') as HTMLElement;
        progressbar.style.width = ((points*100)/13) + '%';
      }else if(points>=13){
        this.yourPoints = this.translate.instant('quiz.progress') + points/* + '/' + '13 ' + this.translate.instant('quiz.points')*/;
        this.yourStatus = 'Adel';
        this.yourStatusText = this.translate.instant('quiz.noble');
        const progressbar: HTMLElement = document.getElementById('pointsbarinner') as HTMLElement;
        progressbar.style.width = '100%';
      }

      // COA
      if(points < 5) {
        this.coaService.tryUnlock(42);
      } else if(points >= 5 && points < 10) {
        this.coaService.tryUnlock(21);
      } else if(points >= 10) {
        this.coaService.tryUnlock(32);
      }
    });

    this.subscriptionNativeBackbutton = this.alertService.getMessageNativeBackbutton().subscribe(() => {
      const elm: HTMLElement = document.getElementById('closebutton') as HTMLElement;
      if(elm){ elm.click(); }
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

  updateLocationStatus(status: string){
    // When not free, disconnect and redirect back
    if (status !== 'FREE'){
      this.disconnectFromExhibit();
      this.closeWindow();
    }
  }

  ngOnDestroy()
  {
    // Send quizendtime here
    const endQuizTime = new Date().getTime();
    this.quizTime = endQuizTime - this.startQuizTime;
    if(!this.quizTime){ this.quizTime = 0;}
    // console.log('onDestroyQuiz', this.quizTime);
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
    //  this.transmissionService.transmitLocationRegister({minor: 301, major: 30});
    // Send quizendtime here
    const endQuizTime = new Date().getTime();
    this.quizTime = endQuizTime - this.startQuizTime;
    if(!this.quizTime){ this.quizTime = 0;}
    // console.log('DisconnectQuiz', this.quizTime);
    this.exhibitService.sendQuizTime(this.quizTime);
    this.firstQuestionOfRun = false;
    this.exhibitService.disconnect();
  }

  public sendMessageToExhibit()
  {
    this.exhibitService.sendMessage();
  }

  public sendAnswerA()
  {
    const answer = {answerA: true, answerB: false, answerC: false, answerD: false };
    this.answerChar = 'A';
    this.yourAnswer = this.translate.instant('quiz.yourAnswer') + 'A';
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
    this.yourAnswer = this.translate.instant('quiz.yourAnswer') + 'B';
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
    this.yourAnswer = this.translate.instant('quiz.yourAnswer') + 'C';
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
    this.yourAnswer = this.translate.instant('quiz.yourAnswer') + 'D';
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
    // console.log('createProgressbar', progressbar);
    const durationTime = '30s';
    progressbar.className = 'progressbar';

    const progressbarinner: HTMLElement = document.createElement('div');
    progressbarinner.id = 'timerbar';
    progressbarinner.className = 'inner';

    progressbarinner.style.animationDuration = durationTime;

    progressbar.appendChild(progressbarinner);

    progressbarinner.style.animationPlayState = 'running';
  }

  public closeWindow(){
    this.router.navigate(['tableat']).then( () =>
      {
        this.nativeCommunicationService.sendToNative('Table at', 'print');
      }
    );
  }
}
