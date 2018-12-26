import { Component, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Renderer2, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/filter';

export interface Pos {
    top: number,
    left: number
}

export interface State {
    context : {
        open : boolean,
        hidden : boolean
    },

    addtocollection : {
        open : boolean
    } 
}

@Component({
  selector: 'context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css'],
  //changeDetection : ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'handleClick($event)' }
        
})
export class ContextMenuComponent {
    @ViewChild('context') context: ElementRef;
    @ViewChild('contextmenu') contextmenu: ElementRef;
    @Input('trackElement') trackElement;
    @Input('scrollElement') scrollElement: ElementRef;
    @Input('scrollStream') scrollStream: Observable<any>;
    @Input('mediaid') mediaid: string;

    @Output('action') action: EventEmitter<object> = new EventEmitter<object>();
    @Output('done') done: EventEmitter<object> = new EventEmitter<object>();

    private state: State;
    public addtocollection: boolean = false;
    public scrollStream$;

    constructor(private cd:ChangeDetectorRef, private el: ElementRef, private renderer: Renderer2, private ngZone: NgZone) {
        this.state = {
            context: { open : false, hidden: false },
            addtocollection : { open : false }
        }
    }
    ngAfterViewInit() {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        this.openUp();
    }

    handleClick(event) {
        console.log('CLICK');
        console.log(this.state)
        if(this.el.nativeElement.contains(event.target)) console.log("INSIDE")
        else {
            console.log("OUTSIDE")
            if(this.state.context.open === true){
                console.log('STATE OPEN')
                this.close();
            } 
        }
    }

    openUp() {
        
        let initialPos: Pos;
        if(this.trackElement) initialPos = this.getCoords(this.trackElement)
        else initialPos = { top: 0, left :0}
		if(initialPos.left + 150 > window.innerWidth - 64) this.renderer.setStyle(this.context.nativeElement, 'transform', `translateX(${window.innerWidth - 64 - 170}px) translateY(${initialPos.top + 16}px)`);
		else this.renderer.setStyle(this.context.nativeElement, 'transform', `translateX(${initialPos.left - 10}px) translateY(${initialPos.top + 16}px)`);
        this.renderer.addClass(this.context.nativeElement, 'show');
        this.renderer.addClass(this.contextmenu.nativeElement, 'show');

        this.ngZone.runOutsideAngular(()=>{
			this.scrollStream$ = this.scrollStream.subscribe( e => {
                let initialPos: Pos
                if(this.trackElement) initialPos = this.getCoords(this.trackElement)
                if(initialPos.left + 150 > window.innerWidth- 64) this.renderer.setStyle(this.context.nativeElement, 'transform', `translateX(${window.innerWidth- 64 - 170}px) translateY(${initialPos.top + 16}px)`);
		        else this.renderer.setStyle(this.context.nativeElement, 'transform', `translateX(${initialPos.left - 10}px) translateY(${initialPos.top + 16}px)`);
            })
		})
        setTimeout( () => {
            this.state = Object.assign({}, this.state, {
                context : { open : true, hidden : false }
            })
        },10)

    }

    actionHandler(action){
        switch(action){
            case 'ADD_TO_COLLECTION':
                this.close();
                this.action.emit({action : 'ADD_TO_COLLECTION', _id : this.mediaid})
                return
            case 'EDIT':
                this.close();
                this.action.emit({action : 'EDIT', _id : this.mediaid})
                return
            case 'DELETE':
                this.close();
                this.action.emit({action : 'DELETE', _id : this.mediaid})
        }
    }

    addtoCollection() {
        console.log("ADD TO COLLECTION")
        /*this.renderer.removeClass(this.context.nativeElement, 'show');
        this.renderer.removeClass(this.contextmenu.nativeElement, 'show');
        setTimeout( () => { 
            this.state = Object.assign({}, this.state, {
                context : { open : true, hidden : true },
                addtocollection : { open : true }
            })
        }, 10)*/
        //this.cd.detectChanges();
        this.close();
        this.action.emit({action : 'ADD_TO_COLLECTION', _id : this.mediaid})
    }

    addtoCollectionClose(){
        this.state = Object.assign({}, this.state, {
            addtocollection : { open : false }
        })

        this.close();
    }

    close() {
        this.renderer.removeClass(this.context.nativeElement, 'show');
        this.renderer.removeClass(this.contextmenu.nativeElement, 'show');
        this.done.emit({
            close : true
        })
    }

    getCoords(elem){ // crossbrowser version
        const box = elem.getBoundingClientRect();

        const body = document.body;
        const docEl = document.documentElement;

        const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        const clientTop = docEl.clientTop || body.clientTop || 0;
        const clientLeft = docEl.clientLeft || body.clientLeft || 0;

        const top  = box.top +  scrollTop - clientTop;
        const left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left) };
    }

    ngOnDestroy() {
        this.scrollStream$.unsubscribe()
    }
}