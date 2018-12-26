import { Component, OnInit } from '@angular/core';
import { SettingService } from '../../providers/request.service';
import { SocketConnectionService } from '../../providers/socket-connection.service'

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
  providers: [SettingService]
})
export class SettingComponent implements OnInit {

  private downloading: boolean;
  private toDownload: number;
  private downloadingUrl: string;
  private downloadProgress: string;

  private extending: boolean;
  private toExtend: number;
  private extendingTitle: string;

  constructor(private setting: SettingService, private io: SocketConnectionService) { }

  ngOnInit() {
    this.setting.downloadCheck().subscribe(resp=>{
      console.log(resp)
      this.downloading = resp.doing;
      this.toDownload = resp.counts;
    })
    this.setting.extendCheck().subscribe(resp=>{
      console.log(resp)
      this.extending = resp.doing;
      this.toExtend = resp.counts;
    })

    this.io.socket.on('dl',(err, event)=>{
      if(err) return console.error(err);
      if(event && event.status){
        if(event.status == 'pending'){
          if(event.progress) this.downloadProgress = event.progress;
          this.downloadingUrl = event.url;
        }else if(event.status == 'complete'){
          this.setting.downloadCheck().subscribe(resp=>{
            console.log(resp)
            this.downloading = resp.doing;
            this.toDownload = resp.counts;
          })
        }
      }
    })

    this.io.socket.on('extender', (err, event)=>{
      if(err) return console.error(err);
      if(event && event.status){
        if(event.status == 'pending'){
          this.extendingTitle = event.title
        }else if(event.status == 'complete'){
          this.setting.extendCheck().subscribe(resp=>{
            console.log(resp)
            this.extending = resp.doing;
            this.toExtend = resp.counts;
          })
        }
      }
    })
  }

  startDownload(){
    console.log('start')
    this.io.socket.emit('dl',{action : 'download'});
    this.downloading = true;
  }
  pauseDownload(){
    this.io.socket.emit('dl',{action : 'pause'});
  }

  startExtend(){
    this.io.socket.emit('extender', {action : 'extend'});
    this.extending = true;
  }

}
