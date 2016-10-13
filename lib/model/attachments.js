'use strict';

var util        = require('util'),
    Client      = require('./../client').Client;

var Attachments = exports.Attachments = function (options) {
    this.apiName = 'attachments';
    this.apiNameSingular = 'attachment';
    Client.call(this, options);
};

util.inherits(Attachments, Client);

Attachments.prototype.upload = function (file, fileOptions, cb) {
    this.requestUpload(['attachments', {filename: fileOptions.filename}], file, cb);
};

Attachments.prototype.show = function (attachmentID, cb) {
    this.request('GET', ['attachments', attachmentID],  cb);
};

Attachments.prototype.delete = function (attachmentID, cb) {
    this.request('DELETE', ['attachments', attachmentID],  cb);
};

