export const OPEN_SIDE_NAV = "OPEN_SIDE_NAV";
export const CLOSE_SIDE_NAV = "CLOSE_SIDE_NAV";
export const TOGGLE_SIDE_NAV = "TOGGLE_SIDE_NAV";

export const SET_RESULTS = 'HOME_STORE_RESULTS';
export const DELETE_FROM_RESULTS = 'HOME_DELETE_FROM_RESULTS'
export const ADD_TO_FEATURE = 'HOME_STORE_RESULTS_ADD_TO_FEATURE';
export const SET_TOTAL_ITEMS = 'HOME_SET_TOTAL_ITEMS';
export const SET_CURRENT_PAGE = 'HOME_SET_CURRENT_PAGE';
export const SET_PAGINATION = 'HOME_SET_PAGINATION';

export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';

export const UI_ACTIONS = {
    OPEN_CARTLIST : 'OPEN_CART_LIST',
    CLOSE_CARTLIST : 'CLOSE_CART_LIST',
    TOGGLE_CARTLIST : 'TOGGLE_CART_LIST'
}


export interface AppState {
    sidenav : any,
    home_media : any,
    pagination : any,
    cart : any,
    ui : any
}

export interface IUiState {
    cartlistOpen : boolean
}

export interface SideNav {
    close : boolean
}

export interface IHomepage {
    results : Array<any>,
    current_page : number,
    total_items : number,
    loaded : boolean
}

export interface IPagination {
    pagination : any
}

interface CartItem {
    _id : string
    filename : string,
    poster : string,
    hash : string
}

export interface ICart {
    items : CartItem[],
    total_size : number,
    total_price : number
}

export const getSidenavState = (state: AppState) => state.sidenav;

export const getPaginationState = (state: AppState) => state.pagination;

export const getCartState = (state: AppState) => state.cart;

export const getUiState = (state: AppState) => state.ui;