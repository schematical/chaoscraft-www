import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HttpClient } from './shared/data';
import { RouterModule, Routes } from '@angular/router';

import { BrainViewComponent } from './brain-view/brain-view.component';
import { HomeComponent } from './home/home.component';
import {SocketService} from "./socket.service";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FamilyTreeComponent } from './family-tree/family-tree.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'bots/:bot',
    component: BrainViewComponent
  },
  {
    path: 'tree',
    component: FamilyTreeComponent
  },
  { path: '**', component: HomeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    BrainViewComponent,
    HomeComponent,
    FamilyTreeComponent
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
