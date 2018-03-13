var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');

var RatecardSchema = new mongoose.Schema({
MediaType:String,
AdType:String,
RateCardType:String,
BookingCenter:{
    MediaHouseName:String,
    Edition:String,
    PulloutName:String
},
Frequency:{
    Period:String,
    Remark:String
},
Category:{
    Main:String,
    SubCategory1:String,
    SubCategory2:String,
    SubCategory3:String,
    SubCategory4:String,
    SubCategory5:String,
    SubCategory6:String
},
Rate:{
    rateQuantity:String,
    unit:String,
    unitQuantity:String
},
Position:String,
Hue:String,
MaxSizeLimit: {
    Length:String,
    Width:String
},
MinSizeLimit: {
    Length:String,
    Width:String
},
FixSize:[{Width:String,Length:String,Amount:String}],
Scheme:[{paid:String, Free:String, TimeLimit:String}],
Premium:[{Type:String, Amount:String}],
Tax:[{ Included:Boolean, TaxRate:String}],
ValidFrom:Date,
ValidTill:Date,
Covered:[{mediaHouse:String, EditionArea:String}],
Remarks:[{remark:String}],

firm : {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Firm"
},
global:{
    type:Boolean,
    default:false
}
});
module.exports = mongoose.model('RateCard', RatecardSchema);
