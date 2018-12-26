import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { RequestService } from '../../providers/request.service';

@Component({
  selector: 'folder-picker',
  templateUrl: './folder-picker.component.html',
  styleUrls: ['./folder-picker.component.css']
})
export class FolderPickerComponent implements OnInit, OnDestroy {

  @Output() selectedFolder: EventEmitter<string> = new EventEmitter<string>();

  private showModal:boolean;
  private pickFolder:boolean = false;
  private driveList:any[] = [];
  private driveActive;
  private currentPath:string = "C:\\";
  private browseList:any[] = [];
  private btnLoading: boolean;

  constructor(private request: RequestService) { 

  }

  ngOnInit() {
    console.log("Folder Picker Init");
    this.listDrive();
    this.folderBrowser(btoa(this.currentPath), this.currentPath);
  }

  ngAfterViewInit() {
    setTimeout(()=>{
      this.showModal = true;
    }, 10)
  }

  closeDialog(){
    this.showModal = false;
  }

  fadeEnd(){
    if(this.showModal == false && this.pickFolder) return this.selectedFolder.emit(this.currentPath);
    if(this.showModal == false && !this.pickFolder) return this.selectedFolder.emit(null);
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

  selectFolder(){
    if(!this.currentPath) return;
    this.pickFolder = true;
    this.closeDialog();
  }


  ngOnDestroy() {
    console.log("FOLDER_PICKER_DESTROY");
  }

}
