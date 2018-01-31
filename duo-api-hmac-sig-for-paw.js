// Duo Admin API request signatures
// https://duo.com/docs/adminapi
// context docs: https://paw.cloud/docs/reference/ExtensionContext
// request docs: https://paw.cloud/docs/reference/Request
//
// Setup in Paw environment:
// IKEY - (integration key)
// SKEY - (secret key)
// HOST - (api hostname)
//
// In each request, select Auth -> Basic Auth, then set the username to IKEY and paste
// this JS code in as the password.
//
// TODO: fix hardcoded timezone!

function formatDate(date) {
    var dayofweek = "";
    switch (date.getUTCDay()) {
        case 0:
        dayofweek = 'Sun';
        break;
        case 1:
        dayofweek = 'Mon';
        break;
        case 2:
        dayofweek = 'Tue';
        break;
        case 3:
        dayofweek = 'Wed';
        break;
        case 4:
        dayofweek = 'Thu';
        break;
        case 5:
        dayofweek = 'Fri';
        break;
        case 6:
        dayofweek = 'Sat';
        break;
    }
    var month = "";
    switch (date.getUTCMonth()) {
        case 0:
        month = 'Jan';
        break;
        case 1:
        month = 'Feb';
        break;
        case 2:
        month = 'Mar';
        break;
        case 3:
        month = 'Apr';
        break;
        case 4:
        month = 'May';
        break;
        case 5:
        month = 'Jun';
        break;
        case 6:
        month = 'Jul';
        break;
        case 7:
        month = 'Aug';
        break;
        case 8:
        month = 'Sep';
        break;
        case 9:
        month = 'Oct';
        break;
        case 10:
        month = 'Nov';
        break;
        case 11:
        month = 'Dec';
        break;
    }
    var day = date.getUTCDate();
    //Tue, 21 Aug 2012 17:29:18 -0000
    return dayofweek + ", " + pad(day) + " " + month + " " + date.getFullYear() + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds()) + " -0700";
}

function pad(number) {
    if (number < 10) {
        return "0" + number;
    } else {
        return "" + number;
    }
}

function getUrlPath(url, host) {
    path = url.replace("https://"+host, '');
    return path;
}

function xwwwformurlencode(x) {
    var encodechar = new RegExp([
            '(?:[\0-\x1F"-&\+-\}\x7F-\uD7FF\uE000-\uFFFF]|',
            '[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|',
            '(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])'
            ].join(''), 'g');
    return String(x)
        .replace(encodechar, encodeURIComponent)
        .replace(/ /g, '+')
        .replace(/[!'()~\*]/g, function (ch) {
            return '%' + ch.charCodeAt().toString(16).slice(-2).toUpperCase();
        });
}

function encodeParams(request) {
    // TODO this might need to be fixed
    if (request.getMethod() == 'GET') {
        return encodeURI(request.urlQuery);
    } else if (request.getMethod() == 'POST') {
        var params = request.getBody();
        return params;
    } else {
        return "";
    }
}

function signHmacSha1(key, input) {
    return DynamicValue('com.luckymarmot.HMACDynamicValue', {
        algorithm: 1, // (not documented) algorithm = 1 for SHA1
        encoding: 'Hexadecimal',
        input: input, // input string
        key: key // HMAC key
    }).getEvaluatedString();
}

function evaluate(context){
    var SKEY = context.getEnvironmentVariableByName('SKEY').getCurrentValue();
    var HOST = context.getEnvironmentVariableByName('HOST').getCurrentValue();
    var DATE = new Date();
    var request = context.getCurrentRequest();
    var canon = formatDate(DATE) + "\n" + request.getMethod() + "\n" + HOST + "\n" + getUrlPath(request.getUrlBase(), HOST) + "\n" + encodeParams(request);
    //return canon;
    return signHmacSha1(SKEY, canon);
};
