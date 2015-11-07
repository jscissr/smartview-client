# Blackmagic Design™ SmartView control protocol client parser

This module is a client for connecting to SmartView & SmartScope devices.
It uses the freely available [TCP protocol](http://documents.blackmagicdesign.com/SmartView/2014-12-01/SmartView_Manual.pdf#page=30).
This module manages the connection to the device, and allows reading or updating the state, e.g. display brightness.

## Example

```js
const SmartViewClient = require('smartview-client');
const mdns = require('mdns-js');

var client = new SmartViewClient();

// find the IP address with mdns
mdns.excludeInterface('0.0.0.0');
var browser = mdns.createBrowser(mdns.tcp('smartview'));
browser.on('ready', () => browser.discover());
browser.once('update', data => {
  var ip = data.addresses[0];
  client.connect(ip);
});

client.on('connect', () => console.log('connection established'));

client.on('change', header => {
  if (header === 'SMARTVIEW DEVICE') {
    console.log('Upside down: ' + client.get('SMARTVIEW DEVICE').Inverted);
  }
});

process.stdin.on('data', () => { // when enter key is pressed
  if (!client.isConnected) {
    console.log('Sorry, not connected!');
    return;
  }
  client.set('MONITOR A', {Identify: 'true'});
});
```

This example uses mdns to find the SmartView, logs a message when the orientation changes,
and sets a border on the screen when enter is pressed in the console.

## Documentation

[API docs](api.md)

For the available commands you can send and receive, refer to the official
[Ethernet protocol](http://documents.blackmagicdesign.com/SmartView/2014-12-01/SmartView_Manual.pdf#page=30).

## Notes

The state returned by `client.get()` is not always guaranteed to be the same as on the SmartView device.
For example, the *Identify* property is automatically reset after 15s, but the client is not informed of this.

SmartView displays only allow one connection at a time.
Normally this is not a problem, but if it is for you, you can use the approach to open the connection only when sending a command and closing it again immediately.
However, this way you are not notified of state changes made by other clients.
A different solution might be for the client to advertise itself as a server, it would then act as a proxy to the actual device.
This way, you create a daisy-chain of clients, and everyone gets status updates.

There is another package called [smartview](https://www.npmjs.com/package/smartview) that does the same thing as this here, however I believe that it is a lot worse than mine.
Specifically, it does not adhere to the single responsibility principle:
It also tries to do the mdns discovery, and to add an abstraction over the protocol, however it only implements setting the *Border*.
It also creates a new connection for every single command, which is (usually) unnecessary.

## License

MIT

Copyright © 2015 Jan Schär

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
