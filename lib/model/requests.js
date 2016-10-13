'use strict';

var util        = require('util'),
    Client      = require('./../client').Client;

var Requests = exports.Requests = function (options) {
    this.apiName = 'requests';
    this.apiNameSingular = 'request';
    Client.call(this, options);
};

util.inherits(Requests, Client);

Requests.prototype.list = function (cb) {
    this.requestAll('GET', ['requests'], cb);
};

Requests.prototype.show = function (requestID, cb) {
    this.request('GET', ['requests', requestID], cb);
};

Requests.prototype.create = function (request, cb) {
    this.request('POST', ['requests'], request,  cb);
};

Requests.prototype.update = function (requestID, request, cb) {
    this.request('PUT', ['requests', requestID], request,  cb);
};

Requests.prototype.listComments = function (requestID, cb) {
    this.requestAll('GET', ['requests', requestID, 'comments'], cb);
};
