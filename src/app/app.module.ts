import { BrowserModule } from '@angular/platform-browser';
import { TagInputModule } from 'ng2-tag-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed! 
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './reuse-strategy';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
//import { ClickOutsideDirective } from 'angular2-click-outside';

import { HomeComponent } from './pages/home/home.component';

import { RequestService } from './providers/request.service';
import { CommunicationService } from './providers/communication.service';
import { PagerService } from './providers/pagination.service';
import { SocketConnectionService } from './providers/socket-connection.service';

import { MediaRequest } from './providers/request-api.service';

//import { Ng2FileInputModule } from 'ng2-file-input';
import { AddMediaComponent } from './pages/add-media/add-media.component';
import { MovieDetailComponent } from './pages/movie-detail/movie-detail.component';
import { LibraryComponent } from './pages/library/library.component';
import { PendingComponent } from './pages/pending/pending.component';
import { EditComponent } from './pages/edit/edit.component';
import { LibrarySettingComponent } from './pages/library-setting/library-setting.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CartComponent } from './pages/cart/cart.component';
import { FolderPickerComponent } from './utils/folder-picker/folder-picker.component';
import { ContextMenuComponent } from './utils/context-menu/context-menu.component';
import { FilesizePipe } from './pipes/filesize.pipe';
import { EditMetainfoComponent } from './utils/edit-metainfo/edit-metainfo.component';
import { MediainfoComponent } from './utils/mediainfo/mediainfo.component';
import { AddToCollectionComponent } from './utils/add-to-collection/add-to-collection.component';
import { SettingComponent } from './pages/setting/setting.component';
import { ImageLoaderDirective } from './directives/image-loader.directive';

import { StoreModule } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { Reducers } from './store/reducers';
import { SearchBoxComponent } from './child/search-box/search-box.component';
import { PaginationComponent } from './child/pagination/pagination.component';
import { SideCartListComponent } from './child/side-cartlist/side-cartlist.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MovieDetailComponent,
    AddMediaComponent,
    LibraryComponent,
    PendingComponent,
    //ClickOutsideDirective,
    EditComponent,
    LibrarySettingComponent,
    DashboardComponent,
    CartComponent,
    FolderPickerComponent,
    ContextMenuComponent,
    FilesizePipe,
    EditMetainfoComponent,
    MediainfoComponent,
    AddToCollectionComponent,
    SettingComponent,
    ImageLoaderDirective,
    SearchBoxComponent,
    PaginationComponent,
    SideCartListComponent
  ],
  imports: [
    NgbModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      {
        path: 'discover/movie',
        component: HomeComponent,
        children: [{
          path : "edit/:id",
          component : EditComponent
        }]
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'discover/movie/detail/:id',
        component: MovieDetailComponent
      },
      {
        path: 'discover/movie/pending/:id',
        component : PendingComponent
      },
      {
        path: 'library',
        component: LibraryComponent
      },
      {
        path: 'library/:name',
        component: AddMediaComponent
      },
      {
        path: ':type/pending',
        component : PendingComponent
      },
      {
        path: ':type/pending/:id',
        component : PendingComponent
      },
      {
        path: 'cart',
        component: CartComponent
      },
      /*{
        path: 'folder',
        component: FolderPickerComponent
      },*/
      {
        path: 'edit',
        component : AddToCollectionComponent
      }
      ,
      {
        path: 'setting',
        component : SettingComponent
      }
    ],  { useHash: true }),
    HttpModule,
    LazyLoadImageModule,
    RoundProgressModule,
    //Ng2FileInputModule.forRoot()
    StoreModule.forRoot(Reducers),
    StoreDevtoolsModule.instrument({
      maxAge: 25 //  Retains last 25 states
    })
  ],
  
  providers: [MediaRequest, SocketConnectionService, RequestService, CommunicationService, PagerService, {provide: RouteReuseStrategy, useClass: CustomReuseStrategy}],
  bootstrap: [AppComponent]
})


export class AppModule { }
