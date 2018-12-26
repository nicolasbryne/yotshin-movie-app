import { Component, Injector, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BaseComponent } from '../base/base.component';
import { RequestService } from '../../providers/request.service' 

import { LazyLoadImage } from '../home/LazyLoad';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseComponent implements OnInit {

  @ViewChild('featureSlider') featureSlider: ElementRef
  @ViewChild('scrollable') scrollable: ElementRef
  private latestScroll: number = 0;
  private posterListWidth: number;

  private featureSliderNum: number;
  private features: any[];
  private stars: number[] = [1,2,3,4,5];

  private lazyLoad;

  private latests:any[];
  constructor(public injector: Injector, private el: ElementRef, private ngZone: NgZone, private request: RequestService) {
    super(injector);
    this.latests = [];
    this.features = [];
    this.featureSliderNum = 0;
    this.lazyLoad = new LazyLoadImage(this.ngZone, this.el)
  }

  ngOnInit() {
      this.request.requestMovie("","").subscribe(medias=>{
        for(let media of medias){
          this.latests.push(this.calculatemeta(media));
        }
          //console.log(medias);
          this.divLatest(latest=>{
            for(let d of latest){
              this.scroll().filter(divs=>divs.div ==='latest' ? true: false).startWith('').let(this.lazyLoad.lazyLoadImage(d,d.attributes['data-src'].nodeValue,"","",100)).subscribe(res=>{
                console.log('show');
              })
            }
          });
          
          this.divPopular(pop=>{
            pop.forEach(d=>{
              this.scroll().filter(divs=>divs.div === 'popularity' ? true : false).startWith('').let(this.lazyLoad.lazyLoadImage(d,d.attributes['data-src'].nodeValue,"","",100)).subscribe(res=>{
                console.log('show_pop');
              })
            })
          });
        }, err=>{
          console.log(err);
  		});
      
      this.request.getFeatures().subscribe(feats=>{
        for(let feat of feats){
          this.features.push(this.calculatemeta(feat));
        }
        this.featuresAutoScroll(); // init Auto Slide Show Rotation
      })

      
  }

  ngAfterViewInit() {
    let lastScrollTop = 0;
    Observable.fromEvent(this.scrollable.nativeElement, 'scroll').debounceTime(400).subscribe(scroll=>{
      let st = this.scrollable.nativeElement.scrollTop;
      if (st > lastScrollTop){
          // downscroll code
          console.log('scroll');
          this.scroll('popularity');
      } else {
          // upscroll code
      }
      lastScrollTop = st;
    });
    this.changeSize();
    window.onresize = (e) =>
		{
			//ngZone.run will help to run change detection
			this.ngZone.run(() => {
					this.changeSize();
			});
		};
  }
  scroll1 = new Subject<object>();
  scroll(e?): Observable<any>{
    //let scroll = new Subject();
    if(e) this.scroll1.next({div:e});
    console.log('click')
    return this.scroll1.asObservable();
  }

  divLatest(cb){
    console.log(document.getElementById("latest"))
    setTimeout(()=>{
      let latestDiv = document.getElementById("latest").querySelectorAll('div.poster-wrapper')   
      console.log(latestDiv);
      return cb(latestDiv);
    },1000)    
  }

  divPopular(cb){
    setTimeout(()=>{
      let latestDiv = document.getElementById("popularity").querySelectorAll('div.poster-wrapper')   
      console.log(latestDiv);
      return cb(latestDiv);
    },1000)    
  }

  changeSize(){
    let width = window.innerWidth;
    this.featureSlider.nativeElement.style.transform = `translateX(-${this.featureSliderNum * (width-15)}px)`;
    if(width >= 1200){
      this.posterListWidth = (window.innerWidth -96- 32) / 8;
    }else if(width >= 992){
      this.posterListWidth = (window.innerWidth -72 - 32) / 6;
    }else if(width >=768){
      this.posterListWidth = (window.innerWidth -60 - 32) / 5;
    }
    if(this.posterListWidth < 150) this.posterListWidth = 150;
  }

  featuresAutoScroll(){
    let timer = setTimeout(()=>{
      this.featurescrollRight();
      this.featuresAutoScroll();
    },8000)
  }
  featurescrollRight(){
    this.featureSliderNum++;
    if(this.featureSliderNum >= this.features.length){
      this.featureSliderNum = 0;
    }
    this.featureSlider.nativeElement.style.transform = `translateX(-${this.featureSliderNum * (window.innerWidth-15)}px)`;
  }
  featurescrollLeft(){
    this.featureSliderNum--;
    this.featureSlider.nativeElement.style.transform = `translateX(-${this.featureSliderNum * (window.innerWidth-15)}px)`;
  }
  scrollRight(elementid:string){
    let scrollEl = document.getElementById(elementid);
    //let style = window.getComputedStyle(scrollEl);
    //let matrix = new WebKitCSSMatrix(style.webkitTransform);
    let currentScroll:any = (scrollEl.style.transform) ? -scrollEl.style.transform.replace(/[^0-9.]/g, '') : 0;//matrix.m41
    console.log(currentScroll);
    scrollEl.style.transform = `translateX(${currentScroll - window.innerWidth +32}px)`;
    setTimeout(()=>{
      this.scroll(elementid);
    },800)
  } 

  scrollLeft(elementid:string){
    let scrollEl = document.getElementById(elementid);
    let style = window.getComputedStyle(scrollEl);
    let matrix = new WebKitCSSMatrix(style.webkitTransform);
    let currentScroll:any = matrix.m41
    if(currentScroll >= 0) return;
    if(currentScroll + window.innerWidth >= 0) return scrollEl.style.transform = `translateX(0px)`;
    scrollEl.style.transform = `translateX(${currentScroll + window.innerWidth - 32}px)`;
  } 

}
