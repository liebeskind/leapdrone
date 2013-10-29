(function() {
  var express, path, drone, server, app, faye;

  express = require("express");
  path = require("path");
  faye = require('faye');
  app = express();
  app.configure(function() {
  	app.set('port', process.env.PORT || 3001); // process.env.PORT adjusts PORT to accept environmental parameter (ie deploying to Heroku)
  	app.use(app.router);  // optimizes performance when put before static, but isn't necessary as express will implicity add.  Putting before static prevents accidentally-named static files from overwriting routes
    app.use(express.static(__dirname + '/public'));  // serves static files from disk
  });

  server = require('http').createServer(app);

  server.listen(app.get('port'), function() {
  	return console.log("Express server listening on port" + app.get("port"));
  })

}).call(this);
