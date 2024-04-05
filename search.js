const express = require('express');
const {queryTMDBforTitle} = require('./apitesting');
require('dotenv').config();


const router = express.Router();

const {connection} = require('./models');
const UserModel = connection.models.UserModel;

router.get('/',async (req,res)=>{
    if(req.query.terms){
        let title = req.query.terms;
        try{
            let results = await queryTMDBforTitle(title,10);
            if(!results) results = [];
            results.sort((first,second)=>second.popularity-first.popularity);
            results = results.map((res)=>{
                let entry = {};
                ['id','title','poster_path','vote_average','overview','release_date'].forEach((key)=>{
                    entry[key] = res[key];
                });
                return entry;
            });
            let tpages = Math.ceil(results.length/10);
            if(results.length>10){
                if(!req.query.page){
                    results = results.slice(0,10);
                }
                else{
                    let pno = parseInt(req.query.page);
                    results = results.slice(10*(pno-1),10*(pno));
                }
            
            }
            res.render('searchpage.ejs',{user:req.user,pic:"https://source.unsplash.com/random/?candid",uname:"Placeholder",results:results,totalpages:tpages,url:req.baseUrl+req.url.split("&page")[0],curr:parseInt(req.url[req.url.length-1])});
        }
            catch(err){
                setTimeout(()=>{res.redirect(req.get('referer'));},300);
            }
        }
        else{
            res.status(404);
        }
});


module.exports = router;