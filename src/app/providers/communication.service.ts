import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
/*import { SocketConnectionService } from './socket-connection.service';*/

@Injectable()
export class CommunicationService {


	public sidebarShow: Boolean = false;
	private subject = new Subject<any>();
	public noti = new Subject<any>();

	public shoppingCart:any[];
	public cartEvent = new Subject();

  	constructor(/*private socket: SocketConnectionService*/) {
		  this.shoppingCart = [];
		  /*this.socket.notification().subscribe(notification=>{
			if(notification['complete']){
				this.notification({
					msg : notification['notification'],
					show : true,
					loading: false,
					auto: true
				})
			}else{
				this.notification({
					msg : notification['notification'],
					show : true,
					loading: true,
					auto: 'no'
				})
			}		  
		  })*/
	}

	addtoCart(item:object){
		for(let i of this.shoppingCart){
			if(i._id == item['_id']){
				return;
			}
		}
		this.shoppingCart.push(item);
		this.getCart();

	}
	removefromCart(index:number){
		this.shoppingCart.splice(index, 1);
		this.getCart();
	}

	getCart():Observable<{}>{
		this.cartEvent.next(this.shoppingCart)
		return this.cartEvent.asObservable();
	}

  	toggleSidebar() :Observable<boolean>{
  		this.sidebarShow = !this.sidebarShow;
  		this.subject.next(this.sidebarShow);
  		return this.subject.asObservable();
  	}

	collapseSidebar() :Observable<boolean>{
  		this.sidebarShow  = false;
  		this.subject.next(this.sidebarShow);
  		return this.subject.asObservable();
  	}

	notification(noti:any):Observable<any>{
		if(noti && !noti.auto) noti.auto = true;
		this.noti.next(noti);
		return this.noti.asObservable();
	}

}
