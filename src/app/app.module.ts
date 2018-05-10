import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HttpClient } from './shared/data';
import { RouterModule, Routes } from '@angular/router';

import { BrainViewComponent } from './brain-view/brain-view.component';
import { BotViewComponent } from './bot-view/bot-view.component';
import { HomeComponent } from './home/home.component';
import {SocketService} from "./socket.service";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FamilyTreeComponent } from './family-tree/family-tree.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent,     pathMatch:'full' },
  {
    path: 'bots/:bot',
    component: BotViewComponent,
    pathMatch:'full'
  },
  {
    path: 'bots/:bot/brain',
    component: BrainViewComponent,
    pathMatch:'full'
  },
  {
    path: 'tree',
    component: FamilyTreeComponent,
    pathMatch:'full'
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    pathMatch:'full'
  },
  //{ path: '**', component: HomeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    BrainViewComponent,
    BotViewComponent,
    HomeComponent,
    FamilyTreeComponent,
    LeaderboardComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    FormsModule,
    HttpModule,
    NgxDatatableModule
  ],
  providers: [HttpClient, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
