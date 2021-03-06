import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");

import { IndexRoute } from "./routes/index";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();

  }

  private ParseServer
  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    this.ParseServer = require('parse-server').ParseServer

    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //add routes
    this.routes();

    //add api
    this.api();
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
    //empty for now




  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    //add static paths
    var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

    if (!databaseUri) {
      console.log('DATABASE_URI not specified, falling back to localhost.');
    }


    var api = new this.ParseServer({
      databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
      cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
      appId: process.env.APP_ID || 'myAppId',
      masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
      serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
      liveQuery: {
        classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
      }
    });

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey


// Serve static assets from the /public folder
    this.app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
    var mountPath = process.env.PARSE_MOUNT || '/parse';
    this.app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
    this.app.get('/', function(req, res) {
      res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
    });

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
    this.app.get('/test', function(req, res) {
      res.sendFile(path.join(__dirname, '/public/test.html'));
    });


    //configure pug
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "pug");

    //mount logger
    this.app.use(logger("dev"));

    //mount json form parser
    this.app.use(bodyParser.json());

    //mount query string parser
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    //mount cookie parker
    this.app.use(cookieParser("SECRET_GOES_HERE"));

    //mount override?
    this.app.use(methodOverride());

    // catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        err.status = 404;
        next(err);
    });

    //error handling
    this.app.use(errorHandler());
  }

  public afterServerStart(httpServer){

// This will enable the Live Query real-time server
    this.ParseServer.createLiveQueryServer(httpServer);
  }

  /**
   * Create and return Router.
   *
   * @class Server
   * @method config
   * @return void
   */
  private routes() {
    let router: express.Router;
    router = express.Router();

    //IndexRoute
    IndexRoute.create(router);

    //use router middleware
    this.app.use(router);
  }

}