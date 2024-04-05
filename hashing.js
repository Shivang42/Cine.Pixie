const bcrypt = require('bcrypt');


const config = {
  digestAlgorithm: 'sha1',
  keyLen: 64,
  saltSize: 64,
  iterations: 15000
};

function genPasswd(passwordText){
    let dat = {};
    dat.salt = bcrypt.genSaltSync(10);     
    dat.hash = bcrypt.hashSync(passwordText,dat.salt);
    return dat;
};
function validPasswd(passwordText,hash){
    return bcrypt.compareSync(passwordText, hash);
}

module.exports.genPasswd = genPasswd;
module.exports.validPasswd = validPasswd;