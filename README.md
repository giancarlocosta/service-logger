# Service-Logger
> A [Winston](https://github.com/winstonjs/winston) wrapper for microservices

--------------------------------------------------------------------------------
## Overview

This module is a wrapper around Winston meant to simplify, but not limit, how
business logic does its logging. The class exposed by this module only provides
convenient functionality wrapped around basic Winston functionality that should
be needed by microservices in most cases. <br/><br/>
For special cases it also exposes the winston module itself and
the user can extend and interact with Winston as they would normally. However,
in these cases it is important that the user understands how to use Winston as
well as the source code in this project to avoid unexpected behavior.

--------------------------------------------------------------------------------
## Usage
<br/>
#### IMPORTANT ENVIRONMENT VARS

In order for the Logger to work as you intend, you should set the following environment
variables:

* `process.env.LOG_LEVEL`<br/>
This must be the maximum level of messages for the
Logger to log. The Logger allows any of the levels in the RFC5424 syslog levels to
be used. _All instances of this wrapper Logger class will use the levels specified_.
  * If `LOG_LEVEL` not set, the Logger will only log levels `warning` and higher.
  * If `LOG_LEVEL=*` everything will be logged. (`debug` and higher).
  * If `LOG_LEVEL=INFO` levels `INFO` and higher will be logged.
  * If `LOG_LEVEL=INFO,WARN` you will get an error because you can only set one value.


* `process.env.PROJECT_ROOT` (optional)<br/>
If this is set with the path of the root of the
project, the Logger will use this to show filepaths of the files producing the
log statements relative to the root.
If this is not set, the Logger will attempt to infer the project root by doing
the following:
  1. Assume that the service-logger package is somewhere in the project directory,
 (ideally in node_module)
  2. Get the path of the first module in the project to require('service-logger')
  3. Compare that path to path of the index.js file in the service-logger package
  4. The longest common beginning substring of these two paths will be used as the
the project root.

  For example, if the path of the index.js file in the service-logger package is:<br/>
  `/Users/gcosta/Projects/your-service/node_modules/service-logger/index.js`<br/>
  and the first file that the package is required in is:<br/>
  `/Users/gcosta/Projects/your-service/server.js`<br/>
  the longest common beginning substring is<br/>
  `/Users/gcosta/Projects/your-service/`<br/>
  so this will be used as the project root and the `file` property in the logs
  will now contain the path of the file relative to the root path


#### How to Log

1. First set your env vars correctly as described above
2. As early as possible in your app load/require the module.
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
winston instance and the Winston Logger from this module using:
```
const logger = new (require('service-logger'))(__filename);
const winston = logger.getWinstonInstance();
const winstonLogger = logger.getWinstonLoggerInstance();
```
See test/ for more examples.<br/>
Again, this is not recommended but if it is necessary then make sure you are
familiar with the source code of this project as well as
[Winston](https://github.com/winstonjs/winston)

3. Use the Logger! From the source code documentation:
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

Logging a message
```
logger.info('This is the message to be logged', {
  some: 'more data',
  here: 'as you need it'
});
```

or

```
logger.log('info', 'This is the message to be logged', {
  some: 'more data',
  here: 'as you need it'
});
```

Logging an Error object
```
const appError = new Error('Uh oh!');

logger.warn(appError);
```
