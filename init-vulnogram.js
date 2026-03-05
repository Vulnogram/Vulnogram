const pbkdf2 = require('./lib/pbkdf2.js');
const User = require('./models/user.js');
const mongo = require('./lib/mongo');
const config = require('./config/conf');

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

async function main() {
    try {
        await mongo.connect(config.database);
        var username = (process.env.VULNOGRAM_ADMIN_USERNAME || '').toLowerCase();
        var adminUser = await User.findOne({
            username: username
        });
        if (adminUser) {
            console.log(`Admin user, ${process.env.VULNOGRAM_ADMIN_USERNAME}, already exists. Skipping initialization.`);
            await mongo.close();
            process.exit(0);
        }
        var hash = await hashPassword(process.env.VULNOGRAM_ADMIN_PASSWORD);
        var newUser = {
            name: process.env.VULNOGRAM_ADMIN_NAME,
            email: process.env.VULNOGRAM_ADMIN_EMAIL,
            username: username,
            priv: 0,
            group: process.env.VULNOGRAM_ADMIN_CNA_EMAIL,
            emoji: process.env.VULNOGRAM_ADMIN_EMOJI || '',
            password: hash
        };
        var error = User.validateUserDocument(newUser);
        if (error) {
            console.log("Error: " + error);
            await mongo.close();
            process.exit(1);
        }
        var doc = await User.findOneAndUpdate({
            username: newUser.username
        },
            newUser,
            {
                upsert: true,
                setDefaultsOnInsert: true
            });
        if (doc) {
            console.log('Success', 'User ' + doc.username + ' is now updated.\n');
        } else {
            console.log('Success', 'New user is now registered and can log in: ' + newUser.username);
        }
    } catch (err) {
        console.log("MongoDB Error: " + err);
        process.exitCode = 1;
    } finally {
        await mongo.close();
    }
}

main();
