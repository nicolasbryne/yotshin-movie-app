import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { CommunicationService } from './communication.service';
import * as io from 'socket.io-client';

@Injectable()
export class SocketConnectionService {

  public socket: SocketIOClient.Socket;
  private socketURL:string = 'http://localhost:3000';

  constructor(private communication: CommunicationService) {
    this.socket = io(this.socketURL);
    this.socket.on('notification', (notification, complete)=>{
        /*if(complete) return observer.next({notification:complete, complete: true});
        observer.next({notification:notification});*/
        if(complete) return this.notificationPush(notification, complete);
        return this.notificationPush(notification);
    })
  }

  init():Observable<string>{
    this.socket.emit('init',"APP IS CONNECTED");
    return new Observable((observer)=>{
      this.socket.on('init', (data)=>{
        if(data) observer.next(data);
      })
    })
  }

  copy():Observable<string>{
    return new Observable(observer=>{
      this.socket.on('copy', (data, complete)=>{
        if(complete) return observer.next(complete);
        if(data) observer.next(data);
      })
    })
  }

  updateLibrary():Observable<object>{
    return new Observable(observer=>{
      this.socket.on('update_library',(data, complete)=>{
        if(complete){
          this.notificationPush(data, complete)
          return observer.next({data:complete, complete: true})
        }
        this.notificationPush(data);
        observer.next({data:data});
      })
    })
  }

  notification():Observable<object>{
    return new Observable(observer=>{
      
    })
  }

  notificationPush(notification, complete?){
    if(complete){
      this.communication.notification({
        msg : complete,
        show : true,
        loading: false,
        auto: true
      })
    }else{
      this.communication.notification({
        msg : notification,
        show : true,
        loading: true,
        auto: 'no'
      })
    }		  
  }

}
