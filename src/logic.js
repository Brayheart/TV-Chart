import axios from 'axios';
import jsonp from 'jsonp';
import config from './firebaseConfig';

var firebase = require("firebase");
firebase.initializeApp(config);
var database = firebase.database();

const omdbPrefix= "https://www.omdbapi.com/";

export function updateRatings(series, component){
  if(series === undefined)
    return;
  component.setState({loading:true, disabled: true});
  database.ref('/'+series.toLowerCase()).once('value').then(snap =>{
    if(!snap.exists()){
      getRatingsFromOMDB(series, component);
      return;
    }
    var data=snap.val();
    component.props.updateMethod(data.title, data.seasons);
    component.setState({loading:false, disabled: false});
  });
}

function getRatingsFromOMDB(series, component){
    var url=omdbPrefix+"?t="+series+"&type=series&apikey="+process.env.REACT_APP_OMDB_KEY;
    jsonp(url, null, (function (err, data) {
      if (err) {
        component.setState({
        disabled:false,
        error: true,
        loading:false,
        errorMsg: "Can't access the server. Please try again later."
      });
          return;
      } else {
       if(data.Title===undefined || data.totalSeasons== "N/A"){   
            component.setState({
            disabled:false,
            error: true,
            loading:false,
            errorMsg: "Sorry, couldn't find that series :("
          });        
          return;
        }
        getSeasons(data.Title, parseInt(data.totalSeasons), component);
      }
    }));
  }

function getSeasons(series,numOfSeasons, component){
    const seasons=[];
    var promises=[];
    for(var i=1;i<=numOfSeasons;i++){
        (function(i){
        var url=omdbPrefix+"?t="+series+"&Season="+i+"&apikey="+process.env.REACT_APP_OMDB_KEY;
        var getSeasonEpisodes=axios.get(url).then(result=>{
          seasons[i-1]=getEpisodesRatings(result.data, i);
          //console.log("season "+i+" rating: "+seasons[i-1]);
        },error=>{
          //deal with error.
        });
        promises.push(getSeasonEpisodes);
      })(i);

    }
    Promise.all(promises).then(results=>{
      component.setState({disabled:false, loading:false});
      var data={title:series ,seasons};
      addSeriesToFirebase(series.toLowerCase(), data);
      component.props.updateMethod(series, seasons);
      window.history.pushState({}, series+" Ratings", "/"+series);
      
    },error=>{
        component.setState({
        disabled:false,
        error: true,
        loading:false,
        errorMsg: "Can't access the server. Please try again later."
      });
        return;
    });
  }

function getEpisodesRatings(data, seasonNum){
    var ratings=[];
    var episodes=data.Episodes;
    for(var i=1;i<=episodes.length;i++){
      var rating=parseFloat(episodes[i-1].imdbRating);
      if(!isNaN(rating))
        ratings.push({name: episodes[i-1].Title, rating: rating, season: seasonNum, episode: i});
    }
    //console.log("ratings: "+ratings)
    return ratings;
}

function addSeriesToFirebase(series, data){
  database.ref(series).set(data);
}