import { Component, OnInit } from '@angular/core';

import { RequestService } from '../../providers/request.service';
import { CommunicationService } from '../../providers/communication.service';
import { SocketConnectionService } from '../../providers/socket-connection.service';
import { FolderPickerComponent } from '../../utils/folder-picker/folder-picker.component';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  private progress: number = 0;
  private cartItems: any;
  private totalSpace: number;
  private totalSpaceFormat:string;
  private freeSpace: number;
  private freeSpaceFormat:string;
  private stars:number[] = [1,2,3,4,5];

  private showFolderPicker:boolean = false;
  private destPath:string;
  private driveError:string;

  private copying:boolean = false;
  private complete: boolean = false;

  constructor(private request: RequestService, private io: SocketConnectionService, private communication: CommunicationService) { }

  ngOnInit() {
      /*this.io.socket.on('copyEvent', (err, data, percent, done)=>{
        console.log(percent);
        if(percent) this.progress = parseInt(percent);
      })*/

      this.cartItems = this.communication.shoppingCart;
      this.totalSpaceFormat = this.formatKb(this.requiredSapce(this.cartItems));
      this.totalSpace = this.requiredSapce(this.cartItems);
      this.onSelectFolder(this.storeDestPath());
      this.checkDisk();
      this.communication.getCart().subscribe(items=>{
        this.cartItems = items;
        this.totalSpaceFormat = this.formatKb(this.requiredSapce(this.cartItems));
        this.totalSpace = this.requiredSapce(this.cartItems);
        this.checkDisk();
      })

  }

  requiredSapce(items){
      let total = [];
      for(let item of items){
        total.push(item.filesize);
      }
      let sum = total.reduce((a, b) => a + b, 0);
      console.log(sum);
      return sum;
  }

  formatKb(bytes,decimals=2) {
	   	if(bytes == 0) return '0 Bytes';
	   	bytes = bytes * 1000;
	   	var k = 1000,
	       dm = decimals || 2,
	       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
	       i = Math.floor(Math.log(bytes) / Math.log(k));
	   		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

  storeDestPath(path?:string):string{
    if(path) {
      localStorage.setItem('destPath', btoa(path))
      return null;
    }
    else return atob(localStorage.getItem('destPath')) || null;
  }

  openFolderPicker(){
    this.showFolderPicker = true;
  }
  onSelectFolder(path){
    console.log(path);
    if(path && path !== this.destPath){
      this.storeDestPath(path);
      this.destPath = path;
      this.request.getDriveInfo(btoa(path)).subscribe(resp=>{
        if(resp.status == "READY"){
          this.freeSpace = resp.free/1000;
          this.checkDisk();
        }else{
          this.driveError = "Drive is not found";
        }

      })
    } 
    this.showFolderPicker = false;
    
  }

  checkDisk(){
    if(!this.freeSpace) return;
    this.freeSpaceFormat = this.formatKb(this.freeSpace)
     if(this.freeSpace < this.totalSpace){
       this.driveError = `Not enough space. This drive has ${this.freeSpaceFormat} of free space. Total storage required is ${this.totalSpaceFormat}. Try again.`; 
     }else{
       this.driveError = null; 
     }
  }

  abortAll(){
    this.io.socket.emit('copyEvent', {action: 'abort'})
  }

  onComplete(){
    this.io.socket.off('copyEvent');
    this.complete = true;
  }

  startCopy(){
      this.copying = true;
      let i = 0;
      const copy = (ii)=>{
          console.log("copy index=>"+ii);
          if(ii < this.cartItems.length){
            this.io.socket.emit('copyEvent', {action :'copy', itemId : this.cartItems[ii]._id, destination: btoa(this.destPath) });
            console.log("COPYING..." + this.cartItems[ii]._id);
          }else return false;
      }
      copy(i);
      this.io.socket.on('copyEvent', (err, data, percent, done)=>{
          if(err){
            console.log(err);
            switch (err.code){
              case 500: //FATAL INTERNAL ERROR
                break;
              case 404: //FILE NOT FOUND
                if(i < this.cartItems.length){
                  this.cartItems[i].copy = {status : 0};
                  i++
                  copy(i);
                }
                break;
              case 403: //DRIVE NOT FOUND OR NOT READY
                break;
              case 400: //NOT ENOUGH SPACE
                break;
              case 401: //ABORT ALL
                this.io.socket.off('copyEvent');
                break;
              default:
                break;
            };
          }
          if(done){
            this.cartItems[i].copy = {status : 1, progress : 100};
            if(i < this.cartItems.length-1){
                i++;
                return copy(i);
            }
            else return this.onComplete();
          }
          if(percent) this.cartItems[i].copy = {progress : parseInt(percent)};
      })
  }

}
