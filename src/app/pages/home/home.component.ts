import { Component, OnInit, OnDestroy, Injector, NgZone, ElementRef, Renderer2, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { DatePipe, AsyncPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/merge';
import "rxjs/add/operator/share";
//import { ClickOutsideDirective } from 'angular2-click-outside';


import { BaseComponent } from '../base/base.component';
import { RequestService } from '../../providers/request.service' 
import { CommunicationService } from '../../providers/communication.service' 
import { PagerService } from '../../providers/pagination.service'
import { MediaRequest } from '../../providers/request-api.service'; 

/*import { EditMetainfoComponent } from '../../utils/edit-metainfo/edit-metainfo.component';
import { MediainfoComponent } from '../../utils/mediainfo/mediainfo.component';*/
import { ContextMenuComponent } from '../../utils/context-menu/context-menu.component'
import { EditForm } from './EditForm'
import { LazyLoadImage } from './LazyLoad';
import { Pagination } from '../../utils/pagination'

import { ImageLoaderDirective } from '../../directives/image-loader.directive'

import { Store } from '@ngrx/store';
import { 
	AppState, getSidenavState, getPaginationState,
	OPEN_SIDE_NAV, CLOSE_SIDE_NAV, SideNav,
	SET_RESULTS, ADD_TO_FEATURE, DELETE_FROM_RESULTS, SET_CURRENT_PAGE, SET_TOTAL_ITEMS, SET_PAGINATION, IHomepage,
	ADD_TO_CART, REMOVE_FROM_CART
} from '../../store/actions';

import * as _ from 'underscore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  //changeDetection : ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends BaseComponent implements OnInit {

	@ViewChild('contexmenu') contexmenu: ElementRef;
	@ViewChild('scrollable') scrollable: ElementRef;

	private $scrolls: Array<Subscription> = [] //new Subscription();
	private scrollStream;
	private edit: EditForm;
	private editFormShow: Boolean;
	private lazyload : LazyLoadImage;

  	public movies: Array<any>;
  	public posterprefix: string = "https://image.tmdb.org/t/p/w500";
  	public noposter: string = "http://www.christophergrantharvey.com/uploads/4/3/2/3/4323645/movie-poster-coming-soon_1_orig.png";
  	private sorted: Array<string> = ["title", "-releasedDate", "runtime", "-rating", "-_id"];
  	public sortedby: Array<String> = ["Movie title", "Year", "Runtime", "Rating", "Recently added"];
  	public sortIndex: number = 4;
  	public sidebarShow = false;

    public thumbLarge:boolean = true;

	private libraryList: Array<String>;

	public domHeight: number = window.innerHeight;
	public domWidth: number = window.innerWidth;

	private contextX: Number;
	private contextY: Number;
	private contextShow: Boolean = false;
	private contextTemplate: any;
	private contextTransform: any;
	private contextmenuShow: Boolean= false;

	private trackElement: any;

	private scrollDiv: any;

	public editId: String;
	public arrIndex: number;
	private tab;
	private popupopen: String;

  	public allItems: any[];
 
    private itemperPage: number = 2;
    // pager object
    pager: any = {};
 
    // paged items
    pagedItems: any[];

	private stars:number[] = [1,2,3,4,5]

	private features:number[] = [1,2,3,4,5,6,7,8];


	/* Add new */
	public mediaitems=[];
	public sidenavState;
	public store$;
	public $s;
	public name = 'nicolas';
	private pagination = new Pagination();
	private pagination$: Observable<any>;

	private state:object = {
		popupopen : null,
		edit_id : null
	}

  	constructor(public store: Store<AppState>, public media: MediaRequest, public injector: Injector,  private ngZone:NgZone, private el: ElementRef, private renderer: Renderer2,private request: RequestService, private route: ActivatedRoute, private router: Router, private com: CommunicationService, private pagerService: PagerService) { 
  		super(injector);
		this.allItems = [];
		console.log(this.allItems.length);
		this.libraryList = [];
		//this.com.toggleSidebar();
		this.sidenavState = store.select(getSidenavState);
		this.edit = new EditForm(this.injector, this.request);
		this.lazyload = new LazyLoadImage(this.ngZone, this.el);
		this.editFormShow = false;
		this.tab = 1;
		this.thumbLarge = false;
		console.log(this.edit.moviemeta);
		//this.setthumbsize('md');
	}

    ngOnDestroy(){
      console.log('destroy');
    }

	changeTest() {
		console.log('CD HOME')
		return 'CD HOME'
	}

  	ngOnInit() {
		this.store.select('home_media').subscribe(store => {
			this.store$ = store;
			console.log('STORE EMITTING...')
			console.log(this.store$)
		})

		this.pagination$ = this.store.select(getPaginationState);

		if(!this.store$.loaded) this.setPage(this.store$.current_page);

		this.media.getAllMedia(this.store$.current_page, this.itemperPage).subscribe(resp => {

			console.log(resp);
			
			
			this.mediaitems = resp.results.map(movie => {
				return Object.assign({}, movie, {
					//poster : movie.posterLocal || movie.posterURL || movie.thumb
					poster : movie.posterURL ? this.posterprefix+movie.posterURL : movie.thumb ? movie.thumb : null
				})
			})
		});

  		this.request.requestMovie("", this.sorted[this.sortIndex]).subscribe(movies=>{

			movies.map(movie => {
				movie.poster = movie.posterLocal || movie.posterURL || movie.thumb
			})
  		}, err=>{
  			console.log(err);
  		});
		this.request.requestLibrarylist('all').subscribe(resp=>{
			
			this.libraryList = resp;
		},err=>{
			console.log(err);
		})

  	}

	setPage(page=1){
		this.store.dispatch({ type : SET_CURRENT_PAGE,  current_page : page });
		this.requestMedia(this.itemperPage * (page - 1), this.itemperPage);
	}

	requestMedia(skip, limit, library=null): void {
		
		this.media.getAllMedia(skip, limit).subscribe(resp => {

			let movies = resp.results.map(movie => {
				return Object.assign({}, movie, {
					poster : movie.posterURL ? this.posterprefix+movie.posterURL : movie.thumb ? movie.thumb : null
				})
			})
			this.store.dispatch({ type : SET_RESULTS, results : movies } )
			this.store.dispatch({ type : SET_TOTAL_ITEMS, total_items : resp.total })
			this.store.dispatch({ type : SET_PAGINATION, pagination : this.pagination.getPager(resp.total, this.store$.current_page, this.itemperPage)})
		});
	}

	contextActionHandler(event): void {

		switch(event.action) {
			case 'ADD_TO_COLLECTION':
				this.state = Object.assign({}, this.state, {
					popupopen : 'addtocollection',
					edit_id : event._id
				})
				break;
			case 'EDIT':
				this.state = Object.assign({}, this.state, {
					popupopen : 'editform',
					edit_id : event._id
				})
				break;
			case 'DELETE':
				this.store.dispatch({type : DELETE_FROM_RESULTS , _id : event._id})
			default:
				break;
		}
	}

	ngAfterViewInit() {
		//this.lazyload.getposterDiv();
		let containerScrollable = document.getElementById('scrollable');
		this.ngZone.runOutsideAngular(()=>{
			this.scrollStream = Observable.fromEvent(containerScrollable, 'scroll');
			/*this.scrollStream.let(this.pageScroll()).subscribe(() => {
				console.log('scroll');
			});*/
		})
		

		
		this.domHeight = window.innerHeight - 61
		this.domWidth = window.innerWidth;
		window.onresize = (e) =>
		{
			//ngZone.run will help to run change detection
			this.ngZone.run(() => {
					this.domHeight = window.innerHeight - 61;
					console.log("Height: " + window.innerHeight);
			});
		};

	}

	ngAfterViewChecked() {
		console.log("HOME VIEW CHECK")
	}


	scrollTo(element, to, duration) {
        if (duration < 0) return;
        var difference = to - element.scrollTop;
        var perTick = difference / duration * 2;
		setTimeout(()=>{
			console.log('settimeout')
			element.scrollTop = element.scrollTop + perTick;
			this.scrollTo(element, to, duration - 2);
			console.log(element.scrollTop)
			console.log(duration - 2)
		}, 10);
	}
	scrollTop(){
		let containerScrollable = document.getElementById('scrollable');
		this.scrollTo(containerScrollable, 0, 0);
	}

	

	pageScroll(){
		console.log('ss');
		return (pagescroll:Observable<Event>)=>{
			return pagescroll
				.filter(()=>{
					if(!this.trackElement || this.contextShow == false) return false
					else return true;
				}).do(()=>{
					var pos = this.getCoords(this.trackElement);
					console.log(this.contexmenu.nativeElement)
					if(pos.top > 60){
						//if(pos.left + 150 > this.domWidth) this.contextTransform = this.sanitizer.bypassSecurityTrustStyle(`translateX(${this.domWidth - 170}px) translateY(${pos.top + 16}px)`);
						//else this.contextTransform = this.sanitizer.bypassSecurityTrustStyle(`translateX(${pos.left - 10}px) translateY(${pos.top + 16}px)`);
						//if(pos.left + 150 > this.domWidth) this.renderer.setStyle(this.contexmenu.nativeElement, 'transform', `translateX(${this.domWidth - 170}px) translateY(${pos.top + 16}px)`)
						//else this.renderer.setStyle(this.contexmenu.nativeElement, 'transform', `translateX(${pos.left - 10}px) translateY(${pos.top + 16}px)`)
					}
				})
		}
		/*if(!this.trackElement || this.contextShow == false) return;
		var pos = this.getCoords(this.trackElement);
		if(pos.top > 60){
			if(pos.left + 150 > this.domWidth) this.contextTransform = this.sanitizer.bypassSecurityTrustStyle(`translateX(${this.domWidth - 170}px) translateY(${pos.top + 16}px)`);
			else this.contextTransform = this.sanitizer.bypassSecurityTrustStyle(`translateX(${pos.left - 10}px) translateY(${pos.top + 16}px)`);
		}*/	
	}

	listChange(){
		console.log("START=>")
		console.log(this.$scrolls);
		this.$scrolls
            .filter(subscription => {
				if(subscription.closed == false) console.log("subscription");
				if(subscription.closed == true) console.log("UNSUBSCRIBED");
				return subscription && subscription.closed == false
			})
            .forEach(subscription => {
				subscription.unsubscribe();
				console.log("Unsubscribed");
			});
		this.scrollTop();
		/*let dd = this.lazyload.getposterDiv().subscribe(elems=>{
			this.$scrolls = [];
			console.log(elems)
			for(let d of elems){
				this.$scrolls.push(this.scrollStream.startWith('').let(this.lazyload.lazyLoadImage(d,d.attributes['data-src'].nodeValue,"","",100)).subscribe(sub=>console.log('show')))		
			}
		});*/
	}

	addtoCart(/*index:number*/ item:object): void{
		//let cartItem = 
		//this.com.addtoCart(this.allItems[((this.pager.currentPage-1) * this.itemperPage) + index]);
		//return false;
		this.store.dispatch({type : ADD_TO_CART, item: item})
	}

	addtoFeatures(id:string, toggle, index) {
		/*this.features.push(x);
		if(this.features.length > 8) this.features.shift()// = this.features.length < 8 ? this.features.length : 8;
		console.log(this.features)*/
		this.store.dispatch({ type : ADD_TO_FEATURE, _id : id })

		return
		//this.mediaitems[index].feature = true;
		/*if(toggle){
			this.request.removefromFeature(id).subscribe(rem=>{
				console.log(rem);
				this.allItems[((this.pager.currentPage-1) * this.itemperPage) + index].feature = false;
			})
		}else{
			this.request.addtoFeature(id).subscribe(add=>{
				console.log(add)
				this.allItems[((this.pager.currentPage-1) * this.itemperPage) + index].feature = true;
			})
		}*/
	}

	changetab(index:Number){
		this.tab = index;
	}

	closePopup():void{
		this.popupopen = null;
		this.editId = null;
		this.state = Object.assign({}, this.state, {
			popupopen : null,
			edit_id : null
		})
	}

	editOpen(id){
		this.popupopen = 'editform';
		this.contextClose();
		this.editId = id;
		//this.editFormShow =  true;
		//this.edit.openEditor();
		//this.tab = 1;
		//this.edit.getData(id);
	}

	mediainfoOpen(id){
		this.popupopen = 'mediainfo';
		this.contextClose();
		this.editId = id;
		//this.editFormShow =  true;
		//this.edit.openEditor();
		//this.edit.getMediaInfo(id);
	}

	collectionOpen(id){
		this.popupopen = 'collection'//'editform';
		this.contextClose();
		this.editId = id;
		//this.editFormShow =  true;
		//this.edit.openEditor();
		//this.edit.getCollections(id);
	}

	editClose(){
		this.edit.close();
	}

	fadeEnd(){
		if(this.edit.show === false) this.editFormShow = false;	
	}

	handlecontextClose(event){
		console.log("HANDLE CONTEXT CLOSE")
		console.log(event)
		if(event.close) {
			if(!this.contextShow) return
			//this.editId = null;

			setTimeout(() => this.contextShow = false, 300);

			if(this.trackElement) {
				this.renderer.removeClass(this.trackElement.offsetParent, "poster-overlay-hover");
				this.trackElement = null;
				this.arrIndex = undefined;
			}
		}
	}

	contextClose(){
		if(!this.contextmenuShow){
			console.log(this.contextmenuShow)
			return;
		} 
		this.editId = null;
		console.log(this.contextmenuShow)
		this.contextmenuShow = false;
		setTimeout(()=>this.contextShow = false, 300);			
		
		if(this.trackElement) {
			this.renderer.removeClass(this.trackElement.offsetParent, "poster-overlay-hover");
			//this.trackElement.offsetParent.classList.remove("poster-overlay-hover");
			this.trackElement = null;
			this.arrIndex = undefined;
		};
		console.log("CLOSE");
	}
	contextOpen(event, movdata, arrindex){
		var id = movdata;
		if(this.contextShow == true) {
			this.editId = "";
			this.arrIndex = undefined;
			if(this.trackElement) {
				//this.trackElement.offsetParent.classList.remove("poster-overlay-hover");
				this.renderer.removeClass(this.trackElement.offsetParent, "poster-overlay-hover");
				this.trackElement = null;
				this.arrIndex = undefined;
			};
			return this.contextClose();
		}
		console.log(event);
		this.editId = id;
		this.arrIndex = arrindex;
		console.log(this.arrIndex)
		this.contextShow = false;
		this.contextmenuShow = false;
		this.trackElement = event.target;
		var pos = this.getCoords(event.target);
		console.log(pos);
		this.contextY = pos.top + 16;
		this.contextX = pos.left + 16;
		this.contextShow = true;
		
		//console.log(this.contextTransform);
		setTimeout(()=>{			
			this.contextmenuShow = true;
			//if(pos.left + 150 > this.domWidth) this.renderer.setStyle(this.contexmenu.nativeElement, 'transform', `translateX(${this.domWidth - 170}px) translateY(${pos.top + 16}px)`);
			//else this.renderer.setStyle(this.contexmenu.nativeElement, 'transform', `translateX(${pos.left - 10}px) translateY(${pos.top + 16}px)`);
			//event.target.offsetParent.classList.add("poster-overlay-hover");
			this.renderer.addClass(this.trackElement.offsetParent, "poster-overlay-hover");
		},10)
		
	}
	getCoords(elem){ // crossbrowser version
			var box = elem.getBoundingClientRect();

			var body = document.body;
			var docEl = document.documentElement;

			var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

			var clientTop = docEl.clientTop || body.clientTop || 0;
			var clientLeft = docEl.clientLeft || body.clientLeft || 0;

			var top  = box.top +  scrollTop - clientTop;
			var left = box.left + scrollLeft - clientLeft;

			return { top: Math.round(top), left: Math.round(left) };
		}

	getHeight(){
		console.log(document.documentElement.clientHeight - 61);
		return document.documentElement.clientHeight - 61;
	}

  	setPage1(page: number) {
        if (page < 1/* || page > this.pager.totalPages*/) {
			console.log('pager return');
			console.log(this.pager.totalPages)
            return;
        }
 
        // get pager object from service
        this.pager = this.pagerService.getPager(this.allItems.length, page, this.itemperPage);
 
        // get current page of items
        this.pagedItems = this.allItems.slice(this.pager.startIndex, this.pager.endIndex + 1);
		this.listChange()
    }

  	toggleSidebar(){
			//this.sidebarShow = !this.sidebarShow;
  		this.com.toggleSidebar();
  		//this.sidebarShow ? this.sidebarShow = false : this.sidebarShow = true;
  	} 

	changeLibrary(id){
		this.allItems = [];
		this.request.requestMovieByLibrary(id).subscribe(resp=>{
			for(let res of resp){
				this.allItems.push(this.calculatemeta(res));
			}
			console.log('all items');
			console.log(this.allItems)
  			this.setPage(1);
			//this.listChange();
		})
	}

	gotoDetail(id){
		this.com.collapseSidebar();
		this.router.navigate(['discover/movie/detail', id])
	}

	requestsortby(index: number){
		if(index == this.sortIndex) return false;
		this.sortIndex = index;
		this.request.requestMovie("", this.sorted[index]).subscribe(movies=>{
  			for(let movie of movies){
					this.allItems.push(this.calculatemeta(movie));
				}
  			//this.allItems = this.calculatemeta(movies);
  			this.setPage(1);
  		}, err=>{
  			console.log(err);
  		})
	}

	deleteItem(id:string, index:number){
		this.request.deletemoviebyId(id).subscribe(del=>{
			console.log(del);
			this.allItems.splice(((this.pager.currentPage-1) * this.itemperPage) + index, 1);
			this.setPage(this.pager.currentPage);
			this.trackElement = null;
			this.contextClose();
		}, err=>{
			console.log(err);
		})
	}

  setthumbsize(size: string){  
    switch(size){
      case 'lg':
        this.thumbLarge = true;
        this.itemperPage = 10;
        this.setPage(1);
		//this.lazyload.getposterDiv();
        break;
      case 'md':
        this.thumbLarge = false;
        this.itemperPage = 20;
        this.setPage(1);
		//this.lazyload.getposterDiv();
        break;
      default:
        break;
    }
  }

}
