import { SET_RESULTS, ADD_TO_FEATURE, DELETE_FROM_RESULTS, 
    SET_CURRENT_PAGE, SET_TOTAL_ITEMS, SET_PAGINATION, 
    IHomepage, IPagination 
} from '../actions';

const initialState: IHomepage = {
    results : [],
    total_items : 0,
    current_page : 1,
    loaded : false
}

export function homepageReducer(state = initialState, action): IHomepage {
    switch(action.type) {
        case SET_RESULTS:
            return Object.assign({}, state, {
                results : [...action.results],
                loaded : true
            })

        case ADD_TO_FEATURE:
            return Object.assign({}, state, { 
                results : state.results.map( res => {
                    if(res._id === action._id) {
                        /*return Object.assign({}, res, {
                            feature : true
                        })*/
                        res.feature = true
                    }
                    return res;
                })
            })

        case DELETE_FROM_RESULTS:
            return Object.assign({}, state, {
                results : [...state.results.filter( res => res._id !== action._id)]
            })
        
        case SET_CURRENT_PAGE:
            return Object.assign({}, state, {
                current_page : action.current_page
            })
        
        case SET_TOTAL_ITEMS:
            return Object.assign({}, state, {
                total_items : action.total_items
            })
        /*case SET_PAGINATION:
            return Object.assign({}, state, {
                pagination : Object.assign({}, action.pagination)
            })*/
        default: 
            return state;
    }
}

export function paginationReducer(state = {}, action) {
    switch(action.type){
        case SET_PAGINATION:
            return Object.assign({}, state, {...action.pagination, pages : [...action.pagination.pages]})
        default: 
            return state;
    }
}