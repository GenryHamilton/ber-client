const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    email: {type: String, unique: true, required: true},
    isActivated: {type: Boolean, default: false},
    password: {type: String, required: true},
    activationLink: {type: String},
    referralCode: {type: String},
    registrationSource: {type: String},
    registrationDate: {type: Date, default: Date.now}
})

module.exports = model('User', UserSchema);