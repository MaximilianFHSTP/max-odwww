import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './components/about/about.component';
import { ChangeCredentialsComponent } from './components/change-credentials/change-credentials.component';
import { ContentInteractiveComponent } from './components/content-interactive/content-interactive.component';
import { ContentPassiveComponent } from './components/content-passive/content-passive.component';
import { ContentTableAtComponent } from './components/content-table-at/content-table-at.component';
import { ContentTableNotifyAtComponent } from './components/content-table-notify-at/content-table-notify-at.component';
import { ContentTableNotifyOnComponent } from './components/content-table-notify-on/content-table-notify-on.component';
import { ContentTableOnComponent } from './components/content-table-on/content-table-on.component';
import { EducationQuizComponent } from './components/education-quiz/education-quiz.component';
import { LanguageStartComponent } from './components/language-start/language-start.component';
import { LoginComponent } from './components/login/login.component';
import { MainViewComponent } from './components/main-view/main-view.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { RegisterComponent } from './components/register/register.component';
import { RegisterRealuserComponent } from './components/register-realuser/register-realuser.component';
import { StartViewComponent } from './components/start-view/start-view.component';
import { UnlockComponent } from './components/unlock/unlock.component';
import { WappenComponent } from './components/wappen/wappen.component';
import { WifiComponent } from './components/wifi/wifi.component';
import { TimelineChangeComponent } from './components/timeline-change/timeline-change.component';
import { TimelineStackedComponent } from './components/timeline-stacked/timeline-stacked.component';

const routes: Routes = [
  { path: '', component: StartViewComponent},
  { path: 'about', component: AboutComponent },
  { path: 'changecred', component: ChangeCredentialsComponent },
  { path: 'interactive', component: ContentInteractiveComponent },
  { path: 'passive', component: ContentPassiveComponent },
  { path: 'tableat', component: ContentTableAtComponent, runGuardsAndResolvers: 'always'},
  { path: 'tableon', component: ContentTableOnComponent },
  { path: 'tableNotifyAt', component: ContentTableNotifyAtComponent},
  { path: 'tableNotifyOn', component: ContentTableNotifyOnComponent},
  { path: 'educationQuiz', component: EducationQuizComponent },
  { path: 'changeLanguageStart', component: LanguageStartComponent},
  { path: 'login', component: LoginComponent},
  { path: 'mainview', component: MainViewComponent },
  { path: 'questionnaire', component: QuestionnaireComponent },
  { path: 'quiz', component: QuizComponent},
  { path: 'register', component: RegisterComponent },
  { path: 'registerRealUser', component: RegisterRealuserComponent},
  { path: 'unlock', component: UnlockComponent},
  { path: 'wappen', component: WappenComponent },
  { path: 'wifi', component: WifiComponent },
  { path: 'timelineChange', component: TimelineChangeComponent },
  { path: 'timelineStacked', component: TimelineStackedComponent },
  // additional routes here
  { path: '**', component: PageNotFoundComponent }
  // don't touch this
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {onSameUrlNavigation: 'reload', enableTracing: false }) // <-- debugging purposes only)
    ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
