# Service-Logger
> A [Winston](https://github.com/winstonjs/winston) wrapper for microservices

--------------------------------------------------------------------------------
## Overview

This module is a wrapper around Winston meant to **simplify but not limit** how
business logic does its logging. The class exposed by this module only provides
convenient functionality wrapped around basic Winston functionality that should
be needed by microservices in most cases. <br/><br/>
For special cases it exposes the winston module itself and
the user can extend and interact with Winston as they would normally. However,
in these cases it is important that the user understands how to use Winston as
well as the source code in this project to avoid unexpected behavior.

--------------------------------------------------------------------------------
## Usage
<br/>
**~~ IMPORTANT ENV VARS ~~**

In order for the logger to work as you intend, you must set the following ENV
variables correctly:

- `process.env.PROJECT_ROOT`<br/>If this is set with the path of the root of the
project, the logger will use this to show filepaths of the files producing the
log statements relative to the root.
If this is not set, the logger will attempt to infer the project root by doing
the following:
  1. Assume that the service-logger package is somewhere in the project directory,
 (ideally in node_module)
  2. Get the path of the first module in the project to require('service-logger')
  3. Compare that path to path of the index.js file in the service-logger package
  4. The longest common beginning substring of these two paths will be used as the
the project root.

  For example, if the path of the index.js file in the service-logger package is:

  `/Users/gcosta/Desktop/Team/Projects/security-suite/security-service/node_modules/service-logger/index.js`

  and the first file that the package is required in is:

  `/Users/gcosta/Desktop/Team/Projects/security-suite/security-service/app.js`

  the longest common beginning substring is

  `/Users/gcosta/Desktop/Team/Projects/security-suite/security-service/`

  so this will be used as the project root and the `file` property in the logs
  will now contain the path of the file relative to the root path


- `process.env.LOG_LEVEL`<br/>This must be the maximum level of messages for the
Logger to log. The logger allows any of the levels in the RFC5424 syslog levels to
be used. By default all of them will be enabled (`debug` and higher) unless you
limit them. The value
<br/>If not set, the logger will only log levels `warning` and higher
<br/>If `LOG_LEVEL=*` everything will be logged. (`debug` and higher)
<br/>If `LOG_LEVEL=INFO` levels `INFO` and higher will be logged.
<br/>If `LOG_LEVEL=INFO,WARN` you will get an error because you can only set one value
Setting the `LOG_LEVEL` env variable is recommended and will be the levels used
by all instances of this wrapper Logger class.

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

3. Use the logger! From the source code documentation:
<br/>
/\*\*
 <br/>\* Special function for logging objects that are instances of 'Error' class
 <br/>\* @param {string} level - log level to use
 <br/>\* @param {string|Error Object} message - main log message or Error object
 <br/>\* @param {Object} [metadata] - object containing any additional information
 <br/>\*  you wish to log
 <br/>\*/
<br/>log(level, message, metadata) {
  <br/>
  ...
  <br/>
}
<br/>

##### Example Usage

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
