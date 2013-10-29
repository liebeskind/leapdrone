var crypto = require('crypto');

var browser_fingerprint = {

	fingerprint: function(req, options, callback){
		// The goal is to come up with as many *potentially* unique traits for the connection and add them to the elementsHash.
		// The collection of all the elementsHash keys will *hopefully* be unique enough for fingerprinting
		// Then, we save this hash in a cookie for later retrieval

		var defaults = {
			cookieKey: "__browser_fingerprint",
			toSetCookie: true,
			onlyStaticElements: false,
		}

		if(typeof options == "function"){ callback = cookieKey; options = null; }
		for(var i in defaults){
			if(options[i] == null){ options[i] = defaults[i]; }
		}

		var cookies = this.parseCookies(req);
		if(cookies[options.cookieKey] != null){
			var fingerprint = cookies[options.cookieKey];
			callback(fingerprint, {clientCookie: fingerprint}, {});
		}else if(req.headers[options.cookieKey] != null){
			var fingerprint = req.headers['options.cookieKey'];
			callback(fingerprint, {clientCookie: fingerprint}, {});
		}else if(req.headers[('x-' + options.cookieKey).toLowerCase()] != null){
			var fingerprint = req.headers[('x-' + options.cookieKey).toLowerCase()];
			callback(fingerprint, {clientCookie: fingerprint}, {});
		}else{
			var remoteAddress = req.headers['x-forwarded-for'];
			if(remoteAddress == null){ var remoteAddress = req.connection.remoteAddress; }

			var elementsHash = {
				httpVersion: req.httpVersion,
				remoteAddress: remoteAddress,
				cookieKey: options.cookieKey,
			}

			// these elements add greater entropy to the fingerprint, but aren't gaurnteed to be the same uppon each request
			if(options.onlyStaticElements != true){
				elementsHash.remotePort = req.connection.remotePort;
				elementsHash.rand = Math.random();
				elementsHash.time = new Date().getTime();
			};

			for(var i in req.headers){
				var key = 'header_' + i;
				elementsHash[key] = req.headers[i];
			}
			elementsHash = this.sortAndStringObject(elementsHash);
			var fingerprint = this.calculateHashFromElemets(elementsHash);
			
			var cookeHash = {};
			if(options.toSetCookie == true){
				cookeHash = {'Set-Cookie': options.cookieKey + '=' + fingerprint };
			}

			callback(fingerprint, elementsHash, cookeHash);
		}
	},

	parseCookies: function(req){
		var cookies = {};
		if(req.headers.cookie != null){
			req.headers.cookie.split(';').forEach(function( cookie ) {
				var parts = cookie.split('=');
				cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
			});
		}
		return cookies;
	},

	calculateHashFromElemets: function(elementsHash){
		var shasum = crypto.createHash('sha1');
		for(var i in elementsHash){
			shasum.update(elementsHash[i]);
		}
		return shasum.digest('hex');
	},

	sortAndStringObject: function(o) {
		var sorted = {},
		key, a = [];
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				a.push(key);
			}
		}
		a.sort();
		for (key = 0; key < a.length; key++) {
			sorted[a[key]] = String(o[a[key]]);
		}
		return sorted;
	}

}

///////////////

module.exports = browser_fingerprint