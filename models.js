const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;
require('dotenv').config();


const userSchema = new Schema({
    userID:String,
    userName:String,
    email:String,
    profilePic:String,
    hash:String,
    salt:String,
    reviews:Array,
    followers:Array,following:Array
});
const reviewSchema = new Schema({
    filmid:Number,
    reviewerName:String,
    review:String,
    stars:Number,
    postDate:Date
});     
const url = process.env.DB_URL;
const connection = mongoose.createConnection(url);
const userModel = connection.model('UserModel',userSchema);
const reviewConnection = mongoose.createConnection(url);
const reviewModel = reviewConnection.model('reviewModel',reviewSchema);
//Driver stub
// const m = new userModel();
// m.userName = 'admin';
// m.email = 'shivang.polymathy@gmail.com';
// m.pwd = 'admin10';
// m.save();
module.exports =  {connection,reviewConnection};