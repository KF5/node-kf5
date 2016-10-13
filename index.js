'use strict';

var resources  = [
        'Requests','Users','Attachments'
    ];

exports.client = function(options){
    var client={}, clientPath = './lib/model/';

    resources.forEach(function (k) {
        var exports = require(clientPath + k.toLowerCase())[k];
        client[k.toLowerCase()] = new exports(options);
    });

    return client;
};
