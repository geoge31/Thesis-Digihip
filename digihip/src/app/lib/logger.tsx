/**
 * This module sets up a logger using the Pino logging library.
 * It creates a log directory if it does not exist and logs messages 
 * to a file named `app.log`.
 * Usage : 
 * - Import and use the logger throughout the application to log messages, errors, and events.
 * Development mode
 * Path :
 * - /src/app/lib
 */

import pino from 'pino';
import path from 'path';
import fs from 'fs';

const logDirectory = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logFilePath = path.join(logDirectory, 'app.log');

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }, pino.destination(logFilePath));
  

export default logger;
