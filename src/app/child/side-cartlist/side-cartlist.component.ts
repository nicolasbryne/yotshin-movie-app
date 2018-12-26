import { Component, Directive ,OnInit, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { ICart } from '../../store/actions'

@Component({
  selector: 'side-cartlist',
  templateUrl: './side-cartlist.component.html',
  styleUrls: ['./side-cartlist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideCartListComponent implements OnInit{
    @Input('cartState') cartState: object;
    @Input('show') show: boolean

    @Output('action') action:EventEmitter<object> = new EventEmitter<object>();
    @Output('hidden') hidden: EventEmitter<void> = new EventEmitter<void>();

    ngOnInit(){

    }

    removefromCart(_id:string, price: number) {
        console.log(_id);
        this.action.emit({
            type : 'REMOVE_FROM_CART',
            _id : _id,
            price : price
        });
    }

    slideOut(){
        this.hidden.emit();
    }
}