'use strict';

var util        = require('util'),
    Client      = require('./../client').Client;

var Users = exports.Users = function (options) {
    this.apiName = 'users';
    this.apiNameSingular = 'user';
    Client.call(this, options);
};

util.inherits(Users, Client);

Users.prototype.list = function (cb) {
    this.requestAll('GET', ['users'], cb);
};

Users.prototype.show = function (id, cb) {
    this.request('GET', ['users', id], cb);
};

Users.prototype.create = function (user, cb) {
    this.request('POST', ['users'], user, cb);
};

Users.prototype.update = function (id, user, cb) {
    this.request('PUT', ['users', id], user, cb);
};

Users.prototype.delete = function (id, cb) {
    this.request('DELETE', ['users', id], cb);
};