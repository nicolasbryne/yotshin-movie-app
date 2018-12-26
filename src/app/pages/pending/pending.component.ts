import { Component, Injector, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { RequestService } from '../../providers/request.service' 
import { DomSanitizer} from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.css']
})
export class PendingComponent extends BaseComponent implements OnInit {

	private route$: any;

	public pendingList: Array<any>;

  	constructor(public injector: Injector, private req: RequestService, private route: ActivatedRoute) {
  	super(injector);
	this.pendingList = [];
  }

  ngOnInit() {
  	this.route$ = this.route.params.subscribe(params=>{
  		if(params['id']){
  			this.req.getmoviePending(params['id']).subscribe(res=>{
				console.log(res);		  		
				for(let resp of res[0].results){
					resp['poster_path'] = this.postersensitize(resp.poster_path);
				}
				this.pendingList = res;
		  	}, err=>{
		  		console.log(err);
		  	})
  		}else{
  			this.req.getmoviePending().subscribe(res=>{
		  		console.log(res);
				for(let pending of res){
					for(let resp of pending.results){
						resp['poster_path'] = this.postersensitize(resp.poster_path);
					}
				}
		  		this.pendingList = res;
		  	}, err=>{
		  		console.log(err);
		  	})
  		}
  	})
  	
  }

  pendingConfirm(id:string, choose:number, event:any){
	  console.log("id=>"+id);
	  console.log("choose=>"+choose);
	  console.log(event);
	  this.req.confirmmoviePending(id, choose).subscribe(resp=>{
		  console.log(resp);
		  event.target.offsetParent.classList.add("choosen")
	  }, err=>{
		  console.log(err);
	  })
  }

}
