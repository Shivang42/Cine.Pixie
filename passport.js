const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {connection} = require('./models');
const UserModel = connection.models.UserModel;

const genPasswd = require('./hashing').genPasswd;
const validPasswd = require('./hashing').validPasswd;
let customFields = {
    username:'uid',
    password:'pwd'
};

let authUser = (username,password,done)=>{
    console.log(1010);
        UserModel.findOne({userName:username}).then((founduser)=>{
            if(founduser){
                if(validPasswd(password,founduser.hash,founduser.salt)){
                    return done(null,founduser);}
            }else{
                return done(null,false);
            }
    }).catch((err)=>{
        console.log(err);
        return done(null,false);
    });
    
}
passport.use(new LocalStrategy(customFields,authUser));

passport.serializeUser((user,done)=>{
    console.log("____Serialize");
    console.log(user);
    console.log(user.id);
    done(null,user.id);
});
passport.deserializeUser(async (id,done)=>{
    console.log("____Deserialize");
    console.log(id);
    try{
        UserModel.findById(id).then((user)=>{
            done(null,user);
        });
    }catch(err){
        console.error(err);
    }
    
});