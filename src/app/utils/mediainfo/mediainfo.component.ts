import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RequestService } from '../../providers/request.service' 

@Component({
  selector: 'mediainfo',
  templateUrl: './mediainfo.component.html',
  styleUrls: ['./mediainfo.component.css']
})
export class MediainfoComponent implements OnInit {

  @Input() mediaID:string;
  @Output() close:EventEmitter<void> = new EventEmitter<void>();

  private show: boolean;
  private loaded: boolean;
  private error: boolean;

  private mediainfo: string[] = [];


  constructor(private request: RequestService) { }

  ngOnInit() {
    setTimeout(()=>this.show = true, 10)
    if(!this.mediaID) return this.error = true;
    this.getMediaInfo(this.mediaID);
  }

  editClose(){
    this.show = false;
  }

  fadeEnd(){
    console.log('end')
    if(!this.show) this.close.emit();
  }

  getMediaInfo(id:string){
      this.mediainfo = [];
      this.loaded = false;
      this.error = false;
      this.request.getmediainfo(id).subscribe(res=>{
        this.mediainfo.push(res);
        console.log(this.mediainfo);
        this.loaded = true;
      }, err=> this.error = true)
   }

}
