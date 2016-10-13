# node-kf5-api
---

KF5 API client

## Install

```bash
npm install kf5-api
```

## Example

```js
var kf5 = require('kf5-api');
var kf5client = kf5.client({
    username:  'username',
    token:     'token',
    host: 'https://subdomain.kf5.com/apiv2'
});

kf5client.requests.list(function (err, req, result) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(result);
});
```
Take a look in the `examples` folder for more examples.
