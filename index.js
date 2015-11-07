'use strict';
const net = require('net');
const EventEmitter = require('events');

const smartViewPort = 9992;

/**
 * Blackmagic Design™ SmartView control protocol client parser
 * @class
 */
class SmartViewClient extends EventEmitter {
  constructor() {
    super();

    this.socket = new net.Socket();
    this.socket.setEncoding('utf8');
    this.socket.on('connect', () => this.emit('connect'));
    this.socket.on('data', data => this._onData(data));
    this.socket.on('error', err => this.emit('error', err));
    this.socket.on('close', () => {
      this._timeouts.forEach(clearTimeout);
      this.emit('close');
    });

    /**
     * If no ACK is received for this many ms after sending a command, the
     * connection is closed. Set to 0 for disabling timeout.
     * @member {number}
     * @default
     */
    this.timeout = 3000;

    this._reset();
  }

  _reset() {
    this.state = {};
    this._blockPart = ''; // not yet parsed block fragment
    this._timeouts = [];
    this._callbacks = [];
  }

  /**
   * Connects to a SmartView device
   * @param {string} ip - IP address or host name
   * @param {function} [connectListener] - added as connect listener
   */
  connect(ip, connectListener) {
    this._reset();
    this.socket.connect(smartViewPort, ip, connectListener);
  }

  /**
   * Closes connection if connected
   */
  close() {
    this.socket.end();
  }

  /**
   * Checks if there is a connection
   * @type {boolean}
   */
  get isConnected() {
    return this.socket.readyState === 'open';
  }

  _onData(data) {
    data = this._blockPart + data;
    while (true) {
      var index = data.indexOf('\n\n');
      if (index === -1) {
        break;
      }

      var block = data.substr(0, index);
      this._parseBlock(block);

      data = data.substr(index + 2);
    }
    this._blockPart = data;
  }

  _onTimeout() {
    this.socket.destroy(new Error('ACK timeout'));
  }

  _parseBlock(block) {
    if (block === 'ACK') {
      clearTimeout(this._timeouts.shift());
      var callback = this._callbacks.shift();
      if (callback) {
        callback();
      }
      return;
    }

    var lines = block.split('\n');
    var header = lines.shift();
    if (header.charAt(header.length - 1) === ':') {
      header = header.substr(0, header.length - 1);

      for (var i = 0; i < lines.length; i++) {
        var pair = lines[i].split(':');
        if (pair.length !== 2) {
          return this.socket.destroy(new Error('parse error'));
        }
        this.get(header)[pair[0]] = pair[1].trim();
      }

      this.emit('change', header);
    }
  }

  /**
   * Sends a command to the device
   * @param {string} header - the block header, e.g. 'MONITOR A'
   * @param {object} props - the properties to set
   * @param {function} [callback] - called when the device acknowledges the
   * command
   * @fires SmartViewClient#change
   */
  set(header, props, callback) {
    if (!this.isConnected) {
      throw new Error('Cannot set state, not connected');
    }
    var block = header + ':\n';
    Object.keys(props).forEach(key => {
      var value = props[key].toString().trim();
      this.get(header)[key] = value;
      block += key + ': ' + value + '\n';
    });
    block += '\n';
    this.socket.write(block);

    this._callbacks.push(callback);
    this._timeouts.push(this.timeout ?
        setTimeout(() => this._onTimeout(), this.timeout) : null);

    this.emit('change', header);
  }

  /**
   * Returns the current state
   * @param {string} header - the block header, e.g. 'MONITOR A'
   * @returns {object} props - the properties which are currently set
   */
  get(header) {
    return this.state[header] || (this.state[header] = {});
  }

  /**
   * Connection established
   * @event SmartViewClient#connect
   */

  /**
   * Error happened
   * @event SmartViewClient#error
   * @param {Error} error
   */

  /**
   * Connection closed
   * @event SmartViewClient#close
   */

  /**
   * A state object has been changed.
   * @event SmartViewClient#change
   * @param {string} header - the block header, e.g. 'MONITOR A'
   */
}
module.exports = SmartViewClient;
