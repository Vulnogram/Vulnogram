const DEFAULT_LOCAL_MONGO_URL = 'mongodb://127.0.0.1:27017/vulnogram';

const BLOCKED_ENV_VALUES = {
    MONGO_INITDB_ROOT_USERNAME: ['admin', 'changeMeMongoUser'],
    MONGO_INITDB_ROOT_PASSWORD: ['admin', 'CHANGE_ME_MONGO_PASSWORD'],
    VULNOGRAM_ADMIN_USERNAME: ['vulnogram', 'changeMeAdmin'],
    VULNOGRAM_ADMIN_PASSWORD: ['vulnogram', 'CHANGE_ME_VULNOGRAM_ADMIN_PASSWORD']
};

function readEnv(name) {
    var value = process.env[name];
    return typeof value === 'string' ? value.trim() : '';
}

function isPlaceholderValue(value) {
    return /(?:CHANGE|REPLACE)[-_ ]?ME/i.test(value);
}

function isBlockedValue(name, value) {
    if (!value) {
        return false;
    }
    var blocked = BLOCKED_ENV_VALUES[name] || [];
    return blocked.indexOf(value) !== -1 || isPlaceholderValue(value);
}

function assertSafeCredential(name, value, hint) {
    if (!isBlockedValue(name, value)) {
        return;
    }
    throw new Error(
        'Refusing to start with insecure sample credential for ' + name +
        '. Configure a unique value in your environment file before starting Vulnogram.' +
        (hint ? ' ' + hint : '')
    );
}

function assertSafeMongoUrl(url) {
    if (!url) {
        return;
    }
    var parsed;
    try {
        parsed = new URL(url);
    } catch (err) {
        throw new Error('Invalid MONGO_URL: ' + err.message);
    }
    var username = decodeURIComponent(parsed.username || '');
    var password = decodeURIComponent(parsed.password || '');
    assertSafeCredential('MONGO_INITDB_ROOT_USERNAME', username, 'Update MONGO_URL.');
    assertSafeCredential('MONGO_INITDB_ROOT_PASSWORD', password, 'Update MONGO_URL.');
}

function assertSafeDeploymentConfig() {
    assertSafeCredential('MONGO_INITDB_ROOT_USERNAME', readEnv('MONGO_INITDB_ROOT_USERNAME'));
    assertSafeCredential('MONGO_INITDB_ROOT_PASSWORD', readEnv('MONGO_INITDB_ROOT_PASSWORD'));
    assertSafeCredential('VULNOGRAM_ADMIN_USERNAME', readEnv('VULNOGRAM_ADMIN_USERNAME'));
    assertSafeCredential('VULNOGRAM_ADMIN_PASSWORD', readEnv('VULNOGRAM_ADMIN_PASSWORD'));
    assertSafeMongoUrl(readEnv('MONGO_URL'));
}

function buildMongoUrl() {
    var explicitUrl = readEnv('MONGO_URL');
    if (explicitUrl) {
        return explicitUrl;
    }

    var username = readEnv('MONGO_INITDB_ROOT_USERNAME');
    var password = readEnv('MONGO_INITDB_ROOT_PASSWORD');
    var host = readEnv('MONGO_HOST');
    var port = readEnv('MONGO_PORT');
    var hasCredentialOverride = !!username || !!password;
    var hasHostOverride = !!host || !!port;

    if (hasCredentialOverride && (!username || !password)) {
        throw new Error('Both MONGO_INITDB_ROOT_USERNAME and MONGO_INITDB_ROOT_PASSWORD must be set together.');
    }

    if (!hasCredentialOverride && !hasHostOverride) {
        return DEFAULT_LOCAL_MONGO_URL;
    }

    var resolvedHost = host || '127.0.0.1';
    var resolvedPort = port || '27017';
    if (!hasCredentialOverride) {
        return 'mongodb://' + resolvedHost + ':' + resolvedPort + '/vulnogram';
    }

    return 'mongodb://' + encodeURIComponent(username) + ':' + encodeURIComponent(password) +
        '@' + resolvedHost + ':' + resolvedPort;
}

module.exports = {
    assertSafeDeploymentConfig: assertSafeDeploymentConfig,
    buildMongoUrl: buildMongoUrl
};
