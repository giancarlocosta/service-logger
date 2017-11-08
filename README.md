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
of messages you want the Logger to log. **The level should be one of the _RFC5424_ syslog levels**.
_All instances of this wrapper Logger class will use this value specified_.
  * If `LOG_LEVEL` not set, the Logger will only log levels `warning` and higher.
  * If `LOG_LEVEL=*` everything will be logged. (`debug` and higher).
  * If `LOG_LEVEL=INFO` levels `info` and higher will be logged.
  * If `LOG_LEVEL=INFO,WARNING` you will get an error because you can only set one value.
<br/><br/>

2. **Request ID**<br/>
It can be useful to add a request ID to log entries to make tracking request
chains and debugging easier. This logger gives you 2 options for adding a request ID to
a log entry:
  1. The [request-context](https://www.npmjs.com/package/request-context)
  node package is utilized by this Logger to add a request id to the log entry if
  if found in the request context `request:requestId` key.
  2. Adding a `requestId` field to the metadata object of a log entry.
<br/><br/>
**See examples below for log entries with request IDs included!**
<br/><br/>

3. **Log Source File**<br/>
The Logger will show filepaths of the files producing the log statements
relative to the root of the application. The Logger will attempt to infer the
application root by doing the following:
  * Assume that the service-logger package is in node_modules
  * Get the path of the first module in the project to require('service-logger')
  * Compare that path to path of the index.js file in the service-logger package
  * The longest common beginning substring of these two paths will be used as
  the project/application root.
<br/><br/>
For example, if the path of the index.js file in the service-logger package is:<br/>
`/Users/gcosta/Projects/your-service/node_modules/service-logger/index.js`<br/>
and the first file that the package is required in is:<br/>
`/Users/gcosta/Projects/your-service/server.js`<br/>
the longest common beginning substring is<br/>
`/Users/gcosta/Projects/your-service/`<br/>
so this will be used as the project root and the logs
will now contain the path of the file relative to the root path.


#### How to Log

As early as possible in your app load/require the module (put near top of entry/main/index file!).
When you require this module, it will require 'winston' so winston will also
be initialized in the same way as if you were using winston without this module.
In the constructor of the new Logger class that you instantiate, pass the
file path of the current file. This will be used to show the source of log
statements from various files.
```
const logger = new (require('service-logger'))(__filename);
```
Out of the box this module uses **one** Winston Logger that only logs to the
console. If you wish to add more transports then you will need to get the
winston instance and the Winston Logger from this module. If this is necessary
then make sure you are familiar with the source code of this project as well as
[Winston](https://github.com/winstonjs/winston).
```
const logger = new (require('service-logger'))(__filename);
const winston = logger.getWinstonInstance();
const winstonLogger = logger.getWinstonLoggerInstance();
```
See test/ for more examples.

Use the Logger! From the source code documentation:
```
/*
Main logging function
@param {string} level - log level to use
@param {string|Error Object} message - main log message or Error object
@param {Object} [metadata] - object containing any additional information
you wish to log
*/
log(level, message, metadata) {
     ...
}
```

#### Example Usage

At the top of each file you will use the logger in:
```
const logger = new (require('service-logger'))(__filename);
```

Logging a message:
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

logger.warn(appError);
```
