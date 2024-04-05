const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const {queryTMDBforTrending, fetchTMDBProfile, queryTMDBforSuggestion,queryTMDBforPersonal, queryTMDBforTitle} = require("./apitesting");
require('dotenv').config();

const userHandler = express.Router();

const {connection,reviewConnection} = require('./models');
const reviewModel = reviewConnection.models.reviewModel;
const UserModel = connection.models.UserModel;

const configReview = (req,res,next)=>{
    let id = req.url.split('/').pop();
    try{
        reviewModel.findOne({filmid:id,reviewerName:req.user.userName}).then((record)=>{
            if(record){
                req.body.review = record;
            }
            else{
                req.body.review = {};
            }
        });
        reviewModel.find({filmid:id}).then((records)=>{
            if(records){
                req.body.otherReviews = records.filter((rec)=>rec.reviewerName!==req.user.userName).sort((first,second)=>second.postDate-first.postDate).slice(0,5);
            }
            else{
                req.body.otherReviews = {};
            }
        });
        next();
    }
    catch(err){
        setTimeout(()=>{res.redirect(req.originalUrl);},400);
        console.error(err);
    }
} 
userHandler.get('/profile',(req,res)=>{
    try{
       UserModel.findOne({userName:req.user.userName}).then(async (profileRec)=>{
            let following = [],followers = [];
            for(var i = 0;i < profileRec.following.length;i++){
                let fwee = await UserModel.findById(profileRec.following[i]);
                following.push(fwee.userName);
            }
            for(var j = 0;j < profileRec.followers.length;j++){
                let fwee = await UserModel.findById(profileRec.followers[j]);
                followers.push(fwee.userName);
            }
            res.render('profile.ejs',{user:profileRec,followers:followers,following:following,pic:'https://source.unsplash.com/random?candid'});
        });
   }
   catch(e){
       console.error(e);
       res.status(500);
   }
});
userHandler.get('/follow',async(req,res)=>{
    try{
        console.log(100);
        UserModel.findById(new ObjectId(req.user._id)).then((userRecord)=>{
            console.log(userRecord);
            if(userRecord.following.indexOf(new ObjectId(req.query.id))<0){//Correct his condition
                userRecord.following.push(new ObjectId(req.query.id));
                userRecord.save();
                UserModel.findOne({_id:new ObjectId(req.query.id)}).then((followee)=>{
                    followee.followers.push(new ObjectId(req.user._id));
                    followee.save();
                    res.setHeader('Content-Type','application/json');
                    res.send({mess:'successful'});
                }); 
            }
            else{
                res.setHeader('Content-Type','application/json');
                res.send({mess:'preexists'});
            }
        });
   }
   catch(e){
       console.error(e);
       res.status(500);
       res.send({mess:"failure"})
   }
});
userHandler.post('/post',(req,res)=>{
     try{
        // console.log(123);
        UserModel.findOne({userName:req.user.userName}).then((userRecord)=>{
            let newReview = new reviewModel();
            newReview.postDate = new Date((new Date()).toLocaleString());
            newReview.filmid = req.body.fid;
            newReview.reviewerName = req.user.userName;
            newReview.stars = req.body.stars;
            newReview.review = req.body.myReview;
            newReview.save().then((reviewRecord)=>{
                userRecord.reviews.unshift(reviewRecord._id);
                UserModel.findOneAndUpdate({_id:userRecord['_id']},{reviews:userRecord.reviews}).then((mess)=>{
                    res.redirect('back');
                });
            });
        });
    }
    catch(e){
        console.error(e);
        res.status(404);
    }
});
userHandler.post('/update',(req,res)=>{
    try{
       reviewModel.findOneAndUpdate({reviewerName:req.user.userName,filmid:req.body.fid},{stars:parseInt(req.body.stars),review:req.body.myReview},{new:true}).then((mess)=>{
            res.redirect('back');
        });
   }
   catch(e){
       console.error(e);
       res.status(500);
   }
});
const fetchUsers = async (name)=>{
    let userRecord = null;
    if(!name || name===''){
        userRecord = [];
    }else{
        userRecord = await UserModel.find({userName:{$regex:new RegExp(`^${name}`,"i")}});
    }
    userRecord = userRecord.map((urec)=>({uname:urec.userName,uid:urec._id.toString()}));
    return userRecord;
};
userHandler.get('/search',async(req,res)=>{
    try{
        let users = await fetchUsers(req.query.terms.slice(0,10));
        res.setHeader('Content-Type','application/json');
        res.send({users:users,mess:'successful'});
   }
   catch(e){
       console.error(e);
       res.status(500);
       res.send({users:[],mess:"failure"})
   }
});
userHandler.get('/filmsearch',async(req,res)=>{
    try{
        console.log(req.query.terms);
        queryTMDBforTitle(req.query.terms,1).then((films)=>{
            if(!films){
                films = [];
            }
            films = films.slice(0,5);
            films = films.map((film)=>({id:film.id,title:film.title}));
            res.setHeader('Content-Type','application/json');
            res.send({users:films,mess:'successful'});
        });
        
        
   }
   catch(e){
       console.error(e);
       res.status(500);
       res.send({users:[],mess:"failure"})
   }
});

const fetchReccs = async (uname)=>{
    let userRecord = await UserModel.findOne({userName:uname});
    var reviews = userRecord.reviews.slice(0,10);
    let datanew = {
        genres:new Set(),recs:new Set()
    }
    var filmids = [];
    for(var  k = 0;k < reviews.length;k++){
        try{
            let fid = await reviewModel.findById(new ObjectId(reviews[k].toString()));
            if(fid){
                filmids.push(fid.filmid);
            }
        }catch(ee){;
            filmids = [];
        }
       
    };
    filmids = filmids.slice(0,4);
    for(let i=0;i < filmids.length;i++){
        if(filmids[i]){
            try{
                let reccs = await queryTMDBforPersonal(filmids[i]);
                reccs = reccs.slice(0,10);
                for(let t=0;t < reccs.length;t++){
                    datanew.recs.add(reccs[t]);
                }
            }
                catch(e){
                    console.error(e);console.log("Acios errror");
                    return 101;
                }
        }
    }
    let arr1 = Array.from(datanew.recs).slice(0,20);
    return arr1;
    // for(var  k = 0;k < filmids.length;k++){
    //     let profile = await fetchTMDBProfile(filmids[k]);
    //     let gids = profile.film.genres.map((genre)=>genre.id);
    //     for(let ii = 0;ii < gids.length;ii++){
    //         genres.add(gids[ii]);
    //     }
    // };
    // genres = Array.from(genres);
    // genres = genres.map((genre)=>genre.toString());
    // console.log(genres);
    // queryTMDBforSuggestion(genres).then((dat)=>{
    //     console.log(dat);
    // }); 
};

module.exports = {configReview,userHandler,fetchReccs};