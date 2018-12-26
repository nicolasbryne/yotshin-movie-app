import { Component, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser'
import * as moment from 'moment';

export abstract class BaseComponent {

  public base = "http://localhost:4200";
  public image_path = "http://localhost:3000/images"

  public localimagepath: string = 'http://localhost:3000/images/'
  public backdropprefix: string = "http://image.tmdb.org/t/p/original";
	public posterprefix: String = "https://image.tmdb.org/t/p/w500";
  public noposter: String = "http://www.christophergrantharvey.com/uploads/4/3/2/3/4323645/movie-poster-coming-soon_1_orig.png";

  private location: Location;
  public sanitizer: DomSanitizer;

  public movie_genres: Array<any> = [
    {
      "id": 28,
      "name": "Action"
    },
    {
      "id": 12,
      "name": "Adventure"
    },
    {
      "id": 16,
      "name": "Animation"
    },
    {
      "id": 35,
      "name": "Comedy"
    },
    {
      "id": 80,
      "name": "Crime"
    },
    {
      "id": 99,
      "name": "Documentary"
    },
    {
      "id": 18,
      "name": "Drama"
    },
    {
      "id": 10751,
      "name": "Family"
    },
    {
      "id": 14,
      "name": "Fantasy"
    },
    {
      "id": 36,
      "name": "History"
    },
    {
      "id": 27,
      "name": "Horror"
    },
    {
      "id": 10402,
      "name": "Music"
    },
    {
      "id": 9648,
      "name": "Mystery"
    },
    {
      "id": 10749,
      "name": "Romance"
    },
    {
      "id": 878,
      "name": "Science Fiction"
    },
    {
      "id": 10770,
      "name": "TV Movie"
    },
    {
      "id": 53,
      "name": "Thriller"
    },
    {
      "id": 10752,
      "name": "War"
    },
    {
      "id": 37,
      "name": "Western"
    }
  ]

  public audioicon: Object = {
    'AC-3' : `${this.base}/assets/dolbydigital.png`,
    'AAC' : `${this.base}/assets/aac.png`,
    'DTS' : `${this.base}/assets/dts.png`,
    '6'   : `${this.base}/assets/5.1ch.png`,
    '2'   : `${this.base}/assets/2.0ch.png`
  }

  public audioinfo: Object = {
    '2' : 'Stereo',
    '6' : '5.1',
    '8' : '7.1',
  }

  public videoicon: Object = {
    'sd' : `${this.base}/assets/sd.png`,
    '576p' : `${this.base}/assets/576p.png`,
    '720p' : `${this.base}/assets/720p.png`,
    '1080p' : `${this.base}/assets/1080p.png`,
  }

  constructor(public injector: Injector) { 
    console.log("INIT INIT")
    this.location = injector.get(Location);
    this.sanitizer = injector.get(DomSanitizer);
  }

  back() {
      console.log("back click");
      this.location.back();
  }

  resolution(width:number, height:number){
      if(width <= 720) return 'sd';
      if(width > 720 && width < 900) return '576p'
      if(width > 900 && width < 1300) return '720p';
      if(width > 1300 && width <=1920) return '1080p'
  }

  datetoYear(date: any){
  	if(!date) return " - ";
  	return new Date(date).getFullYear();
  }

  formatDate(date: Date){
    if(!date) return "unknown";
    //var d = new Date(date);
    //var dateBuild:String = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}`;
    var datestring = moment(date).format("YYYY-MM-DD");
    return datestring;
  }

  formatKb(bytes,decimals=2) {
	   	if(bytes == 0) return '0 Bytes';
	   	bytes = bytes * 1000;
	   	var k = 1000,
	       dm = decimals || 2,
	       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
	       i = Math.floor(Math.log(bytes) / Math.log(k));
	   		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

  postersensitize(url){
  		if(!url) return this.sanitizer.bypassSecurityTrustStyle('url('+this.noposter+')');
  		return this.sanitizer.bypassSecurityTrustStyle('url('+this.posterprefix+url+')');
  }

  backdropsanitizer(url){
    if(!url) return undefined;
    return this.sanitizer.bypassSecurityTrustStyle('url('+this.backdropprefix+url+')');

  }

  calculatemeta(dataInfo){
    var data = dataInfo;
    //data['releasedYear'] = this.datetoYear(data.releasedDate);
    //data['releasedDate'] = this.formatDate(data.releasedDate);
    //if(data.filesize) data['filesizeFormat'] = this.formatKb(data.filesize);
    /*if(data.backdropURL) data['backdrop'] = this.backdropsanitizer(data.backdropURL);
    else data['backdrop'] = this.sanitizer.bypassSecurityTrustStyle('url('+this.localimagepath+this.pathFromID(dataInfo._id)+'/Poster.jpg)');*/
    /*if(data.posterURL){ 
      data['poster'] = this.postersensitize(data.posterURL);
      data['posterURL'] = this.posterprefix+data.posterURL;
    }else{
      data['poster'] = this.sanitizer.bypassSecurityTrustStyle('url('+this.localimagepath+this.pathFromID(dataInfo._id)+'/Poster.jpg)');
      data['posterURL'] = this.localimagepath+this.pathFromID(dataInfo._id)+'/Poster.jpg';
    }*/
    data.poster = data.posterLocal ? this.image_path+data.posterLocal : this.posterprefix+data.posterURL;
    data.backdrop = data.backdropLocal ? this.image_path+data.backdropLocal : this.backdropprefix+data.backdropURL;
    if(data.imdbID) data['imdbid'] = parseInt(data.imdbID.replace(/[^0-9\.]/g, ''), 10);
    console.log(data);
    return data;
  }

  genrename(ids: Array<Number>){
    var genres = [];
    if(!ids || !ids.length) return 'unknown';
    for(let genre of this.movie_genres){
      for(let id of ids){
        if(genre.id == id) genres.push(genre.name); 
      }
    }
    return genres.join(", ");
  }

  pathFromID(id){
    var a = id;
    var b = '/';
    var position = 23;
    var splitpath = [a.slice(position), b, a.slice(0, position)].join('');
    return splitpath;
  }

}
