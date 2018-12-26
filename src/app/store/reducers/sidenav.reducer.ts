import { OPEN_SIDE_NAV, CLOSE_SIDE_NAV, TOGGLE_SIDE_NAV, SideNav, AppState } from '../actions'

export function sidenavReducer( state = { close : true }, action ): SideNav {
    switch(action.type) {
        case OPEN_SIDE_NAV:
            return Object.assign({}, {
                close : false
            })

        case CLOSE_SIDE_NAV:
            return Object.assign( {}, {
                close : true
            })

        case TOGGLE_SIDE_NAV: {
            return Object.assign({}, {
                close : !state.close
            })
        }

        default:
            return state;
    }
}