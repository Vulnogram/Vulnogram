// Copyright (c) 2017 Chandan B N. All rights reserved.

const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: [/[a-zA-Z0-9]{3,}/, 'Need atleast three letters in a name']
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
        validate: [/^[a-zA-Z0-9]{3,}$/, 'Usernames should have atleast three alphanumeric characters']
    },
    email: {
        type: String,
        required: true,
        validate: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Invalid email address']
    },
    emoji: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    priv: {
        type: Number,
        required: true,
        default: 1
    },
    group: {
        type: String,
        required: false
    }
});

//0 admin
//1 read/write
//2 read

const User = module.exports = mongoose.model('User', UserSchema);