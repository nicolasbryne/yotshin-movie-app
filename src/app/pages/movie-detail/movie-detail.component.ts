import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { RequestService } from '../../providers/request.service';
import { MediaRequest } from '../../providers/request-api.service';
import { CommunicationService } from '../../providers/communication.service' 

import { Store } from '@ngrx/store';
import { CLOSE_SIDE_NAV, AppState } from '../../store/actions'


@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css'],
})


export class MovieDetailComponent extends BaseComponent implements OnInit, OnDestroy {

  private movieId: string;
  private route$: any;
  private editShow:boolean;
  private collectionShow:boolean;

  private moviemeta: object;
  private tmdbmeta: object;
  private backdrop: string;
  private poster: string;
  private crews: object;
  private genres: string;
  private casts: string = '......';
  private director: string = '......';
  private writer: string = '......';
  private mediainfo: object;

  constructor(private store: Store<AppState>, public media: MediaRequest, public injector: Injector, private route: ActivatedRoute, private request: RequestService, private communication: CommunicationService) {
    super(injector);
    this.moviemeta = {};
    this.tmdbmeta = {};
    this.crews = {};
    this.mediainfo = {};

  }

  ngOnInit() {

    this.store.dispatch({type : CLOSE_SIDE_NAV});
  	this.route$ = this.route.params.subscribe(params=>{
  		this.movieId = params['id'];
      //this.request.getmoviebyId(this.movieId).subscribe(resp=>{
      this.media.getMediaDetail(this.movieId).subscribe(resp => {
        console.log(resp);
        //this.moviemeta = resp;
        this.poster = /*resp.posterLocal ? this.image_path+resp.posterLocal : */this.posterprefix+resp.posterURL;
        this.backdrop = /*resp.backdropLocal ? this.image_path+resp.backdropLocal : */this.backdropprefix+resp.backdropURL;
        /*if(this.moviemeta['seasons'] && this.moviemeta['seasons'].length){
          for(let i=0, len=this.moviemeta['seasons'].length; i < len; i++){
            this.moviemeta['seasons'][i].poster = this.moviemeta['seasons'][i].poster_local ? this.image_path+this.moviemeta['seasons'][i].poster_local : this.posterprefix+this.moviemeta['seasons'][i].poster_path
          }
        }*/
        if(resp['seasons'] && resp['seasons'].length){
          this.moviemeta = Object.assign({}, resp, {
            seasons : resp['seasons'].map(season => {
              return Object.assign({}, season, {
                poster : this.posterprefix+season.poster_path
              })
            })
          })
        }
        console.log(this.moviemeta)
        //this.moviemeta = this.calculatemeta(resp);
        //this.moviemeta['casts'] = resp.casts.join(', ');
        if(resp.mediainfo) {
          this.mediainfo = resp.mediainfo;
          this.mediainfo['video'].resolution = this.resolution(resp.mediainfo.video.width, resp.mediainfo.video.height);
        }else{
          this.communication.notification({
            show:true,
            msg: 'Processing and preparing video file. Please wait...',
            loading: true,
            auto: false
          })
          this.request.getmediainfo(resp._id).subscribe(media=>{
            this.communication.notification({
              show:true,
              msg: `Finished processing "${resp.title || resp.filename}" in this library`,
              loading: true,
              auto: true
            })
            this.mediainfo = media;
            this.mediainfo['video'].resolution = this.resolution(media.video.width, media.video.height);
          }, err=>{
            /*this.communication.notification({
              show:true,
              msg: 'Error occour while processing this video file',
              loading: false,
              auto: true
            })*/
          })
        }//else this.communication.notification({show:false});
        this.genres = this.genrename(resp.genres);
        if(!resp.extend && resp.tmdbId){
          this.communication.notification({
            show:true,
            msg: 'Fetching meta information from database. Please wait...',
            loading: true,
            auto: false
          })
          this.request.getmovieTmdb(resp.tmdbId).subscribe(res=>{  
            console.log(res)   
            this.moviemeta['runtime'] = res.runtime || 'Unknown'; 
            this.casts = res.casts && res.casts.length ? res.casts.join(", ") : "Unknown";
            this.writer = res.writer && res.writer.length ? res.writer.join(", ") : "Unknown";
            this.director = res.director && res.director.length ? res.director.join(", ") : "Unknown";
            return;
          }, err=>{
            this.moviemeta['runtime'] = 'Unknown'; 
            this.casts =  "Unknown";
            this.writer = "Unknown";
            this.director = "Unknown";
          })
        };
        if((resp && resp.extend) || !resp.tmdbId){
          this.casts = resp.casts && resp.casts.length ? resp.casts.join(", ") : "Unknown";
          this.writer = resp.writer && resp.writer.length ? resp.writer.join(", ") : "Unknown";
          this.director = resp.director && resp.director.length ? resp.director.join(", ") : "Unknown";
        }
        
        
        /*this.request.getmovieTmdb(resp.tmdbId).subscribe(res=>{
          this.tmdbmeta = res;
          this.genres = this.generesGen(res.genres);
          this.crews = this.crewFinder(res.credits);
          
        })*/
      })
  	})

  }

openEdit(){
  this.editShow = true;
}
openCollection(){
  this.collectionShow = true;
}

closePopup(){
  if(this.editShow) this.editShow = false;
  if(this.collectionShow) this.collectionShow = false;
}

 generesGen(genres){
   console.log(genres);
   var genre = [];
   for(let genree of genres){
     genre.push(genree['name']);
   }
   return genre.join(", ");
 }

  crewFinder(credits):any{
    var cast = [];
    var director = [];
    var writer = [];

    for(var i=0; i < 5; i++){
      cast.push(credits.cast[i].name);
    }

    for(let crew of credits.crew){
      if(crew['job'] == "Director") director.push(crew['name']);
      else if(crew['job'] == "Screenplay") writer.push(crew['name']);
    }
    var directors = director.join(', '); 
    var casts = cast.join(', ');
    var writers = writer.join(', ');

    return {
      casts : casts,
      director : director,
      writer : writer
    }
  }

  ngOnDestroy(){
  	if(this.route$) this.route$.unsubscribe();
  }

}
