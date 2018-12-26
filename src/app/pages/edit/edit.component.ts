import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { RequestService } from '../../providers/request.service' 

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent extends BaseComponent implements OnInit, OnDestroy {

  private movieId: string;
  private route$: any;
  private show: Boolean;
  private loaded: Boolean;


  private moviemeta: Object;
  private tmdbmeta: Object;
  private crews: Object;
  private genres: String;
  private casts: String = '......';
  private director: String = '......';
  private writer: String = '......';

  constructor(public injector: Injector, private route: ActivatedRoute, private request: RequestService) {
    super(injector);
    this.moviemeta = {};
    this.loaded = false;
    this.show = false;
   }

  ngOnInit() {
  	this.route$ = this.route.params.subscribe(params=>{
  		this.movieId = params['id'];
      this.request.getmoviebyId(this.movieId).subscribe(resp=>{
        console.log(resp);
        this.moviemeta = this.calculatemeta(resp);
        //this.moviemeta['casts'] = resp.casts.join(', ');
        this.genres = this.genrename(resp.genres);
        if(!resp.extend){
          this.request.getmovieTmdb(resp.tmdbId).subscribe(res=>{  
            console.log(res)   
            this.moviemeta['runtime'] = res.runtime; 
            this.casts = res.casts.length ? res.casts.join(", ") : "Unknown";
            this.writer = res.writer.length ? res.writer.join(", ") : "Unknown";
            this.director = res.director.length ? res.director.join(", ") : "Unknown";
            this.loaded = true;
            return;
          })
        };
        if(resp && resp.extend){
          this.casts = resp.casts.length ? resp.casts.join(", ") : "Unknown";
          this.writer = resp.writer.length ? resp.writer.join(", ") : "Unknown";
          this.director = resp.director.length ? resp.director.join(", ") : "Unknown";
          this.loaded = true;
        }
      })
  	})
  }

  ngAfterViewInit() {
    setTimeout(()=>this.show = true, 10);
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    
  }

  close(){
    this.show = false;
    setTimeout(()=>this.back(), 400);
  }

  submitEditForm(form: NgForm){
    console.log(form.value);
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log("DESTROY");
    
  }


}
