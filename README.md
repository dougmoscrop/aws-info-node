# aws-info

```js
const { endpoint, regionName } = require('aws-info');

// https://s3.amazonzaws.com
const s3Endpoint = endpoint('S3', 'us-east-1');

// Canada (Central)
const name = regionName('ca-central-1');
```

You can also access the raw data:

```js
const { data } = require('aws-info');

// data.regions ...
// data.services ...
```