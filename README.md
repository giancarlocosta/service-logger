# Service-Logger
> A simplified [Winston](https://github.com/winstonjs/winston) wrapper for microservices :)

--------------------------------------------------------------------------------
## Overview

This module is a wrapper around Winston meant to simplify, but not limit, how
business logic does its logging. The class exposed by this module provides
convenient functionality wrapped around basic Winston functionality that should
be needed by microservices in most cases. <br/><br/>
For special cases it also exposes the winston module itself and
the user can extend and interact with Winston as they would normally. However,
in these cases it is important that the user understands how to use Winston as
well as the source code in this project to avoid unexpected behavior.

--------------------------------------------------------------------------------
## Usage
<br/>
#### ! ! IMPORTANT ! !

Before using the logger, read all information below.

1. **process.env.LOG_LEVEL**<br/>
In order for the Logger to work as you intend, you should set the
`process.env.LOG_LEVEL` environment variable. It must be set to the maximum level
of messages you want the Logger to log. **The level should be one of the [RFC5424 syslog Severity level keywords](https://en.wikipedia.org/wiki/Syslog)**.
_All instances of this wrapper Logger class will use this value specified_.
  * If `LOG_LEVEL` not set, the Logger will only log levels `info` and higher.
  * If `LOG_LEVEL=*` everything will be logged. (`debug` and higher).
  * If `LOG_LEVEL=INFO` levels `info` and higher will be logged.
  * If `LOG_LEVEL=INFO,WARNING` you will get an error because you can only set one value.
<br/><br/>

2. **Request ID**<br/>
It can be useful to add a request ID to log entries to make tracking request
chains and debugging easier. This logger gives you 2 options for adding a request ID to
a log entry:
  * The [request-context](https://www.npmjs.com/package/request-context)
  node package is utilized by this Logger to add a request id to the log entry if
  if found in the request context `request:requestId` key.
  * Adding a `requestId` field to the metadata object of a log entry.
<br/><br/>
**See [Examples](#examples) below for log entries with request IDs included!**
<br/><br/>

3. **Log Source Path**<br/>
When instantiating the Loggers there is one argument to pass to the constructor: `sourcePath`.<br/>
This value will be used to show the source of the log statement, whether it be a filepath
or a custom value.<br/>
**It is recommended that you pass `__filename` (not a string, the Node __filename var!)** because the Logger will show
filepaths of the files producing the log statements relative to the root of the
application. If you specify something other than a valid filepath like __filename (e.g. 'my:custom:module:path'),
the logger will just display that instead.<br/>
_See [Examples](#examples) below_

#### How to Log

In each file you want to log in, instantiate a new logger.
```
const logger = new (require('service-logger'))(__filename);
```
_NOTE_: Regardless of how many times you instantiate loggers, only **one** static
Winston Logger will be created. This Winston logger will only log to the console (console Transport).
If you wish to add more Transports then you will need to get the
winston instance and the Winston Logger from this module. If this is necessary
then make sure you are familiar with the source code of this project as well as
[Winston](https://github.com/winstonjs/winston).
```
const winston = logger.getWinstonInstance();
const winstonLogger = logger.getWinstonLoggerInstance();
winstonLogger.add(winston.transports.File, {
  name: 'additional_transport_log_example',
  filename: 'additional_transport_log_example.log'
});
```

Use the Logger! From the source code documentation:
```
/**
Main logging function.
@param {string} level - RFC5424 syslog Severity level keyword to use
@param {string|Error} message - main log message or Error object
@param {Object} [metadata] - object containing any additional information
you wish to log
*/
log(level, message, metadata) {
     ...
}
```

#### Examples

At the top of each file you will use the logger in:
```
const logger = new (require('service-logger'))(__filename); // recommended!

or

const logger = new (require('service-logger'))('my:custom:module:path');
```

Logging a message:
```
logger.<RFC5424 syslog Severity level keyword>('Message');
```
<br/>
```
logger.info('Basic test');

> 2017-11-08T18:46:24.209Z - info - test/test.js - Basic test
```

Logging a message with a request id:
```
requestContext.set('request:requestId', 12345678) // this would be called at beginning of request using middleware
...
...
logger.notice(`Show the request id`, { otherMetadata: 'yay' });

> 2017-11-08T18:46:24.210Z - notice - test/test.js - 12345678 - Show the request id {"otherMetadata":"yay"}


-- OR --


logger.notice(`Show the request id`, { requestId: '12345678', otherMetadata: 'yay' });

> 2017-11-08T18:46:24.210Z - notice - test/test.js - 12345678 - Show the request id {"requestId":"12345678","otherMetadata":"yay"}
```

Logging an Error object
```
const appError = new Error('Uh oh!');

logger.err(appError);
```
