import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { RequestService } from '../../providers/request.service' 


@Component({
  selector: 'add-to-collection',
  templateUrl: './add-to-collection.component.html',
  styleUrls: ['./add-to-collection.component.css']
})
export class AddToCollectionComponent implements OnInit{

  @Input() mediaID: string;
  @Output() close:EventEmitter<void> = new EventEmitter<void>();

  private show: boolean;
  private loaded: boolean;
  private error: boolean;
  private btnloading:boolean;

  private mediaData;
  private movieId;
  private collectionName:string;
  private collectionList: Array<object> = [];

  constructor(private request: RequestService, private cd: ChangeDetectorRef) {
   }

  ngOnInit() {
    setTimeout(()=>this.show = true, 10);
    if(!this.mediaID) return this.error = true;
    this.getCollections(this.mediaID);
  }
 /* ngAfterViewInit() {
    console.log('==================VIEW INIT========================')
    setTimeout(() => {
      this.show = true
      console.log('++++++++++++ SHOW TRUE ++++++++++++++++')
    }, 10);
    if(!this.mediaID){
      this.error = true;
      return
    } 
    //this.cd.detectChanges()
    this.getCollections(this.mediaID);
  }*/

  editClose(){
    this.show = false;
  }

  fadeEnd(){
    console.log('=========== FADE END ============')
    if(!this.show) this.close.emit();
  }



  getCollections(id:string){
    this.mediaData = null;
    this.movieId = null;
    this.loaded = false;
    this.error = false;
    this.btnloading = false;
    this.request.getCollections().subscribe(resp=>{
      this.collectionList = resp;
      this.loaded = true;      
    },err=>{
      console.log(err);
      this.error = true;
    })
    this.request.getmoviebyId(id,'collections').subscribe(resp=>{
      this.mediaData = resp;
      this.movieId = resp._id;
    }, err=>{
      console.log(err);
      this.error = true;
    })
  }

  createCollection(){
    console.log(this.collectionName);
    if(!this.collectionName) return;
    this.request.createCollection(btoa(this.collectionName)).subscribe(resp=>{
      this.collectionList.push({
        name : resp.name,
        id : resp.id
      })
    },err=>{
      console.log(err);
    })
  }

  addtoCollection(collectionid:number, mediaid: string){
    if(!this.mediaData) return;
    for(let m of this.mediaData.collections){
      if(m.id == collectionid) {
        this.editClose();
        return;
      }
    }
    this.request.addtoCollection(collectionid, mediaid, 'movie').subscribe(resp=>{
      console.log(resp);
      this.editClose();
    }, err=>{
      console.log(err);
    })
  }

}
