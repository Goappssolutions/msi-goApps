var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var constants = require("./../../config/constants")
var districtSchema = new mongoose.Schema({
    state        : {type: Schema.Types.ObjectId, ref: 'state',required: true},
    name              : {type: String,unique:true},
    createdDate       : {type: Date, default: new Date()},
    isDelete          : {type: Boolean, default:false},
});
districtSchema.plugin(uniqueValidator, {message: "district already exists"});
var districtModel = mongoose.model('district', districtSchema);
module.exports = districtModel;
