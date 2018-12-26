import { Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { NgForm } from '@angular/forms';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { RequestService } from '../../providers/request.service' 
import { CommunicationService } from '../../providers/communication.service' 

@Component({
  selector: 'app-library-setting',
  templateUrl: './library-setting.component.html',
  styleUrls: ['./library-setting.component.css']
})
export class LibrarySettingComponent implements OnInit, OnDestroy {

  @Input() _event:Subject<any>; 
  @Output() emitter = new EventEmitter();

  private loadChild: boolean;
  private showModal: boolean;
  private step: number;
  private libraryType: string;
  private loaded: boolean;
  private error: boolean;
  private btnloading: boolean;

  private currentPath: string;
  private browseList: Array<string>;
  private driveList: Array<string>;
  private driveActive: string;

  private libraryData: any;
  private editMode:boolean;

  constructor(private request: RequestService, private communication: CommunicationService) { 
    this.browseList = [];
    this.driveList = [];
    this.currentPath = "C:\\"
  }

  ngOnInit() {
    this._event.subscribe(event=>{
      if(event) {
        this.editMode = true;
        this.libraryData = event;
      }
      this.openChild();
      this.loadLibrary(event._id);
      this.listDrive();
      this.folderBrowser(btoa(this.currentPath), this.currentPath);
    })
    this.libraryData = {};
    this.showModal = false;
    this.step = 1;
    this.loaded = true;
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log('destroy')
    this._event.unsubscribe();
  }
  
  openChild(){
   if(!this.editMode) return; 
    this.loadChild = true;
    this.loaded = false;
    this.error = false;
    this.step = 1;
    setTimeout(()=>{
      this.showModal = true;
    }, 10)
  }
  closeChild(){
    this.showModal = false;
  }

  nextStep(){
    if(this.step < 3) this.step++;
  }

  backStep(){
    if(this.step > 1) this.step--;
  }

  selectType(type:string){
    if(!this.editMode) this.libraryType = type;
  }

  fadeEnd(){
    if(this.showModal == false) this.loadChild = false;
  }

  createLibrary(form:NgForm){
    console.log('create');
    this.btnloading = true;
    this.request.createLibrary(form.value).subscribe(resp=>{
      console.log(resp);
      this.btnloading = false;
    }, err=>{
      console.log(err)
      this.btnloading = false;
    });
  }

  loadLibrary(_id){
    console.log('loadlib=>'+_id)
    this.request.requestLibraryDetail(_id).subscribe(resp=>{
      this.libraryData = resp;
      this.libraryType = resp.type;
      this.loaded = true;
      console.log(resp);
    }, err=> this.error = true);
  }

  listDrive(){
    this.request.browseFolder().subscribe(drives=>{
      this.driveList = drives;
    })
  }

  browseDrive(drive:string, event: any){
    let drivepath = `${drive}\\`;
    let encodeDrive = btoa(drivepath);
    this.driveActive = drive;
    this.folderBrowser(encodeDrive, drivepath, event);
  }

  folderBrowser(encode:string, currentpath:string, event?:any){
    var element;
    if(event){
      element = event.target.lastElementChild;
      element.classList.remove('hidden');
    }   
    this.request.browseFolder(encode).subscribe(folders=>{
      this.currentPath = currentpath;
      this.browseList = folders;
      if(element) element.classList.add('hidden');
    }, err=>{
      if(element) element.classList.add('hidden');
    })
  }

  eventObj(status:string, msg:any){
    return {
      status : status,
      msg : msg
    }
  }

  addFolder(){
    let noti = {
      show : true,
      msg : 'Processing your request. Please wait...',
      loading : true
    }
    this.communication.notification(noti);
    setTimeout(()=>{
      noti.show = false;
      this.communication.notification(noti);
    },5000)
    //this.emitter.emit(this.eventObj('success', 'successfully'));    
  }

  addMedia(){
  		if(!this.currentPath || !this.editMode) return;
      this.btnloading = true;
  		this.request.addtoLibrary(this.libraryData['type'], btoa(this.currentPath), this.libraryData['ID']).subscribe(resp=>{
        this.emitter.emit({resp : resp});
        this.btnloading = false;
        this.closeChild();
  		}, (err)=>{
        this.emitter.emit({error:err});
        this.btnloading = false;
    })
  	
  	  		
  }

}
