var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');

var UserSchema = new mongoose.Schema({
    isAdmin : {
        type : Boolean,
        default : false,
    },
    email :{
        type:String,
        unique: true
    },
    name :String,
    photo : String,
    signature : String,
    designation:String,
    phone : String,
    authyId:String,
    password : String,
    createdOn : Date,
    state : {
        type : Number,
        default : 0
    },
    mobile_verified : {
        type:Boolean,
        default: false
    },
    email_verified : {
        type:Boolean,
        default:false
    },
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
    roles:{
        Release_order:Number,
        Invoice:Number,
        Payment_receipts:Number,
        Accounts:Number
    }
},
{
    _id: true // disables the creation of the virtual "id" property
});

var SALT_WORK_FACTOR = 10;
UserSchema.pre('save', function(next) {
    var self = this;
    if (!self.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(self.password, salt, function(err, hash) {
            if (err) return next(err);
            self.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    var self = this;
    bcrypt.compare(candidatePassword, self.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch, self);
    });
    
    
};


// Send a verification token to the user (two step auth for login)
UserSchema.methods.sendAuthyToken = function(cb) {
    var self = this;
    
    if (!self.authyId) {
        // Register this user if it's a new user
        authy.register_user(self.email, self.phone, 91,
            function(err, response) {
                
                if (err || !response.user){ 
                    return cb.call(self, err);}
                    self.authyId = response.user.id;
                    self.save(function(err, doc) {
                        if (err || !doc) return cb.call(self, err);
                        self = doc;
                        sendToken();
                    });
                });
            } else {
                // Otherwise send token to a known user
                
                sendToken();
            }
            
            // With a valid Authy ID, send the 2FA token for this user
            function sendToken() {
                authy.request_sms(self.authyId, true, function(err, response) {
                    cb.call(self, err);
                });
            }
        };

               
       
UserSchema.methods.verifyAuthyToken = function(otp, cb) {
    var self = this;
    authy.verify(self.authyId, otp, function(err, response) {
        cb.call(self, err, response);
    });
};
UserSchema.methods.sendVerificationMail = function(cb){
    var self=this;
    var mailOptions = {
    from: "sonumeewa@gmail.com", // sender address
    to: self.email, // list of receivers
    subject: "Account Confirmation",// Subject lin
    text: "Here is the link to confirm your mail", // plaintext body
    html:  "<p>click <a href='http://3eed0736.ngrok.io/api/user/verify/email/" + self._id + "'>here</a></p>"// html body
};

// send mail with defined transport object
transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Gmail Port
    auth: {
        user: "sonumeewa@gmail.com", // Gmail id
        pass: "Vipul@1997"  // Gmail password
    },
    secure:false//,proxy: process.env.http_proxy||"" 
});

transporter.sendMail(mailOptions,cb, function(error, info){
    if(error){
        cb.call(err, null);
    }
    else{

    console.log('Message sent: ' + info.response);
    cb.call(null, self);

    }
});

};

UserSchema.methods.sendPassword = function(password,cb){
    var self=this;
    var mailOptions = {
    from: "sonumeewa@gmail.com", // sender address
    to: self.email, // list of receivers
    subject: "Password",// Subject lin
    text: "Here is the password for your login at AAMAN", // plaintext body
    html:  "<p>"+ password+ "</p>"// html body
};

// send mail with defined transport object
transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Gmail Port
    auth: {
        user: "sonumeewa@gmail.com", // Gmail id
        pass: "Vipul@1997"  // Gmail password
    },
    secure:false,
    // proxy: "https://ipg_2016117:7060341350@192.168.1.107:3128"
});

transporter.sendMail(mailOptions,cb, function(error, info){
    if(error){
        cb.call(err, null);
    }
    else{
    console.log('Message sent: ' + info.response);
    cb.call(null, self);
    }
});
};


UserSchema.methods.sendPasswordResetMail = function(cb){
    var self=this;
    var mailOptions = {
    from: "sonumeewa@gmail.com", // sender address
    to: "sonumeewa@gmail.com", // list of receivers
    subject: "Reset Password",// Subject lin
    text: "Here is the link to reset your password", // plaintext body
    html:  "<p>click here: http://3eed0736.ngrok.io/api/user/reset/password/"+ self._id+Date.now()+ "</p>"// html body
};

// send mail with defined transport object
transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Gmail Port
    auth: {
        user: "sonumeewa@gmail.com", // Gmail id
        pass: "Vipul@1997"  // Gmail password
    },
    secure:true//,proxy: process.env.http_proxy||"" 
});

transporter.sendMail(mailOptions,cb, function(error, info){
    if(error){
        cb.call(err, null);
    }
    else{

    console.log('Message sent: ' + info.response);
    cb.call(null, self);

    }
});

};

UserSchema.methods.sendMessage = function(message, cb) {
    var self = this;
    twilioClient.sendMessage({
        to: 91 + self.smsmobile,
        from: config.twilioNumber,
        body: message
    }, function(err, response) {
        cb.call(self, err);
    });
};
        
        
module.exports = mongoose.model('User', UserSchema);
