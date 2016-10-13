'use strict';

var request      = require('request'),
    async        = require('async'),
    pjson        = require('./../package.json'),
    fs           = require('fs'),
    failCodes = {
        400: 'Bad Request',
        401: 'Not Authorized',
        403: 'Forbidden',
        404: 'Item not found',
        405: 'Method not Allowed',
        409: 'Conflict',
        422: 'Unprocessable Entity',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        503: 'Service Unavailable'
    };

var Client = exports.Client = function Client(options){
    this.options = options;
    if ('function' !== typeof this.options.get) {
        this.options.get = function (key) {
            return this[key];
        };
    }
    this.userAgent = 'node-kf5-api/' + pjson.version + '(node/' + process.versions.node + ')';
    this._request = request.defaults({
        jar:      this.options.get('no-cookies') ? false : request.jar(),
        encoding: this.options.get('encoding') || null,
        timeout:  this.options.get('timeout')  || 240000,
        proxy:    this.options.get('proxy')    || null
    });
};

Client.prototype.request = function (method, uri) {
    var self = this,
        args = Array.prototype.slice.call(arguments),
        callback = args.pop(),
        body     = 'object' === typeof args[args.length - 1] && !Array.isArray(args[args.length - 1]) && args.pop(),
        auth     = this.options.get('password') ? ':' + this.options.get('password') : '/token:' + this.options.get('token'),
        encoded  = new Buffer(this.options.get('username') + auth).toString('base64');

    self.options.headers = {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
        'User-Agent':   self.userAgent,
        'Authorization' : 'Basic ' + encoded
    };

    self.options.uri = getRequestUrl(self,uri);
    self.options.method = method || 'GET';

    if (body) {
        self.options.body = JSON.stringify(body);
    } else if ('GET' !== method && 'application/json' === self.options.headers['Content-Type']) {
        self.options.body = '{}';
    }

    return this._request(self.options, function (err, response, result) {
        requestCallback(self, err, response, result, callback);
    });
};

Client.prototype.requestAll = function () {
    var args         = Array.prototype.slice.call(arguments),
        callback     = args.pop(),
        nextPage     = null,
        bodyList     = [],
        statusList   = [],
        self         = this,
        __request = Client.prototype.request;

    return __request.apply(this, args.concat(function (error, status, body, response, result) {
        if (error) return callback(error);
        statusList.push(status);
        bodyList.push(body);
        nextPage = result.next_page;
        async.whilst(
            function () {return null !== nextPage && 'undefined' !==  typeof nextPage; },
            function (cb) {
                __request.apply(self, ['GET', nextPage, function (error, status, body, response, result) {
                    if (error) return cb(error);
                    statusList.push(status);
                    bodyList.push(body);
                    nextPage = result.next_page;
                    cb(null);
                }]);
            },
            function (err) {
                if (err) {
                    callback(err);
                } else {
                    var data = bodyList.reduce(function (acc, item) {
                        return acc.concat(item);
                    }, []);
                    return callback(null, statusList, data);
                }
            }
        );
    }));
};

Client.prototype.requestUpload = function (uri, file, callback) {
    var self     = this,
        out,
        auth     = this.options.get('password') ? ':' + this.options.get('password') : '/token:' + this.options.get('token'),
        encoded  = new Buffer(this.options.get('username') + auth).toString('base64');

    self.options.uri = getRequestUrl(self, uri);
    self.options.method = 'POST';
    self.options.headers = {
        'Content-Type': 'application/binary',
        'Accept':       'application/json',
        'Authorization' : 'Basic ' + encoded
    };

    out = this._request(self.options, function (err, response, result) {
        requestCallback(self, err, response, result, callback);
    });

    fs.createReadStream(file).pipe(out);
};

function requestCallback(self, err, response, result, callback) {
    if (err) return callback(err);
    checkResponse(response, result, function(err, res) {
        if (err) return callback(err);

        var body = '';
        if (res) {
            if (!body && null !== self.apiName) {
                body = res[(self.apiName.toString())];
            }
            if (!body && null !== self.apiNameSingular) {
                body = res[(self.apiNameSingular.toString())];
            }
            if (!body) {
                body = res;
            }
        }
        return callback(null, response.statusCode, body, response, res);
    });
}

function checkResponse(response, result, callback) {
    var statusCode, error, res;

    if (!result) {
        error = new Error('empty result');
        error.statusCode = 204;
        return callback(error);
    }
    res = new Buffer(result).toString();
    statusCode = response.statusCode;
    if (failCodes[statusCode]) {
        error = new Error('Error (' + statusCode + '): ' + failCodes[statusCode]);
        error.statusCode = statusCode;
        error.result = result;
        return callback(error);
    }
    if(res){
        res = JSON.parse(res);
    }
    return callback(null, res);
}

function getRequestUrl(self, uri) {
    var lastElement, params = '';

    if ('object' === typeof uri && Array.isArray(uri)) {
        lastElement = uri.pop();
        if (lastElement) {
            if ('object' === typeof lastElement) {
                params = '?' + urlencode(lastElement);
            }
            else if (0 === lastElement.toString().indexOf('?')) {
                params = lastElement;
            }
            else {
                uri.push(lastElement);
            }
        }
        return self.options.get('host') + '/' + uri.join('/') + '.json' + params;
    }
    else if ('string' === typeof uri && uri.indexOf(self.options.get('host')) === -1) {
        return self.options.get('host') + uri;
    }
    else {
        return uri;
    }
}

function urlencode(obj) {
    if (typeof obj === 'object') {
        return Object.keys(obj).map(function(k) {
            var ks = encodeURIComponent(k) + '=';
            if (Array.isArray(obj[k])) {
                return obj[k].map(function(v) {
                    return ks + encodeURIComponent(v);
                }).join('&');
            } else {
                return ks + encodeURIComponent(obj[k]);
            }
        }).join('&');
    }
    return '';
}