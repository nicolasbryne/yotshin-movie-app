import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

export class LazyLoadImage {

    constructor(private ngZone, private el){

    }

    lazyLoadImage(image: HTMLElement, imagePath: string, defaultImagePath: string, errorImgPath: string, offset: number) {
        /*console.log(imagePath)
        console.log(this.isVisible(image));*/
        if (defaultImagePath) {
            this.setImage(image, defaultImagePath);
        }
        return (scrollObservable: Observable<Event>) => {
            return scrollObservable
                .filter(() => this.isVisible(image))
                .take(1)
                .mergeMap(() => this.loadImage(imagePath))
                .do(() => this.setImage(image, imagePath))
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

    getposterDiv():Observable<any>{
		return Observable.create(observer=>{
            this.ngZone.runOutsideAngular(() => {
                setTimeout(()=>{
                    //console.log(this.el.nativeElement.querySelectorAll('div.poster-wrapper'));
                    observer.next(this.el.nativeElement.querySelectorAll('div.poster-wrapper'));
                    //this.imageProcess(this.el.nativeElement.querySelectorAll('div.poster-wrapper'));
                },10)
            });
        });
	}

	/*imageProcess(elements:Array<any>){
		if(!elements.length){
			console.log('no');
			return
		}
		for(let element of elements){
			
			loadImage(element.attributes['data-src'].nodeValue).subscribe(resp=>{
					setImage(element, resp);
					element.classList.add('ng-lazyloaded');
			})
		}
		
    }*/
	loadImage(imagePath: string): Observable<string> {
        return Observable
            .create(observer => {
                const img = new Image();
                img.src = imagePath;
                img.onload = () => {
                    observer.next(imagePath);
                    //console.log(imagePath)
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
            element.style.backgroundImage = `url('${imagePath}')`;
        }
        return element;
    }

    setLoadedStyle(element: HTMLElement) {
        element.classList.add('ng-lazyloaded');
        return element;
    }
    isVisible(element: HTMLElement, threshold = 100, _window = window) {
        /*console.log("check visible");*/
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
}

