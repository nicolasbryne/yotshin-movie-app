import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, RequestOptionsArgs, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

import { RequestBase } from './request-base.service';

@Injectable()
export class MediaRequest extends RequestBase {

    public media_url = this.SERVER_URL+'/media';

    constructor(private http: Http) {
        super();
    }

    getAllMedia(skip:number, limit:number=10) {
        const query = `?skip=${skip}&limit=${limit}`;
        return this.http.get(this.media_url+query).timeout(10000).map(res => res.json());
    }

    getMediaDetail(_id:string) {
        const url = this.media_url+`/detail/${_id}`;
        return this.http.get(url).timeout(10000).map(res => res.json())
    }
}