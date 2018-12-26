import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RequestService } from '../../providers/request.service' ;
import { MediaRequest } from '../../providers/request-api.service' 

@Component({
  selector: 'edit-metainfo',
  templateUrl: './edit-metainfo.component.html',
  styleUrls: ['./edit-metainfo.component.css']
})
export class EditMetainfoComponent implements OnInit {

  @Input() mediaID: string;
  @Output() close:EventEmitter<void> = new EventEmitter<void>();

  private movieId: string;
  private show: boolean;
  private loaded: boolean;
  private error: boolean;
  private unlockinput: number;
  private btnloading: boolean;
  private tab: number = 1;

  private moviemeta: object;
  private tmdbmeta: object;
  private crews: object;
  private genres: string;
  private casts: string;
  private director: string;
  private writer: string;

  constructor(private media: MediaRequest, private request: RequestService) { }

  ngOnInit() {
    console.log(this.mediaID)
    this.getData(this.mediaID)
    setTimeout(()=>this.show = true, 10)
  }

  editClose(){
    this.show = false;
  }

  fadeEnd(){
    console.log('end')
    if(!this.show) this.close.emit();
  }
  changetab(index:number){
		this.tab = index;
	}

  unlockthis(input:number){
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
      this.editClose();
    }, err=>{
      console.log(err);
      this.btnloading = false;
    })
  }

  fetchmovietmdb(tmdbid:any){
    this.loaded = false;
    this.error = false;
    this.moviemeta = {};
    this.casts = "";
    this.director = "";
    this.writer = "";
    this.request.fetchmovieTmdb(tmdbid).subscribe(resp=>{
      this.moviemeta = resp;
      this.casts = resp.casts.length ? resp.casts.join(", ") : null;
      this.writer = resp.writer.length ? resp.writer.join(", ") : null;
      this.director = resp.director.length ? resp.director.join(", ") : null;
      this.loaded = true;
    }, err=> this.error = true)
  }

  fetchmovieimdb(imdbid:any){
    this.loaded = false;
    this.error = false;
    this.moviemeta = {};
    this.casts = "";
    this.director = "";
    this.writer = "";
    this.request.fetchmovieImdb(imdbid).subscribe(resp=>{
      this.moviemeta = resp;
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
    //this.request.getmoviebyId(id).subscribe(resp=>{
    this.media.getMediaDetail(id).subscribe( resp => {
      console.log("EDIT=>");
      console.log(resp);
      this.movieId = resp._id;
      this.moviemeta = resp;
      if(this.moviemeta['releasedDate'] == "unknown") this.moviemeta['releasedDate'] = null;
      this.genres = resp.genres;
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

}
