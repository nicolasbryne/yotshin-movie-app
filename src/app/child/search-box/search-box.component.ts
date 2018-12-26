import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { FormControl } from '@angular/forms';

import { RequestService } from '../../providers/request.service';

@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})

export class SearchBoxComponent implements OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  

  private POSTER_PREFIX: string = "https://image.tmdb.org/t/p/w500";
  private searchExpand: boolean;
  private searchValue: string;
	private searchTerm = new FormControl();
  private searchTerm$;
	private searchResults:any[] = [];

  private clickListener$;

  constructor(private renderer: Renderer2, private el: ElementRef, private request: RequestService) { }

  

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.searchTerm$ = this.searchTerm.valueChanges.debounceTime(400).distinctUntilChanged().filter(term=> (term && term.length >= 2) ? true:false)
				.switchMap(term => this.request.searchTerm(term))
        .subscribe(results => {
            this.searchResults = this.resultReform(results);
				})
  }

  clickHandler(event) {
    if(!this.el.nativeElement.contains(event.target)){ // if click outside of  search-box component
      this.searchBlur()
      if(typeof this.clickListener$ === 'function'){
        this.clickListener$();
        this.clickListener$ = undefined;
      } 
    }
  }

  searchToggle() {
    if(!this.searchExpand){
			this.searchTerm.value && this.searchTerm.setValue(null);
			this.searchInput.nativeElement.focus();
		}else{
			this.searchBlur();
		}
    this.searchExpand = !this.searchExpand;
  }

  searchnow() {

    this.renderer.addClass(this.searchInput.nativeElement.parentElement, 'focus');

    if(typeof this.clickListener$ !== 'function') this.clickListener$ = this.renderer.listen('document', 'click', this.clickHandler.bind(this))

    if(this.searchTerm.value && this.searchTerm.value.length >= 2){
      this.request.searchTerm(this.searchTerm.value).subscribe(results=>{
          this.searchResults = this.resultReform(results);
      })
		}
  }

  searchClear(){
    this.searchTerm.setValue(null);
  }

  searchBlur() {
    this.searchResults = [];
    this.renderer.removeClass(this.searchInput.nativeElement.parentElement, 'focus');
  }

  resultReform(results: Array<any>) {
    return [...results].map( result => {
        return Object.assign({}, result, {
          poster : result.posterURL ? this.POSTER_PREFIX + result.posterURL : result.thumb ? result.thumb : null
        })
    })
  }

}
