const express = require('express');
const passport = require('passport');
const axios = require('axios');
const {fetchReccs} = require("./userHandler");
const {configReview} = require("./userHandler");
const genPasswd = require('./hashing').genPasswd;
const {fetchTMDBProfile,queryTMDBforTrending} = require('./apitesting');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();


const router = express.Router();

const {connection} = require('./models');
const UserModel = connection.models.UserModel;

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{failureFlash: true,failureRedirect:'/failure',successRedirect:'/dashboard'},(err,user,info)=>{
    req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect("/dashboard");
      });
    })(req,res,next)
});
router.post('/auth',async (req,res,next) => {
    if(req.query.signup=='true'){
        try{
            let createdUser = new UserModel();
            createdUser.userID = req.body.userid;
            createdUser.userName = req.body.name;
            createdUser.profilePic = req.body.mail;
            createdUser.email = req.body.mail;
            var salthash = genPasswd(req.body.passwd);
            createdUser.salt = salthash.salt;createdUser.hash = salthash.hash;
            createdUser.reviews = [];
            createdUser.followers = [];
            createdUser.following = [];
            let response = await fetch(`https://source.unsplash.com/1600x900/?beach`);
            createdUser.profilePic = response.url;
            await createdUser.save();
           
            res.send({message:'successful',redurl:'/?oper=signin'});
    
        }
        catch(e){
            if(e.code==11000){
                console.log(e);
                res.send({respcode:'dupkey',message:'Sorry, that email ID / user ID is already taken'});
            }
            else{
                // res.statusCode = 301;
                // res.redirect('/success');
                console.log(e);
                res.send({respcode:'interror',message:'Could not create account, please retry later'});
            }
        }
    }
   
});
router.get('/dashboard', async (req,res) => {
    if(req.isAuthenticated()){
        let ip = null;
        ip = req.socket.remoteAddress;
        let reg = '';
      
        try{
            let trending = await queryTMDBforTrending(reg);
            if( !trending || trending.length===0){
                trending = [];
            }
            trending.forEach((trend)=>trend.vote_average = parseFloat(trend.vote_average));
            let reccs2 = await fetchReccs(req.user.userName);
            if(reccs2==101){res.redirect('back');}
            res.render('dashboard.ejs',{user:req.user,pic:'https://source.unsplash.com/random/?candid',trending:trending,reccs:reccs2});
        }
        catch(err){
            console.log("Dashboard couldnt load");
            res.redirect('back');
        }
    }
    else{
        res.redirect(req.hostname+"?oper=signin")//Change this url
    }
    // res.render('dashboard.ejs',{uname:userprofile.displayName,pic:userprofile['_json'].picture});
    // console.log(userprofile['_json'].picture);
    // res.cookie('pixie-name',userprofile.displayName);
    // res.cookie('pixie-pic',userprofile['_json'].picture);
});
// router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
// router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),(req,res)=>{
//     userprofile = req.user;
//     res.redirect('/success');
// });r
// router.get('/logout',(req,res)=>{req.logout();res.redirect('/');})

router.route('/').get((req,res)=>{
    if(req.query.oper=='signin' || req.query.oper=='signup'){
        res.render('lander.ejs',{op:req.query.oper});
    }
});
router.get('/films/[0-9]{1,}',configReview, async (req,res) => {
    
    let id = req.url.split('/').pop();
    try{
        let profile = await fetchTMDBProfile(id);
        if(req.body.review.postDate){req.body.isPost=true}else{req.body.isPost=false;}
        res.render('film.ejs',{user:req.user,pic:'https://source.unsplash.com/random?candid',film:profile.film,services:profile.services,trailers:profile.trailers,cast:profile.cast,review:req.body.review,otherReviews:req.body.otherReviews,isPost:req.body.isPost});
    }
    catch(err){
        setTimeout(()=>{res.redirect(req.get('referer'));},300);
        
    }
    // console.log(profile.cast);
    // console.log(userprofile['_json'].picture);
    // res.cookie('pixie-name',userprofile.displayName);
    // res.cookie('pixie-pic',userprofile['_json'].picture);
});

module.exports = router;