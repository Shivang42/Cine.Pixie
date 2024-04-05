const express = require('express');
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore = require('connect-mongo');
const searchMW = require("./search");
const {userHandler} = require("./userHandler");
const app = express();
require('dotenv').config();

const url = process.env.DB_URL;

app.enable('trust proxy');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(flash());

app.use('/',express.static(__dirname+'/public'));
app.set('view-engine','ejs');
app.set('views',__dirname+'/views')
app.use((req,res,next)=>{
    console.log(req.session);next();
})

app.use(session({
    secret:process.env.PWD_HASH,
    resave:false,
    saveUninitialized:true,
    store:MongoStore.create({mongoUrl:url}),
    cookie:{
        maxAge:1000*60*60*24
    }
}));
require('./passport');
app.use(passport.initialize());
app.use(passport.session());
const auth = require('./auth');


// app.use(session({
//     secret:'sfgjfgSDFWEivH234erjjvGNVEdfg##23',
//     resave:true,
//     saveUninitialized:true
// }
// ));
// app.use(passport.initialize());
// app.use(passport.session());
// app.get('/',(req,res,next)=>{
//     if(req.session.viewcount){
//         req.session.viewcount+=1;
//         res.send(`<h2>${req.session.viewcount}</h2>`);
//         console.log(234);
//     }
//     else{
//         req.session.viewcount=1;
//         res.send(`<h2>${req.session.viewcount}</h2>`);
//         console.log(214);

//     }
//     next();
// });
app.use('/user',userHandler);
app.use('/search',searchMW);
app.use('/',auth);

app.listen(3000,()=>{
    console.log('Listening to port 3000');
}); 