// Copyright (c) 2017 Chandan B N. All rights reserved.
// Command line utility to add users.

const pbkdf2 = require('../lib/pbkdf2.js');
const passport = require('passport');
const User = require('../models/user.js');
const readline = require('readline');
const mongoose = require('mongoose');
const config = require('../config/conf');

mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);

function hidden(query, callback) {
    var stdin = process.openStdin();
    var onDataHandler = function (char) {
        char = char + "";
        switch (char) {
            case "\n":
            case "\r":
            case "\u0004":
                // Remove this handler
                stdin.removeListener("data", onDataHandler);
                break; //stdin.pause(); break;
            default:
                process.stdout.write("\033[2K\033[200D" + query + Array(rl.line.length + 1).join("*"));
                break;
        }
    };
    process.stdin.on("data", onDataHandler);

    rl.question(query, function (value) {
        rl.history = rl.history.slice(1);
        callback(value);
    });
}

const args = process.argv;

if (args.length != 7) {
    console.error('Usage node useradd.js username email "Name" CNA_email priv(0=admin, 1=read-write, 2=read only)');
    process.exit(1);
}
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let newUser = new User({
                name: args[4],
                email: args[3],
                username: args[2],
                priv: args[6],
                group: args[5],
                password : "dummy"
            }, { _id: false });

if(error = newUser.validateSync()) {
    console.log("Error: " + error);
    process.exit(1);
}

newUser = newUser._doc;
delete newUser._id;

hidden('Enter Password: ', (password1) => {
    hidden('Enter Password again: ', (password2) => {
        if (password1 && password1 == password2) {
            pbkdf2.hash(password1, function (err, hash) {
                if (err) {
                    console.error(err);
                }
                newUser.password = hash;
                mongoose.connect(config.database, {
                    keepAlive: false,
                });
                User.findOneAndUpdate({
                        username: newUser.username
                    },
                    newUser, {
                        upsert: true,
                        setDefaultsOnInsert: true
                    },
                    function (err, doc) {
                        if (err) {
                            console.error(err);
                        } else {
                            if (doc) {
                                console.log('Success', 'User ' + doc.username + ' is now updated.\n');
                            } else {
                                console.log('Success', 'New user is now registered and can log in: ' + newUser.username);
                            }
                        }
                        mongoose.connection.close();
                    });
            });
        } else {
            console.error("Passwords do not match! Try again.");
        }
        rl.close();
    });
});