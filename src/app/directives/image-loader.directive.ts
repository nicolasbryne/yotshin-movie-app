import { Directive, OnInit, Input, ElementRef, Renderer2, NgZone} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

@Directive({
  selector: '[imageloader]',
})
export class ImageLoaderDirective implements OnInit {

  @Input('source') img_src:string;

  constructor(private zone: NgZone, private el: ElementRef, private renderer: Renderer2) { }


  ngOnInit() {

    this.zone.runOutsideAngular(() => {
        let scrollStream = Observable.fromEvent(window, 'scroll')

        scrollStream.startWith('').debounceTime(100).let(this.lazyLoadImage(this.el.nativeElement, this.img_src, '', '', 100)).subscribe(e => {
            console.log('Image Lazy Loading');
        })
    })   
  }

  lazyLoadImage(image: HTMLElement, imagePath: string, defaultImagePath: string, errorImgPath: string, offset: number) {
        
        if (defaultImagePath) {
            this.setImage(image, defaultImagePath);
        }
        return (scrollObservable: Observable<Event>) => {
           
            return scrollObservable
                .filter(() => this.isVisible(image))
                .take(1)
                .mergeMap(() => this.loadImage(imagePath))
                .do((resp:string) => {
                    
                    return this.setImage(image, imagePath)
                })
                .catch(() => {
                    
                    if (errorImgPath) {
                        this.setImage(image, errorImgPath);
                    }
                    /*image.className += ' ng-failed-lazyloaded';*/
                    image.classList.add('ng-error-lazyloaded');
                    return Observable.of(1);
                })
                .do(() => this.setLoadedStyle(image));
        };
    }

    isVisible(element: HTMLElement, threshold = 100, _window = window) {
            
            const rect = element.getBoundingClientRect();
            // Is the element in viewport but larger then viewport itself
            const elementLargerThenViewport = rect.top <= threshold && rect.bottom >= -threshold;
            // Is the top of the element in the viewport
            const topInsideViewport = rect.top >= 0 && rect.top <= _window.innerHeight;
            // Is the bottom of the element in the viewport
            const belowInsideViewport = rect.bottom >= 0 && rect.bottom <= _window.innerHeight;
            // Is the right side of the element in the viewport
            const rightsideInViewport = rect.right >= -threshold && (rect.right - threshold) <= _window.innerWidth;
            // Is the left side of the element is the viewport
            const leftsideInViewport = rect.left >= -threshold && (rect.left - threshold) <= _window.innerWidth;

            return (
                elementLargerThenViewport ||
                ((topInsideViewport || belowInsideViewport) &&
                (rightsideInViewport || leftsideInViewport))
            );
    }

    loadImage(imagePath: string): Observable<string> {
        return Observable
            .create(observer => {
                const img = new Image();
                console.log( new Date().getSeconds() + 'Image loading...')
                img.src = imagePath;
                img.onload = () => {
                    observer.next(imagePath);
                    observer.complete();
                };
                img.onerror = err => {
                    observer.error(null);
                };
            });
    }

    setImage(element: HTMLElement, imagePath: string) {
        const isImgNode = element.nodeName.toLowerCase() === 'img';
        if (isImgNode) {
            (<HTMLImageElement>element).src = imagePath;
        } else {
            /*element.removeAttribute("data-src");*/
            this.renderer.setStyle(element, 'background-image', `url('${imagePath}')`)
            //element.style.backgroundImage = `url('${imagePath}')`;
        }
        return element;
    }

    setLoadedStyle(element: HTMLElement) {
        //element.classList.add('ng-lazyloaded');
        this.renderer.addClass(element, 'ng-lazyloaded')
        return element;
    }

}
