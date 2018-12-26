import { Injector } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
//import { RequestService } from '../../providers/request.service' 

export class EditForm extends BaseComponent{

  public mediaData;
  public movieId: string;
  public show: Boolean;
  public loaded: Boolean;
  public error: Boolean;
  public unlockinput: Number;
  public btnloading: Boolean;

  public mediainfo: Array<String>;
  public moviemeta: Object;
  public tmdbmeta: Object;
  public crews: Object;
  public genres: String;
  public casts: String;
  public director: String;
  public writer: String;

  public collectionList: Array<object>;
  public collectionName: string;

  constructor(public injector: Injector, private request) {
    super(injector);
    console.log("TEST")
    this.moviemeta = {};
    this.mediainfo = [];
    this.collectionList = [];
    this.loaded = false;
    this.show = false;
    this.error = false;
    //this.collectionName = '';
   }

   fetchmovietmdb(tmdbid:any){
      //console.log(tmdbid);
      //return;
      this.loaded = false;
      this.error = false;
      this.moviemeta = {};
      this.casts = "";
      this.director = "";
      this.writer = "";
      this.request.fetchmovieTmdb(tmdbid).subscribe(resp=>{
        this.moviemeta = this.calculatemeta(resp);
        this.genres = this.genrename(resp.genres);
        this.casts = resp.casts.length ? resp.casts.join(", ") : null;
        this.writer = resp.writer.length ? resp.writer.join(", ") : null;
        this.director = resp.director.length ? resp.director.join(", ") : null;
        this.loaded = true;
      }, err=> this.error = true)
   }

   fetchmovieimdb(imdbid:any){
      //console.log(imdbid);
      //return;
      this.loaded = false;
      this.error = false;
      this.moviemeta = {};
      this.casts = "";
      this.director = "";
      this.writer = "";
      this.request.fetchmovieImdb(imdbid).subscribe(resp=>{
        this.moviemeta = this.calculatemeta(resp);
        this.genres = this.genrename(resp.genres);
        this.casts = resp.casts.length ? resp.casts.join(", ") : null;
        this.writer = resp.writer.length ? resp.writer.join(", ") : null;
        this.director = resp.director.length ? resp.director.join(", ") : null;
        this.loaded = true;
      }, err=> this.error = true)
   }

   getData(id:string){
      this.loaded = false;
      this.error = false;
      this.btnloading = false;
      this.moviemeta = {};
      this.casts = "";
      this.director = "";
      this.writer = "";
      this.movieId = "";
      this.request.getmoviebyId(id).subscribe(resp=>{
        console.log("EDIT=>");
        console.log(resp);
        this.movieId = resp._id;
        this.moviemeta = this.calculatemeta(resp);
        if(this.moviemeta['releasedDate'] == "unknown") this.moviemeta['releasedDate'] = null;
        this.genres = this.genrename(resp.genres);
        if(!resp.extend && resp.tmdbId){
          this.request.getmovieTmdb(resp.tmdbId).subscribe(res=>{  
            console.log(res)   
            this.moviemeta['runtime'] = res.runtime; 
            this.moviemeta['imdbID'] = res.imdbID;
            this.casts = res.casts && res.casts.length ? res.casts.join(", ") : null;
            this.writer = res.writer && res.writer.length ? res.writer.join(", ") : null;
            this.director = res.director && res.director.length ? res.director.join(", ") : null;
            this.loaded = true;
            return;
          }, err=> this.error=true);
        };
        if(resp && resp.extend){
          this.casts = resp.casts && resp.casts.length ? resp.casts.join(", ") : null;
          this.writer = resp.writer && resp.writer.length ? resp.writer.join(", ") : null;
          this.director = resp.director && resp.director.length ? resp.director.join(", ") : null;
          this.loaded = true;
        }
        if(resp && !resp.extend && !resp.tmdbId) this.loaded = true;
      }, err=> this.error = true)
   }

   getMediaInfo(id:string){
      this.mediainfo = [];
      this.loaded = false;
      this.error = false;
      this.request.getmediainfo(id).subscribe(res=>{
        this.mediainfo.push(res);
        console.log(this.mediainfo);
        this.loaded = true;
      }, err=> this.error = true)
   }


  openEditor() {
    console.log("OPEN EDITOR");
    this.unlockinput = undefined
    setTimeout(()=>this.show = true, 10);
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.   
  }

  close(){
    this.show = false;
  }

  unlockthis(input:Number){
    if(this.unlockinput == input) return this.unlockinput = undefined;
    this.unlockinput = input;
  }

  submitEditForm(form: NgForm){
    console.log("SUBMITTED");
    console.log(form.value);
    this.btnloading = true;
    this.request.updateMovie(this.movieId, form.value).subscribe(resp=>{
      console.log(resp);
      this.btnloading = false;
      this.close();
    }, err=>{
      console.log(err);
      this.btnloading = false;
    })
  }

  getCollections(id:string){
    this.mediaData = null;
    this.movieId = null;
    this.loaded = false;
    this.error = false;
    this.btnloading = false;
    this.request.getCollections().subscribe(resp=>{
      this.collectionList = resp;
      this.loaded = true;      
    },err=>{
      console.log(err);
      this.error = true;
    })
    this.request.getmoviebyId(id,'collections').subscribe(resp=>{
      this.mediaData = resp;
      this.movieId = resp._id;
    }, err=>{
      console.log(err);
      this.error = true;
    })
  }

  createCollection(){
    console.log(this.collectionName);
    if(!this.collectionName) return;
    this.request.createCollection(btoa(this.collectionName)).subscribe(resp=>{
      this.collectionList.push({
        name : resp.name,
        id : resp.id
      })
    },err=>{
      console.log(err);
    })
  }

  addtoCollection(collectionid:number, mediaid: number){
    if(!this.mediaData) return;
    for(let m of this.mediaData.collections){
      if(m.id == collectionid) {
        this.close();
        return;
      }
    }
    this.request.addtoCollection(collectionid,mediaid,'movie').subscribe(resp=>{
      console.log(resp);
      this.close();
    }, err=>{
      console.log(err);
    })
  }
}