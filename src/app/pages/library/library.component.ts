import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../providers/request.service' 

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {

	public libraryList:Array<any>;


  constructor(private req: RequestService) { }

  ngOnInit() {
  	this.req.requestLibrarylist("all").subscribe(lists=>{
        this.libraryList = lists;
        console.log(this.libraryList)
    })
  }

}
