import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MainViewComponent } from './main-view/main-view.component';
import { ContentPassiveComponent } from './content-passive/content-passive.component';
import { ContentTableAtComponent } from './content-table-at/content-table-at.component';
import { ContentTableOnComponent } from './content-table-on/content-table-on.component';


const routes: Routes = [
  { path: '', component: RegisterComponent},
  { path: 'mainview', component: MainViewComponent },
  { path: 'passive', component: ContentPassiveComponent },
  { path: 'tableat', component: ContentTableAtComponent },
  { path: 'tableon', component: ContentTableOnComponent },
  // additional routes here

  { path: '**', component: PageNotFoundComponent }
  // don't touch this
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      { enableTracing: false }) // <-- debugging purposes only)
    ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
