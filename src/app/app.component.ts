import { Component, OnInit, Injector, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BaseComponent } from './pages/base/base.component';
import { HomeComponent } from './pages/home/home.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/fromEvent';

import { RequestService } from './providers/request.service';
import { CommunicationService } from './providers/communication.service';
import { SocketConnectionService } from './providers/socket-connection.service';

import { Store } from '@ngrx/store';
import { AppState, OPEN_SIDE_NAV, CLOSE_SIDE_NAV, TOGGLE_SIDE_NAV, SideNav, getSidenavState, getCartState,
UI_ACTIONS as fromUI, getUiState, REMOVE_FROM_CART } from './store/actions';

import { SideCartListComponent } from './child/side-cartlist/side-cartlist.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent extends BaseComponent implements OnInit{
    @ViewChild('searchDiv') searchEl:ElementRef;
	
  	public sidebarShow: Boolean;
  	public subMovie: boolean = true;
  	private sub = null;
  	private toggleOn: boolean = true;
  	public movtoggle: boolean = true;
  	public sertoggle: boolean = true;
  	public libtoggle: boolean = true;
  	public favtoggle: boolean = true;
  	public coltoggle: boolean = true;

	private searchExpand: boolean = false;

  	public chooseCount: number;

    public slide:boolean = false;

    public libname:string;
    public libnamesuccess:boolean;
    public libnameerror:boolean;

	private noti: any;
	private notification: any;

	private click$: any;
	private search$: any;
	private searchValue: string;
	private searchTerm = new FormControl();
	private searchResults:any[] = [];

	private cartItems:any[] = [];
	private hideCartlist:boolean;

	public sidenavState;
	public cartState;
	public uiState;

  	constructor(public store:Store<AppState>, private zone: NgZone, public injector:Injector, private socket:SocketConnectionService, private com: CommunicationService, private req: RequestService, private router: Router) {
			super(injector);
			this.hideCartlist = true;
			this.notification = {};
  			this.sub = com.toggleSidebar().subscribe(event=>{
  				this.sidebarShow = event;
  			})
			
			this.sidenavState = store.select(getSidenavState);
			store.select(getCartState).subscribe(state => {
				console.log('GET CART STATE======>')
				this.cartState = state});

			this.uiState = store.select(getUiState).share();

			this.noti = com.notification(event).subscribe(event=>{
				//this.notification = event;
				if(event && event.show){
					this.showNoti(event.msg, event.loading);
				}
				if(event && !event.show){
					this.hideNoti();
				}
				if(event && event.auto === true){
					setTimeout(()=>{
						this.hideNoti();
					}, 4000);
				}
			})

  		req.requestMoviecount(2).subscribe(count=>{
  			this.chooseCount = count.count;
  		})
  	}


		ngOnInit() {
			this.com.getCart().subscribe(items=>{
				this.cartItems = this.com.shoppingCart;
				console.log(this.cartItems);
			})

			/*this.socket.emit('init', 'APP INITIATE');
			this.socket.on('copy', (data, complete)=>{
				console.log(data);
				if(complete) {
					console.log(complete)
					return this.socket.removeEventListener('copy');
				}
			})*/
			
			
		}

		ngAfterViewInit() {
			this.socket.init().subscribe(resp=>{
				console.log(resp);
			})
			/*this.socket.copy().subscribe(resp=>{
				console.log(resp);
			})*/
		}

		copynow(){
			let i = 0;
			//let total = this.cartItems.length;
			
			const copy = (ii)=>{
				console.log("copy index=>"+ii);
				if(ii < this.cartItems.length){
					this.socket.socket.emit('copyEvent', {action :'copy', itemId : this.cartItems[ii]._id });
					//this.req.testSocket(this.cartItems[ii]._id).subscribe(resp=>{
						console.log("COPYING..." + this.cartItems[ii]._id);
					//})
				}else return false;
			}
			copy(i);

			this.socket.socket.on('copyEvent',(err, data, percent, done)=>{
				if(err && err == "aborted"){
					return copy(i);
				}
				if(done && i < this.cartItems.length){
					console.log(done);
					i++;
					console.log("call i "+i);
					//this.socket.socket.off('copyEvent');
					return copy(i);
				}
				if(data) this.cartItems[i].progress = data;
			})

			/*this.socket.copy().subscribe(data=>{
				this.cartItems[i].progress = data;
				if(data == 'finished' && i < this.cartItems.length){
					i++
					copy(i);
				}
			})*/
			
		}

		cartListActions(action) {
			switch(action.type) {
				case 'REMOVE_FROM_CART':
					this.store.dispatch({type: REMOVE_FROM_CART, _id : action._id });
					break;
			}
		}

		toggleCartlist(){
			//this.hideCartlist = !this.hideCartlist;
			this.store.dispatch({type: fromUI.TOGGLE_CARTLIST})
		}
		hideCartList(){
			this.store.dispatch({type: fromUI.CLOSE_CARTLIST})
		}
		removefromCart(index:number){
			console.log(index);
			this.socket.socket.emit('copyEvent', {action:'abort', itemId: this.cartItems[index]._id});
			delete this.cartItems[index].progress;
			this.com.removefromCart(index);
		}
		search(){
			console.log("SEARCH===================================")
			document.getElementById('search').parentElement.classList.add('focus');
			this.zone.runOutsideAngular( () => {
				this.click$ = Observable.fromEvent(document, 'click').subscribe(event=>{
					if(!this.searchEl.nativeElement.contains(event['target'])) this.searchBlur()
				})
			})
			
			if(this.searchTerm.value && this.searchTerm.value.length >= 2){
				this.req.searchTerm(this.searchTerm.value).subscribe(results=>{
						this.searchResults = [];
						for(let result of results){
							this.searchResults.push(this.calculatemeta(result));
						}
				})
			}
			this.search$ = this.searchTerm.valueChanges.debounceTime(400).distinctUntilChanged().filter(term=>term.length >= 2 ? true:false)
				.switchMap(term => {
					console.log(term)
					return this.req.searchTerm(term)
				}).subscribe(results=>{
						this.searchResults = [];
						for(let result of results){
							this.searchResults.push(this.calculatemeta(result));
						}
				})
			/*.subscribe(term=>{
				console.log(term)
				this.req.searchTerm(term).subscribe(results=>{
						this.searchResults = [];
						for(let result of results){
							this.searchResults.push(this.calculatemeta(result));
						}
				})
			})*/
		}
		searchBlur(){
			if(!this.search$.closed) this.search$.unsubscribe();
			if(!this.click$.closed) this.click$.unsubscribe();
			document.getElementById('search').parentElement.classList.remove('focus');
			this.searchResults = [];
		}

		showNoti(msg:string, loading:boolean){
			this.notification.show = true;
			this.notification.msg = msg;
			this.notification.loading = loading;
		}

		hideNoti(){
			this.notification.show = false;
			this.notification.msg = "";
			this.notification.loading = false;
		}

    /*createnewLibrary(type: string = ""){
      if(this.libname == "") return;
      this.req.createLibrary(type, this.libname).subscribe(res=>{
        console.log(res);
        this.libnamesuccess = true;
        setTimeout(()=>{
          this.libname = "";
          this.libnamesuccess = false
					this.slideIn();
					this.router.navigate(['library', res.ID]);
        }, 1500)
      }, err=>{
        console.log(err);
        this.libnameerror = true;
        setTimeout(()=>{
          this.libnameerror = false
        }, 1500)
      })
    }*/

	searchToggle(){
		if(!this.searchExpand){
			this.searchTerm.value && this.searchTerm.setValue(null);
			setTimeout(()=>{
				document.getElementById('search').focus();
			},200);
		}else{
			this.searchBlur();
		}
		this.searchExpand = !this.searchExpand;
	}
	searchClear(){
		if(this.searchTerm.value){
			this.searchTerm.setValue(null);
			setTimeout(()=>{
				document.getElementById('search').focus();
			},200);
		}
	}
  	sidebarToggle(){
  		//this.sidebarShow = !this.sidebarShow; 	
		this.store.dispatch({type: TOGGLE_SIDE_NAV})	
  	}

  	toggleList(elid: string){
  		if(this.toggleOn){
  			document.getElementById(elid).classList.remove("collapse");
  			this.toggleOn = false;
  		}else{
  			document.getElementById(elid).classList.add("collapse");
  			this.toggleOn = true;
  		}
  	}

  	test(event){
  		var l = event.target.nextElementSibling;
  		console.log(event);
  		console.log(l);
  		//l.classList.remove("collapse");
  	}

  	mtoggle(){
  		this.movtoggle = !this.movtoggle;
  		this.sertoggle = true;
  		this.libtoggle = true;
  		this.coltoggle = true;
  	}

  	stoggle(){
  		this.sertoggle = !this.sertoggle;
  		this.movtoggle = true;
  		this.libtoggle = true;
  		this.coltoggle = true;
  	}

  	ltoggle(){
  		this.libtoggle = !this.libtoggle;
  		this.movtoggle = true;
  		this.sertoggle = true;
  		this.coltoggle = true;
  	}

  	ctoggle(){
  		this.coltoggle =!this.coltoggle;
  		this.movtoggle = true;
  		this.sertoggle = true;
  		this.libtoggle = true;
  	}

    slideIn(){
      this.slide = !this.slide;
    }

		/*goBack(){
			this.location.back();
		}*/
}
