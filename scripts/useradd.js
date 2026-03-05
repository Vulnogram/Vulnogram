// Copyright (c) 2017 Chandan B N. All rights reserved.
// Command line utility to add users.

const pbkdf2 = require('../lib/pbkdf2.js');
const User = require('../models/user.js');
const readline = require('readline');
const mongo = require('../lib/mongo');
const config = require('../config/conf');

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

let newUser = {
    name: args[4],
    email: args[3],
    username: (args[2] || '').toLowerCase(),
    priv: Number(args[6]),
    group: args[5],
    emoji: '',
    password: "dummy"
};

let error = User.validateUserDocument(newUser);
if (error) {
    console.log("Error: " + error);
    process.exit(1);
}

function hashPassword(password) {
    return new Promise(function (resolve, reject) {
        pbkdf2.hash(password, function (err, hash) {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

hidden('Enter Password: ', (password1) => {
    hidden('Enter Password again: ', async (password2) => {
        if (password1 && password1 == password2) {
            try {
                await mongo.connect(config.database);
                var hash = await hashPassword(password1);
                newUser.password = hash;
                var doc = await User.findOneAndUpdate({
                    username: newUser.username
                },
                    newUser, {
                    upsert: true,
                    setDefaultsOnInsert: true
                });
                if (doc) {
                    console.log('Success', 'User ' + doc.username + ' is now updated.\n');
                } else {
                    console.log('Success', 'New user is now registered and can log in: ' + newUser.username);
                }
            } catch (err) {
                console.error(err);
                process.exitCode = 1;
            } finally {
                try {
                    await mongo.close();
                } catch (e) {

                }
                rl.close();
            }
        } else {
            console.error("Passwords do not match! Try again.");
            process.exitCode = 1;
            rl.close();
        }
    });
});
