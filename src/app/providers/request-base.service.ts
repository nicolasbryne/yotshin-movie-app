/*import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, RequestOptionsArgs, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';*/

export abstract class RequestBase {
    public SERVER_URL = "http://localhost:3000/api";
    public TMDB_URL = "https://api.themoviedb.org/3";
    public TMDB_KEY = "06ce019263a2716bce250a7a6624e935";
}