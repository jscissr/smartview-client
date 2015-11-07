var test = require('tape');
var net = require('net');
var SmartViewClient = require('.');

test('block splitting', function (t) {
  var client = new SmartViewClient();

  var blocks = [];
  client._parseBlock = block => blocks.push(block);

  client._onData('A\n\n');
  t.deepEqual(blocks, ['A']);

  client._onData('B\nC\n');
  t.deepEqual(blocks, ['A']);
  client._onData('\n');
  t.deepEqual(blocks, ['A', 'B\nC']);

  client._onData('D\n\nE\n\nF');
  t.deepEqual(blocks, ['A', 'B\nC', 'D', 'E']);

  client._onData('G\n\n');
  t.deepEqual(blocks, ['A', 'B\nC', 'D', 'E', 'FG']);

  t.end();
});

test('block parsing', function (t) {
  var client = new SmartViewClient();

  var ackReceived = false;
  client._timeouts.push(null);
  client._callbacks.push(() => ackReceived = true);

  client._parseBlock([
    'MONITOR A:',
    'Brightness: 255',
    'Contrast: 127',
    'Saturation: 126',
    'Identify: false',
    'Border: None',
    'WidescreenSD: off',
    'ScopeMode: ParadeRGB',
    'AudioChannel: 0',
  ].join('\n'));
  t.deepEqual(client.get('MONITOR A'), {
    Brightness: '255',
    Contrast: '127',
    Saturation: '126',
    Identify: 'false',
    Border: 'None',
    WidescreenSD: 'off',
    ScopeMode: 'ParadeRGB',
    AudioChannel: '0'
  });

  client._parseBlock([
    'MONITOR A:',
    'Brightness: 8',
    'ScopeMode: ParadeYUV',
    'AudioChannel: 0',
  ].join('\n'));
  t.deepEqual(client.get('MONITOR A'), {
    Brightness: '8',
    Contrast: '127',
    Saturation: '126',
    Identify: 'false',
    Border: 'None',
    WidescreenSD: 'off',
    ScopeMode: 'ParadeYUV',
    AudioChannel: '0'
  });

  t.ok(!ackReceived);
  client._parseBlock('ACK');
  t.ok(ackReceived);

  t.end();
});

test('with fake server', function (t) {
  t.timeoutAfter(1000);
  var server = net.createServer();

  server.listen(9992, 'localhost', () => {
    var client = new SmartViewClient();
    client.connect('localhost');
    t.equal(client.isConnected, false);
    var clientOnConnect = false;
    client.on('connect', () => clientOnConnect = true);
    server.once('connection', connection => {
      t.equal(client.isConnected, true);
      t.ok(clientOnConnect, 'connect event was emitted on client');
      connection.setEncoding('utf8');

      connection.write([
        'MONITOR A:',
        'Brightness: 8',
        'ScopeMode: ParadeYUV',
        'AudioChannel: 0',
        '\n'
      ].join('\n'));

      client.once('change', () => {
        t.deepEqual(client.get('MONITOR A'), {
          Brightness: '8',
          ScopeMode: 'ParadeYUV',
          AudioChannel: '0'
        });

        var ackSent = false;
        client.set('MONITOR A', {Identify: 'true'}, function callback() {
          t.ok(ackSent, 'server has sent ACK');
          client.close();
          connection.on('end', () => {
            t.ok(!client.isConnected);
            server.close();
            t.end();
          });
        });
        t.deepEqual(client.get('MONITOR A'), {
          Brightness: '8',
          ScopeMode: 'ParadeYUV',
          AudioChannel: '0',
          Identify: 'true'
        });
        connection.once('data', data => {
          t.equal(data, 'MONITOR A:\nIdentify: true\n\n');
          connection.write('ACK\n\n');
          ackSent = true;
        });
      });
    });
  });
});

test('callbacks & reset', function (t) {
  t.timeoutAfter(1000);
  var server = net.createServer();

  server.listen(9992, 'localhost', () => {
    var client = new SmartViewClient();
    client.connect('localhost');
    server.once('connection', connection => {
      connection.setEncoding('utf8');

      client.timeout = 20;
      client.set('MONITOR A', {Identify: 'true'}, () => t.fail('this callback is never called'));

      client.on('error', () => {
        t.ok(!client.isConnected);

        client.connect('localhost');
        server.once('connection', connection => {
          connection.setEncoding('utf8');
          t.deepEqual(client.get('MONITOR A'), {}, 'state was reset');

          client.set('MONITOR A', {Contrast: '127'}, () => {
            t.pass('callback is called');
            client.close();
            connection.end();
            server.close();
            t.end();
          });
          connection.once('data', data => {
            connection.write('ACK\n\n');
          });
        });
      });
    });
  });
});

test('error when not connected', function (t) {
  var client = new SmartViewClient();

  t.throws(() => {
    client.set('MONITOR A', {Identify: 'true'});
  });
  t.end();
});
