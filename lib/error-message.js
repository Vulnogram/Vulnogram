function toErrorMessage(err, fallback) {
    if (typeof fallback !== 'string' || fallback.length === 0) {
        fallback = 'Unexpected error';
    }

    if (err === null || err === undefined) {
        return fallback;
    }

    if (typeof err === 'string') {
        return err;
    }

    if (typeof err.message === 'string' && err.message.length > 0) {
        return err.message;
    }

    if (typeof err.errmsg === 'string' && err.errmsg.length > 0) {
        return err.errmsg;
    }

    if (err.errorResponse && typeof err.errorResponse.errmsg === 'string' && err.errorResponse.errmsg.length > 0) {
        return err.errorResponse.errmsg;
    }

    if (typeof err.toString === 'function') {
        var text = err.toString();
        if (typeof text === 'string' && text.length > 0 && text !== '[object Object]') {
            return text;
        }
    }

    try {
        var json = JSON.stringify(err);
        if (typeof json === 'string' && json.length > 0) {
            return json;
        }
    } catch (jsonErr) {
        // ignore stringify errors and fall back below
    }

    return fallback;
}

module.exports = toErrorMessage;
