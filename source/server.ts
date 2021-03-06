import http from 'http';
// @ts-ignore
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import robotRoutes from './routes/robot';
import battleRoutes from './routes/battle';
import mongoose from 'mongoose';
//@ts-ignore
import { NextFunction, Request, Response } from 'express';

const NAMESPACE = 'Server';
const router = express();

// connect to mongo
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then((result) => {
        logging.info(NAMESPACE, 'Mongo Connected');
    })
    .catch((error) => {
        logging.error(NAMESPACE, error.mesage, error);
    });

// logging request
router.use((req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);
    res.on('finish', () => {
        logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`);
    });
    next();
});

//   Parse the request
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

//  API Rules
router.use((req: Request, res: Response, next: NextFunction) => {
    // Access-Control-Allow-Origin is only for development purposes (it allows requests to come from anywhere). All routes and ips should be predefined in production!!!
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

/** Routes go here */
router.use('/api/robots', robotRoutes);
router.use('/api/battles', battleRoutes);

/** Error handling */
router.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

const httpServer = http.createServer(router);

httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server is running ${config.server.hostname}:${config.server.port}`));
