<a name="SmartViewClient"></a>
## SmartViewClient
Blackmagic Design™ SmartView control protocol client parser

**Kind**: global class  

* [SmartViewClient](#SmartViewClient)
  * [.timeout](#SmartViewClient+timeout) : <code>number</code>
  * [.isConnected](#SmartViewClient+isConnected) : <code>boolean</code>
  * [.connect(ip, [connectListener])](#SmartViewClient+connect)
  * [.close()](#SmartViewClient+close)
  * [.set(header, props, [callback])](#SmartViewClient+set)
  * [.get(header)](#SmartViewClient+get) ⇒ <code>object</code>
  * ["connect"](#SmartViewClient+event_connect)
  * ["error" (error)](#SmartViewClient+event_error)
  * ["close"](#SmartViewClient+event_close)
  * ["change" (header)](#SmartViewClient+event_change)

<a name="SmartViewClient+timeout"></a>
### smartViewClient.timeout : <code>number</code>
If no ACK is received for this many ms after sending a command, the
connection is closed. Set to 0 for disabling timeout.

**Kind**: instance property of <code>[SmartViewClient](#SmartViewClient)</code>  
**Default**: <code>3000</code>  
<a name="SmartViewClient+isConnected"></a>
### smartViewClient.isConnected : <code>boolean</code>
Checks if there is a connection

**Kind**: instance property of <code>[SmartViewClient](#SmartViewClient)</code>  
<a name="SmartViewClient+connect"></a>
### smartViewClient.connect(ip, [connectListener])
Connects to a SmartView device

**Kind**: instance method of <code>[SmartViewClient](#SmartViewClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>string</code> | IP address or host name |
| [connectListener] | <code>function</code> | added as connect listener |

<a name="SmartViewClient+close"></a>
### smartViewClient.close()
Closes connection if connected

**Kind**: instance method of <code>[SmartViewClient](#SmartViewClient)</code>  
<a name="SmartViewClient+set"></a>
### smartViewClient.set(header, props, [callback])
Sends a command to the device

**Kind**: instance method of <code>[SmartViewClient](#SmartViewClient)</code>  
**Emits**: <code>[change](#SmartViewClient+event_change)</code>  

| Param | Type | Description |
| --- | --- | --- |
| header | <code>string</code> | the block header, e.g. 'MONITOR A' |
| props | <code>object</code> | the properties to set |
| [callback] | <code>function</code> | called when the device acknowledges the command |

<a name="SmartViewClient+get"></a>
### smartViewClient.get(header) ⇒ <code>object</code>
Returns the current state

**Kind**: instance method of <code>[SmartViewClient](#SmartViewClient)</code>  
**Returns**: <code>object</code> - props - the properties which are currently set  

| Param | Type | Description |
| --- | --- | --- |
| header | <code>string</code> | the block header, e.g. 'MONITOR A' |

<a name="SmartViewClient+event_connect"></a>
### "connect"
Connection established

**Kind**: event emitted by <code>[SmartViewClient](#SmartViewClient)</code>  
<a name="SmartViewClient+event_error"></a>
### "error" (error)
Error happened

**Kind**: event emitted by <code>[SmartViewClient](#SmartViewClient)</code>  

| Param | Type |
| --- | --- |
| error | <code>Error</code> | 

<a name="SmartViewClient+event_close"></a>
### "close"
Connection closed

**Kind**: event emitted by <code>[SmartViewClient](#SmartViewClient)</code>  
<a name="SmartViewClient+event_change"></a>
### "change" (header)
A state object has been changed.

**Kind**: event emitted by <code>[SmartViewClient](#SmartViewClient)</code>  

| Param | Type | Description |
| --- | --- | --- |
| header | <code>string</code> | the block header, e.g. 'MONITOR A' |

