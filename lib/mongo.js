const { MongoClient } = require('mongodb');

let client = null;
let db = null;
let connectPromise = null;
let connected = false;

function resolveDatabaseName(uri, explicitName) {
    if (explicitName) {
        return explicitName;
    }
    try {
        const parsed = new URL(uri);
        const fromPath = (parsed.pathname || '').replace(/^\//, '');
        return fromPath || 'vulnogram';
    } catch (err) {
        return 'vulnogram';
    }
}

async function connect(uri, options) {
    if (db) {
        return db;
    }
    if (connectPromise) {
        return connectPromise;
    }
    const dbName = resolveDatabaseName(uri, options && options.dbName);
    const mongoClient = new MongoClient(uri);
    mongoClient.on('close', function () {
        connected = false;
    });
    connectPromise = mongoClient.connect().then(function () {
        client = mongoClient;
        db = client.db(dbName);
        connected = true;
        return db;
    }).catch(function (err) {
        connected = false;
        throw err;
    }).finally(function () {
        connectPromise = null;
    });
    return connectPromise;
}

function getDb() {
    if (!db) {
        throw new Error('MongoDB is not connected');
    }
    return db;
}

function getCollection(name) {
    return getDb().collection(name);
}

function getClient() {
    return client;
}

function isConnected() {
    return connected;
}

async function close() {
    if (client) {
        await client.close();
    }
    client = null;
    db = null;
    connectPromise = null;
    connected = false;
}

module.exports = {
    close: close,
    connect: connect,
    getClient: getClient,
    getCollection: getCollection,
    getDb: getDb,
    isConnected: isConnected
};
