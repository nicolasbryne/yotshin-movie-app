import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, RequestOptionsArgs, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';


const config = {
   TMDB_KEY : "06ce019263a2716bce250a7a6624e935",
   tmdbapi : "https://api.themoviedb.org/3",
   api : "http://localhost:3000/api"
}

@Injectable()
export class RequestService{

  private TMDB_KEY = config.TMDB_KEY;
  private tmdbapi = config.tmdbapi;
  private api = config.api;
  private movieapi = this.api+"/movie";
  private seriesApi = this.api+"/series";
  private settingapi = this.api+"/operation"
  private libraryapi = this.api+"/library"
  private collectionapi = this.api+"/collection"
  private serviceapi = this.api+"/service"

  private headerForm = new Headers({
     'Content-Type': 'application/x-www-form-urlencoded'
  });

  private headerJson = new Headers({
     'Content-Type': 'application/json'
  });
  private header = {
    form : new RequestOptions({
                   headers: this.headerForm
                 }),
    json      : new RequestOptions({
                   headers: this.headerJson
                }),
  }


  constructor(private http: Http ) { 
  }

  testSocket(id:string){
    return this.http.get("http://localhost:3000/api/movie/socket/test/"+id);
  }

  getmediainfo(id:string){
    let reqapi = this.movieapi+"/mediainfo/"+id;
    return this.http.get(reqapi).timeout(10000).map(res=>res.json());
  }

  getmoviebyId(id:string, query?:string){
    let fields = query ? `?fields=${query}` : '';
    let reqapi = this.movieapi+"/"+id+fields;
    return this.http.get(reqapi).map(res=>res.json());
  }
  updateMovie(id:string, formdata:any){
    let reqapi = (formdata.type === 1) ? this.movieapi+"/"+id : this.seriesApi+"/"+id;
    return this.http.put(reqapi, formdata, this.header.json);
  }
  deletemoviebyId(id:string){
    let reqapi = this.movieapi+"/"+id;
    return this.http.delete(reqapi).map(res=>res.json());
  }

  fetchmovieImdb(imdbid:string){
    let reqapi = this.api+"/movie/imdb/"+imdbid;
    return this.http.get(reqapi).timeout(10000).map(res=>res.json());
  }
  fetchmovieTmdb(tmdbid:string){
    let reqapi = this.api+"/movie/tmdb/"+tmdbid;
    return this.http.get(reqapi).timeout(10000).map(res=>res.json());
  }
  getmovieTmdb(tmdbid:string){
    let reqapi = this.api+"/movie/tmdb/"+tmdbid+"?save=1";
    return this.http.get(reqapi).timeout(10000).map(res=>res.json());
  }

  getmoviePending(id:string=""){
    let reqapi = this.movieapi+"/pending/"+id;
    return this.http.get(reqapi).map(res=>res.json());
  }

  confirmmoviePending(id:string, choose:number){
    let reqapi = this.movieapi+"/pending/"+id;
    var body="choose="+choose;
    return this.http.patch(reqapi, body, this.header.form).map(res=>res.json());
  }

  requestMovie(status="", sort="_id"){
  	let query = `?status=&sortby=${sort}`
  	let reqapi = this.movieapi+query;
  	return this.http.get(reqapi).map(res=>res.json());
  }

  requestMovieByLibrary(id){
    let reqapi = this.movieapi+'/library/'+id;
    return this.http.get(reqapi).map(res=>res.json());
  }

  getFeatures(){
    let reqapi = this.movieapi+'/features';
    return this.http.get(reqapi).map(res=>res.json());
  }

  requestMoviecount(status: number = null){
  	let query = "?status="+status;
  	let reqapi =  `${this.movieapi}/count${query}`;
  	return this.http.get(reqapi).map(res=>res.json());
  }

