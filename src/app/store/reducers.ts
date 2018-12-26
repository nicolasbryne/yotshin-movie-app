import { combineReducers, ActionReducer } from '@ngrx/store'
import { AppState } from './actions'
import { sidenavReducer } from './reducers/sidenav.reducer'
import { homepageReducer, paginationReducer } from './reducers/homepage.reducer'
import { cartReducer } from './reducers/cart.reducer'
import { uiReducer } from './reducers/ui.reducer'
/*const reducers:ActionReducer<AppState> = combineReducers({
    sidenav: sidenavReducer,
    home_media :  homepageReducer,
    pagination : paginationReducer
})*/

export const Reducers:AppState = {
    sidenav: sidenavReducer,
    home_media :  homepageReducer,
    pagination : paginationReducer,
    cart : cartReducer,
    ui : uiReducer
}

/*export function Reducers(state, action) {
    return reducers(state, action)
}*/