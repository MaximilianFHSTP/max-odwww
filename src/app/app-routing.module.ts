import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MainViewComponent } from './main-view/main-view.component';


const routes: Routes = [
  { path: '', component: RegisterComponent},
  { path: 'mainview', component: MainViewComponent },
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