  addtoFeature(id:string, type:string='movie'){
    let reqapi = `${this.movieapi}/features/${id}`;
    return this.http.patch(reqapi, this.header.form).map(res=>res.json());
  }
  removefromFeature(id:string, type:string='movie'){
    let reqapi = `${this.movieapi}/features/${id}`;
    return this.http.delete(reqapi).map(res=>res.json());
  }

  requestLibraryDetail(id:string){
    let reqapi = `${this.libraryapi}/${id}`;
    return this.http.get(reqapi).map(res=>res.json());
  }
  requestLibraryFolder(libid:number){
  	let reqapi = `${this.libraryapi}/${libid}/source`;
  	return this.http.get(reqapi).map(res=>res.json());
  }

  requestLibrarylist(type: string=""){
    let reqapi = `${this.settingapi}/library/list/${type}`;
    return this.http.get(reqapi).map(res=>res.json());
  }

  addtoLibrary(type: string = "movie", dir: string, lib: string = null){
    let typenum;
    if(type == 'movie') typenum = 1
    else typenum = 2;
  	let reqapi = `${this.libraryapi}/${lib}/${typenum}/${dir}`;
  	//let body = "dir="+dir;
  	return this.http.put(reqapi, this.header.form).map(res=>res.json());
  }

  removefromLibrary(type:string="movie", dir:string, libid:string){
    dir = encodeURIComponent(dir);
    console.log(dir);
    let reqapi = `${this.libraryapi}/${type}/${libid}/${dir}`;
    return this.http.delete(reqapi).map(res=>res.json());
  }

  /*updateLibrary(type:string = "movie", lib:string = null){
    let reqapi = `${this.settingapi}/library/reload/${type}?option=recent`;
    let body = "lib="+lib;
    return this.http.post(reqapi, body, this.header.form).map(res=>res.json());
  }*/

  updateLibrary(type:string, libid:number){
    let reqapi = `${this.libraryapi}/${type}/${libid}/update`;
    return this.http.put(reqapi,this.header.form).map(res=>res.json());
  }

  reloadLibrary(type:string, libid:number){
    let typenum;
    if(type == 'movie') typenum = 1
    else typenum = 2;
    let reqapi = `${this.libraryapi}/${typenum}/${libid}/reload`;
    return this.http.post(reqapi, null, this.header.json).map(res=>res.json());
  }

  createLibrary(formdata: any){
    let reqapi = `${this.libraryapi}/create`;
    return this.http.post(reqapi, formdata, this.header.json).map(res=>res.json());
  }

  browseFolder(encode?:string){
    var encodeFolder;
    encode? encodeFolder = encode : encodeFolder = ''
    let reqapi = `${this.libraryapi}/services/${encodeFolder}`;
    return this.http.get(reqapi).map(res=>res.json());
  }

  getCollections(){
    let reqapi = this.collectionapi;
    return this.http.get(reqapi).map(res=>res.json());
  }

  createCollection(colname:string){
    let reqapi = `${this.collectionapi}/${colname}`;
    return this.http.post(reqapi, this.header.form).map(res=>res.json());
  }

  addtoCollection(collectionid:number, mediaid:string, type:string){
    let reqapi = `${this.collectionapi}/${collectionid}/${type}/${mediaid}`;
    return this.http.post(reqapi, this.header.form).map(res=>res.json());
  }

  searchTerm(term:string){
    let reqapi = `${this.movieapi}/search/${term}`;
    return this.http.get(reqapi).map(res=>res.json());
  }

  getDriveInfo(path:string){
    let reqapi = `${this.serviceapi}/disk/${path}`;
    return this.http.get(reqapi).map(res=>res.json());
  }

}

@Injectable()
export class SettingService{

  private settingApi = config.api+'/setting/';

  constructor(private http: Http ) { 
  }

  downloadCheck(){
    let reqapi = `${this.settingApi}/poster/check`;
    return this.http.get(reqapi).map(res=>res.json());
  }
  extendCheck(){
    let reqapi = `${this.settingApi}/extend/check`;
    return this.http.get(reqapi).map(res=>res.json());
  }

}
