# Lucy Node SDK

This is the Lucy On-Premise Connector SDK for node.js

## Example

```javascript
const process = require('process');
const {LucyConnector} = require('lucy-node-sdk');
async function receiveNotification(payload) {
    return {status:'ok'};
}
const connector = LucyConnector.fromInstallationKey(process.env.LUCY_CONNECTOR_KEY,'DesktopNotification',receiveNotification);
```

This example stores the installation key (which you get from Lucy) in a env var called `LUCY_CONNECTOR_KEY`
