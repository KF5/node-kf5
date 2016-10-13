'use strict';

var kf5 = require('./../index');
var path = require('path');
var kf5client = kf5.client({
    username:  'username',
    token:     'token',
    host: 'https://subdomain.kf5.com/apiv2'
});

// create request
var request = {
    "request":
    {
        "title":"Here is a request",
        "comment": {
            "content": "KF5 is the best platform for your customers !"
        }
    }
};
kf5client.requests.create(request,  function(err, req, result) {
    console.log(result);
    if (err) {
        console.log(err);
        return;
    }
});

// create user
var user = {
    "user": {
        "name": "node-demo",
        "email": "node-demo@kf5.com"
    }
};
kf5client.users.create(user, function (err, req, result) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(result);
});

// upload attachment
kf5client.attachments.upload(
    path.resolve('./logo.png'),
    {
        filename: 'kf5-logo.png'
    },
    function (err, req, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
    }
);