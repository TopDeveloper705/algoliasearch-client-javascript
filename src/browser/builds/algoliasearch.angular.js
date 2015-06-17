// This is the AngularJS Algolia Search module
// It's using $http to do requests with a JSONP fallback
// $q promises are returned

var inherits = require('inherits');

var AlgoliaSearch = require('../../AlgoliaSearch');
var errors = require('../../errors');
var inlineHeaders = require('../inline-headers');
var JSONPRequest = require('../JSONP-request');

// expose original algoliasearch fn in window
window.algoliasearch = require('./algoliasearch');

window.angular.module('algoliasearch', [])
  .service('algolia', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {

    function algoliasearch(applicationID, apiKey, opts) {
      var cloneDeep = require('lodash-compat/lang/cloneDeep');

      var getDocumentProtocol = require('../get-document-protocol');

      opts = cloneDeep(opts || {});

      if (opts.protocol === undefined) {
        opts.protocol = getDocumentProtocol();
      }

      opts._ua = opts._ua || algoliasearch.ua;

      return new AlgoliaSearchAngular(applicationID, apiKey, opts);
    }

    algoliasearch.version = require('../../version.json');
    algoliasearch.ua = 'Algolia for AngularJS ' + algoliasearch.version;

    // we expose into window no matter how we are used, this will allow
    // us to easily debug any website running algolia
    window.__algolia = {
      debug: require('debug'),
      algoliasearch: algoliasearch
    };

    function AlgoliaSearchAngular() {
      // call AlgoliaSearch constructor
      AlgoliaSearch.apply(this, arguments);
    }

    inherits(AlgoliaSearchAngular, AlgoliaSearch);

    AlgoliaSearchAngular.prototype._request = function(url, opts) {
      // Support most Angular.js versions by using $q.defer() instead
      // of the new $q() constructor everywhere we need a promise
      var deferred = $q.defer();
      var resolve = deferred.resolve;
      var reject = deferred.reject;

      var timedOut;
      var body = opts.body;

      url = inlineHeaders(url, opts.headers);

      var timeoutDeferred = $q.defer();
      var timeoutPromise = timeoutDeferred.promise;

      $timeout(function() {
        timedOut = true;
        // will cancel the xhr
        timeoutDeferred.resolve('test');
        reject(new errors.RequestTimeout());
      }, opts.timeout);

      var requestHeaders = {
        'accept': 'application/json'
      };

      if (body) {
        if (opts.method === 'POST') {
          // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Simple_requests
          requestHeaders['content-type'] = 'application/x-www-form-urlencoded';
        } else {
          requestHeaders['content-type'] = 'application/json';
        }
      }

      $http({
        url: url,
        method: opts.method,
        data: body,
        cache: false,
        timeout: timeoutPromise,
        headers: requestHeaders
      }).then(function success(response) {
        resolve({
          statusCode: response.status,
          headers: response.headers,
          body: response.data
        });
      }, function error(response) {
        if (timedOut) {
          return;
        }

        // network error
        if (response.status === 0) {
          reject(
            new errors.Network({
              more: response
            })
          );
          return;
        }

        resolve({
          body: response.data,
          statusCode: response.status
        });
      });

      return deferred.promise;
    };

    // using IE8 or IE9 we will always end up here
    // AngularJS does not fallback to XDomainRequest
    AlgoliaSearchAngular.prototype._request.fallback = function(url, opts) {
      url = inlineHeaders(url, opts.headers);

      var deferred = $q.defer();
      var resolve = deferred.resolve;
      var reject = deferred.reject;

      JSONPRequest(url, opts, function JSONPRequestDone(err, content) {
        if (err) {
          reject(err);
          return;
        }

        resolve(content);
      });

      return deferred.promise;
    };

    AlgoliaSearchAngular.prototype._promise = {
      reject: function(val) {
        return $q.reject(val);
      },
      resolve: function(val) {
        // http://www.bennadel.com/blog/2735-q-when-is-the-missing-q-resolve-method-in-angularjs.htm
        return $q.when(val);
      },
      delay: function(ms) {
        var deferred = $q.defer();
        var resolve = deferred.resolve;

        $timeout(resolve, ms);

        return deferred.promise;
      }
    };

    return {
      Client: function (applicationID, apiKey, options) {
        return algoliasearch(applicationID, apiKey, options);
      },
      ua: algoliasearch.ua,
      version: algoliasearch.version
    };
  }]);
