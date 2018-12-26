import { ADD_TO_CART, REMOVE_FROM_CART, ICart } from '../actions'

const initialState: ICart = {
    items : [],
    total_size : 0,
    total_price : 0
}

export function cartReducer(state:ICart = initialState, action): ICart {
    switch(action.type) {
        case ADD_TO_CART:

            /* If item has been added to cart already, return old state (check with _id) */
            if(state.items.filter( item => item._id === action.item._id).length !== 0) return state;

            /* Else, add new item to cart and return new state */
            return Object.assign({}, state, {
                items : [...state.items, {
                    _id : action.item._id,
                    filename : action.item.filename,
                    filepath : action.item.filepath,
                    poster : action.item.poster,
                    hash : action.item.hash,
                    isCopying : false,
                    isCopied : false
                }],
                total_price : state.total_price + (action.item.price || 300)
            })
            
        case REMOVE_FROM_CART:
            return Object.assign({}, state, {
                items : [...state.items.filter( item => item._id !== action._id)],
                total_price : state.total_price - (action.price || 300)
            })
        default:
            return state;
    }
}