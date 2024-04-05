const axios = require('axios');
const { name } = require('ejs');
require('dotenv').config()

// IMDP API through Rapid API testing
// const options = {
//   method: 'GET',
//   url: 'https://imdb188.p.rapidapi.com/api/v1/searchIMDB',
//   params: {
//     query: `Miller's crossing`
//   },
//   headers: {
//     'X-RapidAPI-Key': '5143ac4272msh5b1030536501f8bp16a8e1jsna319e56185cc',
//     'X-RapidAPI-Host': 'imdb188.p.rapidapi.com'
//   }

// };
// let q = 'kurosawa';
const queryTMDBforTitle = async (querystring,cc)=>{
  const options = {
    method: 'GET',
    url: `https://api.themoviedb.org/3/search/movie`,
    timeout:4000,
    params: {
      query: querystring,
      page:1,
      api_key:process.env.TMDB_KEY
    }
  };
  
  try {
    let finalresp = [];let count = 0;
    while(count < cc){
      options.params.page+=1;
      let resp = await axios.request(options);
      let data = resp.data;
        if(data.results.length===20){
          finalresp = finalresp.concat(data.results);
        }
        else{ 
          finalresp = finalresp.concat(data.results);break;
        }
        count++;
    }
    return finalresp;
    
  } catch (error) {
    console.error(error);
  }
}
const queryTMDBforID = async (queryid)=>{
  const options = {
    method: 'GET',
    timeout:4000,
    url: `https://api.themoviedb.org/3/movie/${queryid}`,
    params: {
      api_key:process.env.TMDB_KEY,
    }
  };
  let data = null;
  try {
    let resp = await axios.request(options);
    data = resp.data;
      if(data){
          return data;
      }
      else return null;
  } catch (error) {
    console.error(error);
  }
}
const queryTMDBforOTT = async (queryid)=>{
  const options = {
    method: 'GET',
    url: `
    https://api.themoviedb.org/3/movie/${queryid}/watch/providers`,
    params: {
      api_key:process.env.TMDB_KEY
    },
    timeout:4000
  };
  let data = null;
  try {
    let resp = await axios.request(options);
    data = resp.data;
      if(data){
          return data.results.IN;
      }
      else return null;
  } catch (error) {
    console.error(error);
  }
}
const queryTMDBforVideos = async (queryid)=>{
  const options = {
    method: 'GET',
    url: `
    https://api.themoviedb.org/3/movie/${queryid}/videos`,
    params: {
      api_key:process.env.TMDB_KEY
    },
    timeout:4000
  };
  let data = null;
  try {
    let resp = await axios.request(options);
    data = resp.data;
      if(data){
          return data.results.filter((video)=>(video.type==='Trailer'&&video.site==='YouTube'));
      }
      else return null;
  } catch (error) {
    console.error(error);
  }
}
const queryTMDBforCast = async (queryid)=>{
  const options = {
    method: 'GET',
    url: `
    https://api.themoviedb.org/3/movie/${queryid}/credits`,
    params: {
      api_key:process.env.TMDB_KEY
    },
    timeout:4000
  };
  let data = null;
  try {
    let writers = ['Writer','Screenplay','Executive Story Editor', 'Graphic Novel', 'Head of Story', 'Junior Story Editor', 'Lyricist', 'Original Concept', 'Original Film Writer', 'Original Series Creator', 'Senior Story Editor', 'Staff Writer', 'Story Artist', 'Story Consultant', 'Story Coordinator', 'Story Developer', 'Story Manager', 'Story Supervisor', "Writers' Assistant", "Writers' Production"];
    let resp = await axios.request(options);
    data = resp.data;
      if(data){
        data.cast.slice(9);
        let topcreds = {};
        // topcreds.director = data.crew.filter((cred)=>['Director'].includes(cred.job)).name || 'unavailable';
        let c = data.crew.filter((cred)=>writers.includes(cred.job));
        if(c.length>0){
          c = c.map((dat)=>dat.name);
        }
        let d = data.crew.filter((cred)=>['Director'].includes(cred.job));
        if(d.length>0){
          d = d.map((datum)=>datum.name);
        }
        Object.assign(topcreds,{'writer':c,'director':d});
        // console.log(data.crew.filter((cred)=>(['Director','director'].includes(cred.job))));
        topcreds.cast = data.cast.map((credit)=>{
          let newcredit = {};
          Object.assign(newcredit,credit);
          options.url = `https://api.themoviedb.org/3/person/${newcredit.id}`;
          axios.request(options).then((credresponse)=>{
            newcredit.pic = credresponse.profile_path;
          });
          return newcredit;
        });
        return topcreds;
      }
      else return null;
  } catch (error) {
    console.error(error);res.redirect(req.originalUrl);
  }
}
const queryTMDBforTrending = async (region)=>{
  const options = {
    method: 'GET',
    timeout:10000,
    url: `https://api.themoviedb.org/3/trending/movie/week`,
    params: {
      api_key:process.env.TMDB_KEY,
      page:1
    }
  };
  if(!options.params.region){delete options.params.region};
  let data = null;
  try {
    let resp = await axios.request(options);
    data = resp.data;
      if(data){
          return data.results;
      }
      else return null;
  } catch (error) {
    console.error(error);
  }
};
const queryTMDBforPersonal = async (fid)=>{
  const options = {
    method: 'GET',
    timeout:4000,
    url: `https://api.themoviedb.org/3/movie/${fid}/similar`,
    params: {
      api_key:process.env.TMDB_KEY,
      region:'IN',
      sort_by:'popularity.desc',
      page:1
    }
  };
  if(!options.params.region){delete options.params.region};
  let data = null;
  try {
    let resp = await axios.request(options);
    data = resp.data;
      if(data){
          return data.results;
      }
      else return null;
  } catch (error) {
    console.error(error);
  }
};
const queryTMDBforSuggestion = async (genids)=>{
  const options = {
    method: 'GET',
    url: `https://api.themoviedb.org/3/discover/movie`,
    timeout:4000,
    params: {
      api_key:process.env.TMDB_KEY,
      with_genres:`with_genres=${genids.join(',')}`,
      sort_by:'popularity.desc',
      page:1
    }
  };
  if(!options.params.region){delete options.params.region};
  let data = null;
  try {
    let resp = await axios.request(options);
    data = resp.data;
      if(data){
          return data.results;
      }
      else return null;
  } catch (error) {
    console.error(error);
  }
};
const fetchTMDBProfile = async (id)=>{
  let profile = {};
  let film = await queryTMDBforID(id);
  let services = await queryTMDBforOTT(id);
  let trailers = await queryTMDBforVideos(id);
  let credits = await queryTMDBforCast(id);
  profile.film = film;
  console.log(film);
  profile.services = services;
  profile.trailers = trailers;
  profile.cast = credits;
  return profile;
}
module.exports = {queryTMDBforPersonal,queryTMDBforSuggestion,queryTMDBforTrending,fetchTMDBProfile,queryTMDBforTitle};