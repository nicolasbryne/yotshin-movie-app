import { Component, OnInit} from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import * as moment from 'moment';
import { LibrarySettingComponent } from '../library-setting/library-setting.component'
import { RequestService } from '../../providers/request.service' 
import { CommunicationService } from '../../providers/communication.service'
import { SocketConnectionService } from '../../providers/socket-connection.service'

@Component({
  selector: 'app-add-media',
  templateUrl: './add-media.component.html',
  styleUrls: ['./add-media.component.css']
})
export class AddMediaComponent implements OnInit {

  loadLibraryPopup:Subject<any> = new Subject();
	public folderlist: Array<any> = []
	public inputfolder: string;
  public status: any;
  private statusColors: Object = {
    success : "#aeef94",
    error   : "#ec6460"
  }
  private statusTexts: Object = {
    success  : 'Successfully added to library',
    error    : 'Error occouring! Cannot add this folder',
    notfound : 'Folder is not found!',
    duplicate: 'Folder already exists in library!'
  }

  public addHide: boolean = true;
  public statusColor: string;
  public loadingShow: number = 0;
  public statusShow: number = 0;
  public libraryurlId: number;
  //public libraryName: string;
  //public libraryType: string;
  //public libraryID: string;
  public libraryData: object;
  public libraryList: Array<any>;

  private updateinProgress: boolean = false;

  private loadChild: boolean;

  private route$: any;


  constructor(private io:SocketConnectionService, private req: RequestService, private communication: CommunicationService, private sanitizer: DomSanitizer, private router: Router, private route: ActivatedRoute) {
    this.libraryData = {};
   }

  ngOnInit() {    
    this.route$ = this.route.params.subscribe(params=>{
      this.libraryurlId = params['name'];
      this.req.requestLibraryFolder(this.libraryurlId).subscribe(folders=>{
        this.folderlist = folders;
      }, error => {
          if(error.status == 404) console.log("Library Not found")
      })

      this.req.requestLibrarylist("all").subscribe(lists=>{
        this.libraryList = lists;
        console.log(this.libraryList)
        let currentLib = this.libraryList.filter((lib)=>{
          return lib.ID == this.libraryurlId;
        })[0];
        /*this.libraryName = currentLib.name;
        this.libraryType = currentLib.type;
        this.libraryID = currentLib.ID;
        console.log("00"+this.libraryType)*/
        this.libraryData = currentLib;
      },err=>console.log(err));
    }); 

    this.io.updateLibrary().subscribe(data=>{
      console.log(data);
      if(data && data['complete']) return this.updateinProgress = false;
      if(data) return this.updateinProgress = true;
    })
  }

  ngAfterViewInit() {

    
  }

  changeLibrary(libID:number){
    this.router.navigate(['library/', libID])
  }


  updateLibrary(){
    this.updateinProgress = true;
    /*this.req.updateLibrary(this.libraryData['type'], this.libraryData['ID']).subscribe(resp=>{
      console.log("Updating library in background");
    }, err=>{
      console.log("Error occour while updating library");
    })*/
    this.req.reloadLibrary(this.libraryData['type'], this.libraryData['ID']).subscribe(resp=>{
      console.log("Updating library in background");
    }, err=>{
      console.log("Error occour while updating library");
    })
  }

  addToggle(){
    //this.loadLibraryPopup.next(true);
    this.addHide = !this.addHide;
  }

  librarySetting(){
    this.loadLibraryPopup.next(this.libraryData);
  }

  addMedia(){
  		if(!this.inputfolder) return;
      this.statusColor = null;
      this.statusShow = 1;
      this.loadingShow = 1;
      this.status = "Checking..."
  		this.req.addtoLibrary(this.libraryData['type'], this.inputfolder, this.libraryData['ID']).subscribe(resp=>{
  			let newfolder = {
  				directory	: resp.directory,
  				filecount	: resp.filecount,
  				dateAdded	: resp.dateAdded
  			};
  			this.folderlist.push(newfolder);
        this.loadingShow = 0;
        this.statusColor = this.statusColors['success'];
        this.status = this.statusTexts['success'];
        this.inputfolder = "";
  		}, (err)=>{
  			if(err.status == 404){
  				console.log("dir not found");
          this.status = this.statusTexts['notfound'];

  			}else if(err.status == 403){
           this.status = this.statusTexts['duplicate'];
        }else{
          this.status = this.statusTexts['error'];
        }
        this.loadingShow = 0;        
        this.statusColor = this.statusColors['error'];
  		})
  		
  		
  }

  removeFolder(dir:string, index:number){
    console.log("dir=>"+dir)
    this.req.removefromLibrary(this.libraryData['type'], dir ,this.libraryData['ID']).subscribe(resp=>{
      console.log(resp);
      this.folderlist.splice(index, 1);
    }, err=>{
      console.log(err);
    })
  }

  receiveEvent(event){
    console.log(event);
    if(event && event.resp){
      let newfolder = {
  				directory	: event.resp.directory,
  				filecount	: event.resp.filecount,
  				dateAdded	: event.resp.dateAdded
  			};
        let noti = {
          show : true,
          msg : `Successfully imported '${event.resp.directory}' to this library`,
          loading : false
        }
        this.communication.notification(noti);
        this.folderlist.push(newfolder);
    }
    if(event && event.error){
      let noti = {
          show : true,
          msg : null,
          loading : false
        }
      if(event.error.status == 404){
        console.log("dir not found");
        noti.msg = this.statusTexts['notfound'];
      }else if(event.error.status == 403){
          noti.msg = this.statusTexts['duplicate'];
      }else{
        noti.msg = this.statusTexts['error'];
      }

      this.communication.notification(noti);


    }
  }

  inputchange(event){
    if(this.statusShow == 1 ) this.statusShow = 0;
  }

  datetodate(date: Date){
  		return moment(date).format("MMM DD, YY h:mm a");
  }

}
