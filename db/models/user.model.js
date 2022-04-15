const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// JWT SCRETE

const jwtSecret = "73594878348488929351davdapritam89802963089825675394";

// Defined UserSchema
const UserSchema = new mongoose.Schema({
    email :{ 
        type: String,
        required: true,
        minlength:1,
        trim: true,
        unique: true
    },
    password : { 
        type: String,
        required: true,
        minlength: 8
    },
    sessions : [{
        token : {
            type: String,
            required: true
        },
        expireAt : {
            type: Number,
            required: true
        }
    }]
})


// --------------------------->>>>>> Instance Methods <<<<<<<------------------------------

UserSchema.methods.toJSON = function () {
    
    const user = this;
    const userObject = user.toObject();
    
    // Should return document accept the password and session ( this shouldn't make public )
    
    return _.omit(userObject, ['password' , 'sessions'])
    
}


// Generate Access Token
UserSchema.methods.generateAccessAuthToken = function () {
    
    const user = this;
    
    return new Promise((resolve, reject) => {
        // Create the JSON web token and return that
        
        jwt.sign({ _id: user._id.toHexString() }, jwtSecret, { expiresIn: "15m" }, (err, token) => {
            if(!err){
                resolve(token);
            } else {
                // There is no error
                reject();
            }
        })
    });   
}


// Generate Refresh Auth Token
UserSchema.methods.generateRefreshAuthToken = function () {
    
    // Here we have to generate the 64bytes hex string, that is not saved in the database
    
    return new Promise((resolve, reject) => {
        
        crypto.randomBytes(64, (error, buffer) => {
            if(!error) {
                let token = buffer.toString('hex');
                
                return resolve(token);
            }
        })
    });
}


// Creates A session
UserSchema.methods.createSession = function () {
    let user = this;
    
    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        return refreshToken;
    }).catch((e) => {
        return Promise.reject("Failed to save the session to database. ==> "+ e);
    });
}


// --------------------------------->>>>>>>>> MODEL METHODS <<<<<<<<<<----------------------------

// FIND BY ID AND TOKEN
UserSchema.statics.findByIdAndToken = function (_id, token) {
    // find user by id and token
    
    const User = this;
    
    return User.findOne({
        _id,
        'sessions.token': token
    });
}

// FIND BY CREDENTIALS
UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;
    
    return User.findOne({ email }).then((user) => {
        if(!user){
            return Promise.reject();
        }
        
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password , (error, res) => {
                if(res){
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
}


// Checking refresh token is expired or not
UserSchema.statics.refreshTokenExpired = (expireAt) => {
    let secondsSienceEpoch = Date.now() / 1000;
    if(expireAt > secondsSienceEpoch){
        // hasn't expired
        return false;
    } else {
        return true;
    }
}


// RETURN JWT TOKEN

UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}


// --------------------------------->>>>>>>>> Middle Ware <<<<<<<<<<<-----------------------------
UserSchema.pre('save', function(next){
    
  let user = this;
  let costFactor = 10;
  
  if(user.isModified('password')){
    //   if the password field is changed or edited then run this
    // Generate salt and hash password
    
    bcrypt.genSalt(costFactor, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            next();
        });
    });
  } else {
      next();
  }
});


// ---------------------------------->>>>>>>> HELPER METHODS <<<<<<<<<-----------------------------

// Save the session to the database
let saveSessionToDatabase = (user, refreshToken) => {
    
    return new Promise((resolve, reject) => {
        
        let expireAt = RefreshTokenExpiryTime();
        
        user.sessions.push({ 'token' : refreshToken, expireAt });
        
        user.save().then(() => {
            // Saved this session to database successfully
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        });
    })
}

// Generating Refresh Auth Token Expiry Time
let RefreshTokenExpiryTime = () => {
    let secondsUntillExpire = (30 * 60);
    // let secondsUntillExpire = 15;
    
    
    return ((Date.now() / 1000) + secondsUntillExpire);
}


const User = mongoose.model('User', UserSchema);

module.exports = { User }