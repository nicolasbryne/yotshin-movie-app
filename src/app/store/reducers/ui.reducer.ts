import { UI_ACTIONS as fromUI, IUiState }  from '../actions'

const initialState: IUiState = {
    cartlistOpen : false
}

export function uiReducer(state: IUiState = initialState, action) : IUiState {
    switch(action.type){
        case fromUI.TOGGLE_CARTLIST:
            return Object.assign({}, state, {
                cartlistOpen : !state.cartlistOpen
            })
        case fromUI.CLOSE_CARTLIST:
            return Object.assign({}, state, {
                cartlistOpen : false
            })
        default:
            return state;
    }
}