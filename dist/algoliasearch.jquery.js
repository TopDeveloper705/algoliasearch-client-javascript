/*! algoliasearch 3.2.4 | © 2014, 2015 Algolia SAS | github.com/algolia/algoliasearch-client-js */
(function(f){var g;if(typeof window!=='undefined'){g=window}else if(typeof self!=='undefined'){g=self}g.ALGOLIA_MIGRATION_LAYER=f()})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = function load (src, opts, cb) {
  var head = document.head || document.getElementsByTagName('head')[0]
  var script = document.createElement('script')

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  cb = cb || function() {}

  script.type = opts.type || 'text/javascript'
  script.charset = opts.charset || 'utf8';
  script.async = 'async' in opts ? !!opts.async : true
  script.src = src

  if (opts.attrs) {
    setAttributes(script, opts.attrs)
  }

  if (opts.text) {
    script.text = '' + opts.text
  }

  var onend = 'onload' in script ? stdOnEnd : ieOnEnd
  onend(script, cb)

  // some good legacy browsers (firefox) fail the 'in' detection above
  // so as a fallback we always set onload
  // old IE will ignore this and new IE will set onload
  if (!script.onload) {
    stdOnEnd(script, cb);
  }

  head.appendChild(script)
}

function setAttributes(script, attrs) {
  for (var attr in attrs) {
    script.setAttribute(attr, attrs[attr]);
  }
}

function stdOnEnd (script, cb) {
  script.onload = function () {
    this.onerror = this.onload = null
    cb(null, script)
  }
  script.onerror = function () {
    // this.onload = null here is necessary
    // because even IE9 works not like others
    this.onerror = this.onload = null
    cb(new Error('Failed to load ' + this.src), script)
  }
}

function ieOnEnd (script, cb) {
  script.onreadystatechange = function () {
    if (this.readyState != 'complete' && this.readyState != 'loaded') return
    this.onreadystatechange = null
    cb(null, script) // there is no way to catch loading errors in IE8
  }
}

},{}],2:[function(require,module,exports){
// this module helps finding if the current page is using
// the cdn.jsdelivr.net/algoliasearch/latest/$BUILDNAME.min.js version

module.exports = isUsingLatest;

function isUsingLatest(buildName) {
  var toFind = new RegExp('cdn\\.jsdelivr\\.net/algoliasearch/latest/' +
    buildName.replace('.', '\\.') + // algoliasearch, algoliasearch.angular
    '(?:\\.min)?\\.js$'); // [.min].js

  var scripts = document.getElementsByTagName('script');
  var found = false;
  for (var currentScript = 0, nbScripts = scripts.length;
        currentScript < nbScripts;
        currentScript++) {
    if (scripts[currentScript].src && toFind.test(scripts[currentScript].src)) {
      found = true;
      break;
    }
  }

  return found;
}

},{}],3:[function(require,module,exports){
(function (global){
module.exports = loadV2;

function loadV2(buildName) {
  var loadScript = require(1);
  var v2ScriptUrl = '//cdn.jsdelivr.net/algoliasearch/2/' + buildName + '.min.js';

  var message =
    '-- AlgoliaSearch `latest` warning --\n' +
    'Warning, you are using the `latest` version string from jsDelivr to load the AlgoliaSearch library.\n' +
    'Using `latest` is no more recommended, you should load //cdn.jsdelivr.net/algoliasearch/2/algoliasearch.min.js\n\n' +
    'Also, we updated the AlgoliaSearch JavaScript client to V3. If you want to upgrade,\n' +
    'please read our migration guide at https://github.com/algolia/algoliasearch-client-js/wiki/Migration-guide-from-2.x.x-to-3.x.x\n' +
    '-- /AlgoliaSearch  `latest` warning --';

  if (global.console) {
    if (global.console.warn) {
      global.console.warn(message);
    } else if (global.console.log) {
      global.console.log(message);
    }
  }

  // If current script loaded asynchronously,
  // it will load the script with DOMElement
  // otherwise, it will load the script with document.write
  try {
    // why \x3c? http://stackoverflow.com/a/236106/147079
    document.write('\x3Cscript>window.ALGOLIA_SUPPORTS_DOCWRITE = true\x3C/script>');

    if (global.ALGOLIA_SUPPORTS_DOCWRITE === true) {
      document.write('\x3Cscript src="' + v2ScriptUrl + '">\x3C/script>');
      scriptLoaded('document.write')();
    } else {
      loadScript(v2ScriptUrl, scriptLoaded('DOMElement'));
    }
  } catch(e) {
    loadScript(v2ScriptUrl, scriptLoaded('DOMElement'));
  }
}

function scriptLoaded(method) {
  return function log() {
    var message = 'AlgoliaSearch: loaded V2 script using ' + method;

    global.console && global.console.log && global.console.log(message);
  };
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"1":1}],4:[function(require,module,exports){
(function (global){
/*global AlgoliaExplainResults:true*/
/*eslint no-unused-vars: [2, {"vars": "local"}]*/

module.exports = oldGlobals;

// put old window.AlgoliaSearch.. into window. again so that
// users upgrading to V3 without changing their code, will be warned
function oldGlobals() {
  var message =
    '-- AlgoliaSearch V2 => V3 error --\n' +
    'You are trying to use a new version of the AlgoliaSearch JavaScript client with an old notation.\n' +
    'Please read our migration guide at https://github.com/algolia/algoliasearch-client-js/wiki/Migration-guide-from-2.x.x-to-3.x.x\n' +
    '-- /AlgoliaSearch V2 => V3 error --';

  global.AlgoliaSearch = function() {
    throw new Error(message);
  };

  global.AlgoliaSearchHelper = function() {
    throw new Error(message);
  };

  // cannot use window.AlgoliaExplainResults on old IEs, dunno why
  AlgoliaExplainResults = function() {
    throw new Error(message);
  };
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
// This script will be browserified and prepended to the normal build
// directly in window, not wrapped in any module definition
// To avoid cases where we are loaded with /latest/ along with
migrationLayer("algoliasearch.jquery");

// Now onto the V2 related code:
//  If the client is using /latest/$BUILDNAME.min.js, load V2 of the library
//
//  Otherwise, setup a migration layer that will throw on old constructors like
//  new AlgoliaSearch().
//  So that users upgrading from v2 to v3 will have a clear information
//  message on what to do if they did not read the migration guide
function migrationLayer(buildName) {
  var isUsingLatest = require(2);
  var loadV2 = require(3);
  var oldGlobals = require(4);

  if (isUsingLatest(buildName)) {
    loadV2(buildName);
  } else {
    oldGlobals();
  }
}

},{"2":2,"3":3,"4":4}]},{},[5])(5)
});(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],4:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require(2);
exports.encode = exports.stringify = require(3);

},{"2":2,"3":3}],5:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require(6);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"6":6}],6:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require(7);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"7":7}],7:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],8:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isArray = require(9);

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toString.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{"9":9}],9:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],10:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],11:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],12:[function(require,module,exports){
(function (process){
module.exports = AlgoliaSearch;

// default debug activated in dev environments
// this is triggered in package.json, using the envify transform
if (process.env.NODE_ENV === 'development') {
  require(5).enable('algoliasearch*');
}

var debug = require(5)('algoliasearch');
var foreach = require(10);

/*
 * Algolia Search library initialization
 * https://www.algolia.com/
 *
 * @param {string} applicationID - Your applicationID, found in your dashboard
 * @param {string} apiKey - Your API key, found in your dashboard
 * @param {Object} [opts]
 * @param {number} [opts.timeout=2000] - The request timeout set in milliseconds, another request will be issued after this timeout
 * @param {string} [opts.protocol='http:'] - The protocol used to query Algolia Search API.
 *                                        Set to 'https:' to force using https. Default to document.location.protocol in browsers
 * @param {string[]} [opts.hosts=[
 *          this.applicationID + '-1.algolianet.com',
 *          this.applicationID + '-2.algolianet.com',
 *          this.applicationID + '-3.algolianet.com']
 *        ] - The hosts to use for Algolia Search API. If you provide them, you will no more benefit from our HA implementation
 */
function AlgoliaSearch(applicationID, apiKey, opts) {
  var extend = require(8);

  var usage = 'Usage: algoliasearch(applicationID, apiKey, opts)';

  if (!applicationID) {
    throw new Error('algoliasearch: Please provide an application ID. ' + usage);
  }

  if (!apiKey) {
    throw new Error('algoliasearch: Please provide an API key. ' + usage);
  }

  this.applicationID = applicationID;
  this.apiKey = apiKey;

  var defaultHosts = [
    this.applicationID + '-1.algolianet.com',
    this.applicationID + '-2.algolianet.com',
    this.applicationID + '-3.algolianet.com'
  ];
  this.hosts = {
    read: [],
    write: []
  };

  this.hostIndex = {
    read: 0,
    write: 0
  };

  opts = opts || {};

  var protocol = opts.protocol || 'https:';
  var timeout = opts.timeout === undefined ? 2000 : opts.timeout;

  // while we advocate for colon-at-the-end values: 'http:' for `opts.protocol`
  // we also accept `http` and `https`. It's a common error.
  if (!/:$/.test(protocol)) {
    protocol = protocol + ':';
  }

  if (opts.protocol !== 'http:' && opts.protocol !== 'https:') {
    throw new Error('algoliasearch: protocol must be `http:` or `https:` (was `' + opts.protocol + '`)');
  }

  // no hosts given, add defaults
  if (!opts.hosts) {
    this.hosts.read = [this.applicationID + '-dsn.algolia.net'].concat(defaultHosts);
    this.hosts.write = [this.applicationID + '.algolia.net'].concat(defaultHosts);
  } else {
    this.hosts.read = extend([], opts.hosts);
    this.hosts.write = extend([], opts.hosts);
  }

  // add protocol and lowercase hosts
  this.hosts.read = map(this.hosts.read, prepareHost(protocol));
  this.hosts.write = map(this.hosts.write, prepareHost(protocol));
  this.requestTimeout = timeout;

  this.extraHeaders = [];
  this.cache = {};

  this._ua = opts._ua;
  this._useCache = opts._useCache === undefined ? true : opts._useCache;

  this._setTimeout = opts._setTimeout;

  debug('init done, %j', this);
}

AlgoliaSearch.prototype = {
  /*
   * Delete an index
   *
   * @param indexName the name of index to delete
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer that contains the task ID
   */
  deleteIndex: function(indexName, callback) {
    return this._jsonRequest({ method: 'DELETE',
              url: '/1/indexes/' + encodeURIComponent(indexName),
              hostType: 'write',
              callback: callback });
  },
  /**
   * Move an existing index.
   * @param srcIndexName the name of index to copy.
   * @param dstIndexName the new index name that will contains a copy of srcIndexName (destination will be overriten if it already exist).
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer that contains the task ID
   */
  moveIndex: function(srcIndexName, dstIndexName, callback) {
    var postObj = {operation: 'move', destination: dstIndexName};
    return this._jsonRequest({ method: 'POST',
              url: '/1/indexes/' + encodeURIComponent(srcIndexName) + '/operation',
              body: postObj,
              hostType: 'write',
              callback: callback });

  },
  /**
   * Copy an existing index.
   * @param srcIndexName the name of index to copy.
   * @param dstIndexName the new index name that will contains a copy of srcIndexName (destination will be overriten if it already exist).
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer that contains the task ID
   */
  copyIndex: function(srcIndexName, dstIndexName, callback) {
    var postObj = {operation: 'copy', destination: dstIndexName};
    return this._jsonRequest({ method: 'POST',
              url: '/1/indexes/' + encodeURIComponent(srcIndexName) + '/operation',
              body: postObj,
              hostType: 'write',
              callback: callback });
  },
  /**
   * Return last log entries.
   * @param offset Specify the first entry to retrieve (0-based, 0 is the most recent log entry).
   * @param length Specify the maximum number of entries to retrieve starting at offset. Maximum allowed value: 1000.
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer that contains the task ID
   */
  getLogs: function(offset, length, callback) {
    if (arguments.length === 0 || typeof offset === 'function') {
      // getLogs([cb])
      callback = offset;
      offset = 0;
      length = 10;
    } else if (arguments.length === 1 || typeof length === 'function') {
      // getLogs(1, [cb)]
      callback = length;
      length = 10;
    }

    return this._jsonRequest({ method: 'GET',
              url: '/1/logs?offset=' + offset + '&length=' + length,
              hostType: 'read',
              callback: callback });
  },
  /*
   * List all existing indexes (paginated)
   *
   * @param page The page to retrieve, starting at 0.
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer with index list
   */
  listIndexes: function(page, callback) {
    var params = '';

    if (page === undefined || typeof page === 'function') {
      callback = page;
    } else {
      params = '?page=' + page;
    }

    return this._jsonRequest({ method: 'GET',
              url: '/1/indexes' + params,
              hostType: 'read',
              callback: callback });
  },

  /*
   * Get the index object initialized
   *
   * @param indexName the name of index
   * @param callback the result callback with one argument (the Index instance)
   */
  initIndex: function(indexName) {
    return new this.Index(this, indexName);
  },
  /*
   * List all existing user keys with their associated ACLs
   *
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer with user keys list
   */
  listUserKeys: function(callback) {
    return this._jsonRequest({ method: 'GET',
              url: '/1/keys',
              hostType: 'read',
              callback: callback });
  },
  /*
   * Get ACL of a user key
   *
   * @param key
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer with user keys list
   */
  getUserKeyACL: function(key, callback) {
    return this._jsonRequest({ method: 'GET',
              url: '/1/keys/' + key,
              hostType: 'read',
              callback: callback });
  },
  /*
   * Delete an existing user key
   * @param key
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer with user keys list
   */
  deleteUserKey: function(key, callback) {
    return this._jsonRequest({ method: 'DELETE',
              url: '/1/keys/' + key,
              hostType: 'write',
              callback: callback });
  },
  /*
   * Add an existing user key
   *
   * @param {string[]} acls - The list of ACL for this key. Defined by an array of strings that
   *   can contains the following values:
   *     - search: allow to search (https and http)
   *     - addObject: allows to add/update an object in the index (https only)
   *     - deleteObject : allows to delete an existing object (https only)
   *     - deleteIndex : allows to delete index content (https only)
   *     - settings : allows to get index settings (https only)
   *     - editSettings : allows to change index settings (https only)
   * @param {Object} [params] - Optionnal parameters to set for the key
   * @param {number} params.validity - Number of seconds after which the key will be automatically removed (0 means no time limit for this key)
   * @param {number} params.maxQueriesPerIPPerHour - Number of API calls allowed from an IP address per hour
   * @param {number} params.maxHitsPerQuery - Number of hits this API key can retrieve in one call
   * @param {string[]} params.indexes - Allowed targeted indexes for this key
   * @param {Function} callback - The result callback called with two arguments
   *   error: null or Error('message')
   *   content: the server answer with user keys list
   * @return {Promise|undefined} Returns a promise if no callback given
   */
  addUserKey: function(acls, params, callback) {
    if (arguments.length === 1 || typeof params === 'function') {
      callback = params;
      params = null;
    }

    var postObj = {
      acl: acls
    };

    if (params) {
      postObj.validity = params.validity;
      postObj.maxQueriesPerIPPerHour = params.maxQueriesPerIPPerHour;
      postObj.maxHitsPerQuery = params.maxHitsPerQuery;
      postObj.indexes = params.indexes;
    }

    return this._jsonRequest({
      method: 'POST',
      url: '/1/keys',
      body: postObj,
      hostType: 'write',
      callback: callback
    });
  },
  /**
   * Add an existing user key
   * @deprecated Please use client.addUserKey()
   */
  addUserKeyWithValidity: deprecate(function(acls, params, callback) {
    return this.addUserKey(acls, params, callback);
  }, deprecatedMessage('client.addUserKeyWithValidity()', 'client.addUserKey()')),

  /**
   * Update an existing user key
   * @param {string} key - The key to update
   * @param {string[]} acls - The list of ACL for this key. Defined by an array of strings that
   *   can contains the following values:
   *     - search: allow to search (https and http)
   *     - addObject: allows to add/update an object in the index (https only)
   *     - deleteObject : allows to delete an existing object (https only)
   *     - deleteIndex : allows to delete index content (https only)
   *     - settings : allows to get index settings (https only)
   *     - editSettings : allows to change index settings (https only)
   * @param {Object} [params] - Optionnal parameters to set for the key
   * @param {number} params.validity - Number of seconds after which the key will be automatically removed (0 means no time limit for this key)
   * @param {number} params.maxQueriesPerIPPerHour - Number of API calls allowed from an IP address per hour
   * @param {number} params.maxHitsPerQuery - Number of hits this API key can retrieve in one call
   * @param {string[]} params.indexes - Allowed targeted indexes for this key
   * @param {Function} callback - The result callback called with two arguments
   *   error: null or Error('message')
   *   content: the server answer with user keys list
   * @return {Promise|undefined} Returns a promise if no callback given
   */
  updateUserKey: function(key, acls, params, callback) {
    if (arguments.length === 2 || typeof params === 'function') {
      callback = params;
      params = null;
    }

    var putObj = {
      acl: acls
    };

    if (params) {
      putObj.validity = params.validity;
      putObj.maxQueriesPerIPPerHour = params.maxQueriesPerIPPerHour;
      putObj.maxHitsPerQuery = params.maxHitsPerQuery;
      putObj.indexes = params.indexes;
    }

    return this._jsonRequest({
      method: 'PUT',
      url: '/1/keys/' + key,
      body: putObj,
      hostType: 'write',
      callback: callback
    });
  },

  /**
   * Set the extra security tagFilters header
   * @param {string|array} tags The list of tags defining the current security filters
   */
  setSecurityTags: function(tags) {
    if (Object.prototype.toString.call(tags) === '[object Array]') {
      var strTags = [];
      for (var i = 0; i < tags.length; ++i) {
        if (Object.prototype.toString.call(tags[i]) === '[object Array]') {
          var oredTags = [];
          for (var j = 0; j < tags[i].length; ++j) {
            oredTags.push(tags[i][j]);
          }
          strTags.push('(' + oredTags.join(',') + ')');
        } else {
          strTags.push(tags[i]);
        }
      }
      tags = strTags.join(',');
    }

    this.securityTags = tags;
  },

  /**
   * Set the extra user token header
   * @param {string} userToken The token identifying a uniq user (used to apply rate limits)
   */
  setUserToken: function(userToken) {
    this.userToken = userToken;
  },

  /**
   * Initialize a new batch of search queries
   * @deprecated use client.search()
   */
  startQueriesBatch: deprecate(function() {
    this._batch = [];
  }, deprecatedMessage('client.startQueriesBatch()', 'client.search()')),

  /**
   * Add a search query in the batch
   * @deprecated use client.search()
   */
  addQueryInBatch: deprecate(function(indexName, query, args) {
    this._batch.push({
      indexName: indexName,
      query: query,
      params: args
    });
  }, deprecatedMessage('client.addQueryInBatch()', 'client.search()')),

  /**
   * Clear all queries in client's cache
   * @return undefined
   */
  clearCache: function() {
    this.cache = {};
  },

  /**
   * Launch the batch of queries using XMLHttpRequest.
   * @deprecated use client.search()
   */
  sendQueriesBatch: deprecate(function(callback) {
    return this.search(this._batch, callback);
  }, deprecatedMessage('client.sendQueriesBatch()', 'client.search()')),

   /**
   * Set the number of milliseconds a request can take before automatically being terminated.
   *
   * @param {Number} milliseconds
   */
  setRequestTimeout: function(milliseconds) {
    if (milliseconds) {
      this.requestTimeout = parseInt(milliseconds, 10);
    }
  },

  /**
   * Search through multiple indices at the same time
   * @param  {Object[]}   queries  An array of queries you want to run.
   * @param {string} queries[].indexName The index name you want to target
   * @param {string} [queries[].query] The query to issue on this index. Can also be passed into `params`
   * @param {Object} queries[].params Any search param like hitsPerPage, ..
   * @param  {Function} callback Callback to be called
   * @return {Promise|undefined} Returns a promise if no callback given
   */
  search: function(queries, callback) {
    var client = this;

    var postObj = {
      requests: map(queries, function prepareRequest(query) {
        var params = '';

        // allow query.query
        // so we are mimicing the index.search(query, params) method
        // {indexName:, query:, params:}
        if (query.query !== undefined) {
          params += 'query=' + encodeURIComponent(query.query)
        }

        return {
          indexName: query.indexName,
          params: client._getSearchParams(query.params, params)
        };
      })
    };

    return this._jsonRequest({
      cache: this.cache,
      method: 'POST',
      url: '/1/indexes/*/queries',
      body: postObj,
      hostType: 'read',
      callback: callback
    });
  },

  // environment specific methods
  destroy: notImplemented,
  enableRateLimitForward: notImplemented,
  disableRateLimitForward: notImplemented,
  useSecuredAPIKey: notImplemented,
  disableSecuredAPIKey: notImplemented,
  generateSecuredApiKey: notImplemented,
  /*
   * Index class constructor.
   * You should not use this method directly but use initIndex() function
   */
  Index: function(algoliasearch, indexName) {
    this.indexName = indexName;
    this.as = algoliasearch;
    this.typeAheadArgs = null;
    this.typeAheadValueOption = null;

    // make sure every index instance has it's own cache
    this.cache = {};
  },
   /**
   * Add an extra field to the HTTP request
   *
   * @param name the header field name
   * @param value the header field value
   */
  setExtraHeader: function(name, value) {
    this.extraHeaders.push({ name: name.toLowerCase(), value: value});
  },

  _sendQueriesBatch: function(params, callback) {
    return this._jsonRequest({ cache: this.cache,
      method: 'POST',
      url: '/1/indexes/*/queries',
      body: params,
      hostType: 'read',
      fallback: {
        method: 'GET',
        url: '/1/indexes/*',
        body: {params: (function() {
          var reqParams = '';
          for (var i = 0; i < params.requests.length; ++i) {
            var q = '/1/indexes/' + encodeURIComponent(params.requests[i].indexName) + '?' + params.requests[i].params;
            reqParams += i + '=' + encodeURIComponent(q) + '&';
          }
          return reqParams;
        }())}
      },
      callback: callback
    });
  },
  /*
   * Wrapper that try all hosts to maximize the quality of service
   */
  _jsonRequest: function(opts) {
    var requestDebug = require(5)('algoliasearch:' + opts.url);

    var body;
    var cache = opts.cache;
    var client = this;
    var tries = 0;
    var usingFallback = false;

    if (opts.body !== undefined) {
      body = JSON.stringify(opts.body);
    }

    requestDebug('request start');

    function doRequest(requester, reqOpts) {
      var cacheID;

      if (client._useCache) {
        cacheID = opts.url;
      }

      // as we sometime use POST requests to pass parameters (like query='aa'),
      // the cacheID must also include the body to be different between calls
      if (client._useCache && body) {
        cacheID += '_body_' + reqOpts.body;
      }

      // handle cache existence
      if (client._useCache && cache && cache[cacheID] !== undefined) {
        requestDebug('serving response from cache');
        return client._promise.resolve(cache[cacheID]);
      }

      if (tries >= client.hosts[opts.hostType].length) {
        if (!opts.fallback || !client._request.fallback || usingFallback) {
          // could not get a response even using the fallback if one was available
          return client._promise.reject(new Error(
            'Cannot connect to the AlgoliaSearch API.' +
            ' Send an email to support@algolia.com to report and resolve the issue.'
          ));
        }

        // let's try the fallback starting from here
        tries = 0;

        // method, url and body are fallback dependent
        reqOpts.method = opts.fallback.method;
        reqOpts.url = opts.fallback.url;
        reqOpts.jsonBody = opts.fallback.body;
        if (reqOpts.jsonBody) {
          reqOpts.body = JSON.stringify(opts.fallback.body);
        }

        reqOpts.timeout = client.requestTimeout * (tries + 1);
        client.hostIndex[opts.hostType] = 0;
        client.useFallback = true; // now we will only use JSONP, even on future requests
        usingFallback = true; // the current request is now using fallback
        return doRequest(client._request.fallback, reqOpts);
      }

      // `requester` is any of this._request or this._request.fallback
      // thus it needs to be called using the client as context
      return requester.call(client,
        // http(s)://currenthost/url(?qs)
        client.hosts[opts.hostType][client.hostIndex[opts.hostType]] + reqOpts.url, {
          body: body,
          jsonBody: opts.body,
          method: reqOpts.method,
          headers: client._computeRequestHeaders(),
          timeout: reqOpts.timeout,
          debug: requestDebug
        }
      )
      .then(function success(httpResponse) {
        // timeout case, retry immediately
        if (httpResponse instanceof Error) {
          requestDebug('error: %s', httpResponse.message);
          return retryRequest();
        }

        requestDebug('received response: %j', httpResponse);

        var status =
          // When in browser mode, using XDR or JSONP
          // We rely on our own API response `status`, only
          // provided when an error occurs, we also expect a .message along
          // Otherwise, it could be a `waitTask` status, that's the only
          // case where we have a response.status that's not the http statusCode
          httpResponse && httpResponse.body && httpResponse.body.message && httpResponse.body.status ||

          // this is important to check the request statusCode AFTER the body eventual
          // statusCode because some implementations (jQuery XDomainRequest transport) may
          // send statusCode 200 while we had an error
          httpResponse.statusCode ||

          // When in browser mode, using XDR or JSONP
          // we default to success when no error (no response.status && response.message)
          // If there was a JSON.parse() error then body is null and it fails
          httpResponse && httpResponse.body && 200;

        var ok = status === 200 || status === 201;
        var retry = !ok && Math.floor(status / 100) !== 4 && Math.floor(status / 100) !== 1;

        if (client._useCache && ok && cache) {
          cache[cacheID] = httpResponse.body;
        }

        if (ok) {
          return httpResponse.body;
        }

        if (retry) {
          return retryRequest();
        }

        var unrecoverableError = new Error(
          httpResponse.body && httpResponse.body.message || 'Unknown error'
        );

        return client._promise.reject(unrecoverableError);
      }, tryFallback);

      function retryRequest() {
        client.hostIndex[opts.hostType] = ++client.hostIndex[opts.hostType] % client.hosts[opts.hostType].length;
        tries += 1;
        reqOpts.timeout = client.requestTimeout * (tries + 1);
        return doRequest(requester, reqOpts);
      }

      function tryFallback(err) {
        // error cases:
        //  While not in fallback mode:
        //    - CORS not supported
        //    - network error
        //  While in fallback mode:
        //    - timeout
        //    - network error
        //    - badly formatted JSONP (script loaded, did not call our callback)
        //  In both cases:
        //    - uncaught exception occurs (TypeError)
        requestDebug('error: %s, stack: %s', err.message, err.stack);

        // we were not using the fallback, try now
        // if we are switching to fallback right now, set tries to maximum
        if (!client.useFallback) {
          // next time doRequest is called, simulate we tried all hosts,
          // this will force to use the fallback
          tries = client.hosts[opts.hostType].length;
        } else {
          // we were already using the fallback, but something went wrong (script error)
          client.hostIndex[opts.hostType] = ++client.hostIndex[opts.hostType] % client.hosts[opts.hostType].length;
          tries += 1;
        }

        return doRequest(requester, reqOpts);
      }
    }

    // we can use a fallback if forced AND fallback parameters are available
    var useFallback = client.useFallback && opts.fallback;
    var requestOptions = useFallback ? opts.fallback : opts;

    var promise = doRequest(
      // set the requester
      useFallback ? client._request.fallback : client._request, {
        url: requestOptions.url,
        method: requestOptions.method,
        body: body,
        jsonBody: opts.body,
        timeout: client.requestTimeout * (tries + 1)
      }
    );

    // either we have a callback
    // either we are using promises
    if (opts.callback) {
      promise.then(function okCb(content) {
        exitPromise(function() {
          opts.callback(null, content);
        }, client._setTimeout || setTimeout);
      }, function nookCb(err) {
        exitPromise(function() {
          opts.callback(err);
        }, client._setTimeout || setTimeout);
      });
    } else {
      return promise;
    }
  },

   /*
   * Transform search param object in query string
   */
  _getSearchParams: function(args, params) {
    if (this._isUndefined(args) || args === null) {
      return params;
    }
    for (var key in args) {
      if (key !== null && args.hasOwnProperty(key)) {
        params += params === '' ? '' : '&';
        params += key + '=' + encodeURIComponent(Object.prototype.toString.call(args[key]) === '[object Array]' ? JSON.stringify(args[key]) : args[key]);
      }
    }
    return params;
  },

  _isUndefined: function(obj) {
    return obj === void 0;
  },

  _computeRequestHeaders: function() {
    var requestHeaders = {
      'x-algolia-api-key': this.apiKey,
      'x-algolia-application-id': this.applicationID,
      'x-user-agent': this._ua
    };

    if (this.userToken) {
      requestHeaders['x-algolia-usertoken'] = this.userToken;
    }

    if (this.securityTags) {
      requestHeaders['x-algolia-tagfilters'] = this.securityTags;
    }

    if (this.extraHeaders) {
      foreach(this.extraHeaders, function addToRequestHeaders(header) {
        requestHeaders[header.name] = header.value;
      });
    }

    return requestHeaders;
  }
};

/*
 * Contains all the functions related to one index
 * You should use AlgoliaSearch.initIndex(indexName) to retrieve this object
 */
AlgoliaSearch.prototype.Index.prototype = {
  /*
   * Clear all queries in cache
   */
  clearCache: function() {
    this.cache = {};
  },
  /*
   * Add an object in this index
   *
   * @param content contains the javascript object to add inside the index
   * @param objectID (optional) an objectID you want to attribute to this object
   * (if the attribute already exist the old object will be overwrite)
   * @param callback (optional) the result callback called with two arguments:
   *  error: null or Error('message')
   *  content: the server answer that contains 3 elements: createAt, taskId and objectID
   */
  addObject: function(content, objectID, callback) {
    var indexObj = this;

    if (arguments.length === 1 || typeof objectID === 'function') {
      callback = objectID;
      objectID = undefined;
    }

    return this.as._jsonRequest({
      method: objectID !== undefined ?
        'PUT' : // update or create
        'POST', // create (API generates an objectID)
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + // create
        (objectID !== undefined ? '/' + encodeURIComponent(objectID) : ''), // update or create
      body: content,
      hostType: 'write',
      callback: callback
    });
  },
  /*
   * Add several objects
   *
   * @param objects contains an array of objects to add
   * @param callback (optional) the result callback called with two arguments:
   *  error: null or Error('message')
   *  content: the server answer that updateAt and taskID
   */
  addObjects: function(objects, callback) {
    var indexObj = this;
    var postObj = {requests: []};
    for (var i = 0; i < objects.length; ++i) {
      var request = { action: 'addObject',
              body: objects[i] };
      postObj.requests.push(request);
    }
    return this.as._jsonRequest({ method: 'POST',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/batch',
      body: postObj,
      hostType: 'write',
      callback: callback });
  },
  /*
   * Get an object from this index
   *
   * @param objectID the unique identifier of the object to retrieve
   * @param attrs (optional) if set, contains the array of attribute names to retrieve
   * @param callback (optional) the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the object to retrieve or the error message if a failure occured
   */
  getObject: function(objectID, attrs, callback) {
    var indexObj = this;

    if (arguments.length === 1 || typeof attrs === 'function') {
      callback = attrs;
      attrs = undefined;
    }

    var params = '';
    if (attrs !== undefined) {
      params = '?attributes=';
      for (var i = 0; i < attrs.length; ++i) {
        if (i !== 0) {
          params += ',';
        }
        params += attrs[i];
      }
    }

    return this.as._jsonRequest({
      method: 'GET',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/' + encodeURIComponent(objectID) + params,
      hostType: 'read',
      callback: callback
    });
  },

  /*
   * Get several objects from this index
   *
   * @param objectIDs the array of unique identifier of objects to retrieve
   */
  getObjects: function(objectIDs, callback) {
    var indexObj = this;

    var body = {
      requests: map(objectIDs, function prepareRequest(objectID) {
        return {
          'indexName': indexObj.indexName,
          'objectID': objectID
        };
      })
    };

    return this.as._jsonRequest({
      method: 'POST',
      url: '/1/indexes/*/objects',
      hostType: 'read',
      body: body,
      callback: callback
    });
  },

  /*
   * Update partially an object (only update attributes passed in argument)
   *
   * @param partialObject contains the javascript attributes to override, the
   *  object must contains an objectID attribute
   * @param callback (optional) the result callback called with two arguments:
   *  error: null or Error('message')
   *  content: the server answer that contains 3 elements: createAt, taskId and objectID
   */
  partialUpdateObject: function(partialObject, callback) {
    var indexObj = this;
    return this.as._jsonRequest({ method: 'POST',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/' + encodeURIComponent(partialObject.objectID) + '/partial',
      body: partialObject,
      hostType: 'write',
      callback: callback });
  },
  /*
   * Partially Override the content of several objects
   *
   * @param objects contains an array of objects to update (each object must contains a objectID attribute)
   * @param callback (optional) the result callback called with two arguments:
   *  error: null or Error('message')
   *  content: the server answer that updateAt and taskID
   */
  partialUpdateObjects: function(objects, callback) {
    var indexObj = this;
    var postObj = {requests: []};
    for (var i = 0; i < objects.length; ++i) {
      var request = { action: 'partialUpdateObject',
              objectID: objects[i].objectID,
              body: objects[i] };
      postObj.requests.push(request);
    }
    return this.as._jsonRequest({ method: 'POST',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/batch',
      body: postObj,
      hostType: 'write',
      callback: callback });
  },
  /*
   * Override the content of object
   *
   * @param object contains the javascript object to save, the object must contains an objectID attribute
   * @param callback (optional) the result callback called with two arguments:
   *  error: null or Error('message')
   *  content: the server answer that updateAt and taskID
   */
  saveObject: function(object, callback) {
    var indexObj = this;
    return this.as._jsonRequest({ method: 'PUT',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/' + encodeURIComponent(object.objectID),
      body: object,
      hostType: 'write',
      callback: callback });
  },
  /*
   * Override the content of several objects
   *
   * @param objects contains an array of objects to update (each object must contains a objectID attribute)
   * @param callback (optional) the result callback called with two arguments:
   *  error: null or Error('message')
   *  content: the server answer that updateAt and taskID
   */
  saveObjects: function(objects, callback) {
    var indexObj = this;
    var postObj = {requests: []};
    for (var i = 0; i < objects.length; ++i) {
      var request = { action: 'updateObject',
              objectID: objects[i].objectID,
              body: objects[i] };
      postObj.requests.push(request);
    }
    return this.as._jsonRequest({ method: 'POST',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/batch',
      body: postObj,
      hostType: 'write',
      callback: callback });
  },
  /*
   * Delete an object from the index
   *
   * @param objectID the unique identifier of object to delete
   * @param callback (optional) the result callback called with two arguments:
   *  error: null or Error('message')
   *  content: the server answer that contains 3 elements: createAt, taskId and objectID
   */
  deleteObject: function(objectID, callback) {
    if (typeof objectID === 'function' || typeof objectID !== 'string' && typeof objectID !== 'number') {
      var err = new Error('Cannot delete an object without an objectID');
      callback = objectID;
      if (typeof callback === 'function') {
        return callback(err);
      }

      return this.as._promise.reject(err);
    }

    var indexObj = this;
    return this.as._jsonRequest({ method: 'DELETE',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/' + encodeURIComponent(objectID),
      hostType: 'write',
      callback: callback });
  },
  /*
   * Delete several objects from an index
   *
   * @param objectIDs contains an array of objectID to delete
   * @param callback (optional) the result callback called with two arguments:
   *  error: null or Error('message')
   *  content: the server answer that contains 3 elements: createAt, taskId and objectID
   */
  deleteObjects: function(objectIDs, callback) {
    var indexObj = this;
    var postObj = {
      requests: map(objectIDs, function prepareRequest(objectID) {
        return {
          action: 'deleteObject',
          objectID: objectID,
          body: {
            objectID: objectID
          }
        };
      })
    };

    return this.as._jsonRequest({
      method: 'POST',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/batch',
      body: postObj,
      hostType: 'write',
      callback: callback
    });
  },
  /*
   * Delete all objects matching a query
   *
   * @param query the query string
   * @param params the optional query parameters
   * @param callback (optional) the result callback called with one argument
   *  error: null or Error('message')
   */
  deleteByQuery: function(query, params, callback) {
    var indexObj = this;
    var client = indexObj.as;

    if (arguments.length === 1 || typeof params === 'function') {
      callback = params;
      params = {};
    }

    params.attributesToRetrieve = 'objectID';
    params.hitsPerPage = 1000;

    // when deleting, we should never use cache to get the
    // search results
    this.clearCache();

    // there's a problem in how we use the promise chain,
    // see how waitTask is done
    var promise = this
      .search(query, params)
      .then(stopOrDelete);

    function stopOrDelete(searchContent) {
      // stop here
      if (searchContent.nbHits === 0) {
        // return indexObj.as._request.resolve();
        return searchContent;
      }

      // continue and do a recursive call
      var objectIDs = map(searchContent.hits, function getObjectID(object) {
        return object.objectID;
      });

      return indexObj
        .deleteObjects(objectIDs)
        .then(waitTask)
        .then(deleteByQuery);
    }

    function waitTask(deleteObjectsContent) {
      return indexObj.waitTask(deleteObjectsContent.taskID);
    }

    function deleteByQuery() {
      return indexObj.deleteByQuery(query, params);
    }

    if (!callback) {
      return promise;
    }

    promise.then(success, failure);

    function success() {
      exitPromise(function() {
        callback(null);
      }, client._setTimeout || setTimeout);
    }

    function failure(err) {
      exitPromise(function() {
        callback(err);
      }, client._setTimeout || setTimeout);
    }
  },
  /*
   * Search inside the index using XMLHttpRequest request (Using a POST query to
   * minimize number of OPTIONS queries: Cross-Origin Resource Sharing).
   *
   * @param query the full text query
   * @param args (optional) if set, contains an object with query parameters:
   * - page: (integer) Pagination parameter used to select the page to retrieve.
   *                   Page is zero-based and defaults to 0. Thus, to retrieve the 10th page you need to set page=9
   * - hitsPerPage: (integer) Pagination parameter used to select the number of hits per page. Defaults to 20.
   * - attributesToRetrieve: a string that contains the list of object attributes you want to retrieve (let you minimize the answer size).
   *   Attributes are separated with a comma (for example "name,address").
   *   You can also use an array (for example ["name","address"]).
   *   By default, all attributes are retrieved. You can also use '*' to retrieve all values when an attributesToRetrieve setting is specified for your index.
   * - attributesToHighlight: a string that contains the list of attributes you want to highlight according to the query.
   *   Attributes are separated by a comma. You can also use an array (for example ["name","address"]).
   *   If an attribute has no match for the query, the raw value is returned. By default all indexed text attributes are highlighted.
   *   You can use `*` if you want to highlight all textual attributes. Numerical attributes are not highlighted.
   *   A matchLevel is returned for each highlighted attribute and can contain:
   *      - full: if all the query terms were found in the attribute,
   *      - partial: if only some of the query terms were found,
   *      - none: if none of the query terms were found.
   * - attributesToSnippet: a string that contains the list of attributes to snippet alongside the number of words to return (syntax is `attributeName:nbWords`).
   *    Attributes are separated by a comma (Example: attributesToSnippet=name:10,content:10).
   *    You can also use an array (Example: attributesToSnippet: ['name:10','content:10']). By default no snippet is computed.
   * - minWordSizefor1Typo: the minimum number of characters in a query word to accept one typo in this word. Defaults to 3.
   * - minWordSizefor2Typos: the minimum number of characters in a query word to accept two typos in this word. Defaults to 7.
   * - getRankingInfo: if set to 1, the result hits will contain ranking information in _rankingInfo attribute.
   * - aroundLatLng: search for entries around a given latitude/longitude (specified as two floats separated by a comma).
   *   For example aroundLatLng=47.316669,5.016670).
   *   You can specify the maximum distance in meters with the aroundRadius parameter (in meters) and the precision for ranking with aroundPrecision
   *   (for example if you set aroundPrecision=100, two objects that are distant of less than 100m will be considered as identical for "geo" ranking parameter).
   *   At indexing, you should specify geoloc of an object with the _geoloc attribute (in the form {"_geoloc":{"lat":48.853409, "lng":2.348800}})
   * - insideBoundingBox: search entries inside a given area defined by the two extreme points of a rectangle (defined by 4 floats: p1Lat,p1Lng,p2Lat,p2Lng).
   *   For example insideBoundingBox=47.3165,4.9665,47.3424,5.0201).
   *   At indexing, you should specify geoloc of an object with the _geoloc attribute (in the form {"_geoloc":{"lat":48.853409, "lng":2.348800}})
   * - numericFilters: a string that contains the list of numeric filters you want to apply separated by a comma.
   *   The syntax of one filter is `attributeName` followed by `operand` followed by `value`. Supported operands are `<`, `<=`, `=`, `>` and `>=`.
   *   You can have multiple conditions on one attribute like for example numericFilters=price>100,price<1000.
   *   You can also use an array (for example numericFilters: ["price>100","price<1000"]).
   * - tagFilters: filter the query by a set of tags. You can AND tags by separating them by commas.
   *   To OR tags, you must add parentheses. For example, tags=tag1,(tag2,tag3) means tag1 AND (tag2 OR tag3).
   *   You can also use an array, for example tagFilters: ["tag1",["tag2","tag3"]] means tag1 AND (tag2 OR tag3).
   *   At indexing, tags should be added in the _tags** attribute of objects (for example {"_tags":["tag1","tag2"]}).
   * - facetFilters: filter the query by a list of facets.
   *   Facets are separated by commas and each facet is encoded as `attributeName:value`.
   *   For example: `facetFilters=category:Book,author:John%20Doe`.
   *   You can also use an array (for example `["category:Book","author:John%20Doe"]`).
   * - facets: List of object attributes that you want to use for faceting.
   *   Comma separated list: `"category,author"` or array `['category','author']`
   *   Only attributes that have been added in **attributesForFaceting** index setting can be used in this parameter.
   *   You can also use `*` to perform faceting on all attributes specified in **attributesForFaceting**.
   * - queryType: select how the query words are interpreted, it can be one of the following value:
   *    - prefixAll: all query words are interpreted as prefixes,
   *    - prefixLast: only the last word is interpreted as a prefix (default behavior),
   *    - prefixNone: no query word is interpreted as a prefix. This option is not recommended.
   * - optionalWords: a string that contains the list of words that should be considered as optional when found in the query.
   *   Comma separated and array are accepted.
   * - distinct: If set to 1, enable the distinct feature (disabled by default) if the attributeForDistinct index setting is set.
   *   This feature is similar to the SQL "distinct" keyword: when enabled in a query with the distinct=1 parameter,
   *   all hits containing a duplicate value for the attributeForDistinct attribute are removed from results.
   *   For example, if the chosen attribute is show_name and several hits have the same value for show_name, then only the best
   *   one is kept and others are removed.
   * - restrictSearchableAttributes: List of attributes you want to use for textual search (must be a subset of the attributesToIndex index setting)
   * either comma separated or as an array
   * @param callback the result callback called with two arguments:
   *  error: null or Error('message'). If false, the content contains the error.
   *  content: the server answer that contains the list of results.
   */
  search: function(query, args, callback) {
    // warn V2 users on how to search
    if (typeof query === 'function' && typeof args === 'object' ||
      typeof callback === 'object') {
      // .search(query, params, cb)
      // .search(cb, params)
      throw new Error('algoliasearch: index.search usage is index.search(query, params, cb)');
    }

    if (arguments.length === 0 || typeof query === 'function') {
      // .search(), .search(cb)
      callback = query;
      query = '';
    } else if (arguments.length === 1 || typeof args === 'function') {
      // .search(query/args), .search(query, cb)
      callback = args;
      args = undefined;
    }

    // .search(args), careful: typeof null === 'object'
    if (typeof query === 'object' && query !== null) {
      args = query;
      query = undefined;
    } else if (query === undefined || query === null) { // .search(undefined/null)
      query = '';
    }

    var params = '';

    if (query !== undefined) {
      params += 'query=' + encodeURIComponent(query);
    }

    if (args !== undefined) {
      // `_getSearchParams` will augment params, do not be fooled by the = versus += from previous if
      params = this.as._getSearchParams(args, params);
    }

    return this._search(params, callback);
  },

  /*
   * Browse all index content
   *
   * @param page Pagination parameter used to select the page to retrieve.
   *             Page is zero-based and defaults to 0. Thus, to retrieve the 10th page you need to set page=9
   * @param hitsPerPage: Pagination parameter used to select the number of hits per page. Defaults to 1000.
   * @param callback the result callback called with two arguments:
   *  error: null or Error('message'). If false, the content contains the error.
   *  content: the server answer that contains the list of results.
   */
  browse: function(page, hitsPerPage, callback) {
    var indexObj = this;

    if (arguments.length === 1 || typeof hitsPerPage === 'function') {
      callback = hitsPerPage;
      hitsPerPage = undefined;
    }

    var params = '?page=' + page;
    if (!this.as._isUndefined(hitsPerPage)) {
      params += '&hitsPerPage=' + hitsPerPage;
    }
    return this.as._jsonRequest({ method: 'GET',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/browse' + params,
      hostType: 'read',
      callback: callback });
  },

  /*
   * Get a Typeahead.js adapter
   * @param searchParams contains an object with query parameters (see search for details)
   */
  ttAdapter: function(params) {
    var self = this;
    return function(query, cb) {
      self.search(query, params, function(err, content) {
        if (err) {
          cb(err);
          return;
        }

        cb(content.hits);
      });
    };
  },

  /*
   * Wait the publication of a task on the server.
   * All server task are asynchronous and you can check with this method that the task is published.
   *
   * @param taskID the id of the task returned by server
   * @param callback the result callback with with two arguments:
   *  error: null or Error('message')
   *  content: the server answer that contains the list of results
   */
  waitTask: function(taskID, callback) {
    // waitTask() must be handled differently from other methods,
    // it's a recursive method using a timeout
    var indexObj = this;
    var client = indexObj.as;

    var promise = this.as._jsonRequest({
      method: 'GET',
      hostType: 'read',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/task/' + taskID
    }).then(function success(content) {
      if (content.status !== 'published') {
        return indexObj.as._promise.delay(100).then(function() {
          // do not forward the callback, we want the promise
          // on next iteration
          return indexObj.waitTask(taskID);
        });
      }

      return content;
    });

    if (!callback) {
      return promise;
    }

    promise.then(successCb, failureCb);

    function successCb(content) {
      exitPromise(function() {
        callback(null, content);
      }, client._setTimeout || setTimeout);
    }

    function failureCb(err) {
      exitPromise(function() {
        callback(err);
      }, client._setTimeout || setTimeout);
    }
  },

  /*
   * This function deletes the index content. Settings and index specific API keys are kept untouched.
   *
   * @param callback (optional) the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the settings object or the error message if a failure occured
   */
  clearIndex: function(callback) {
    var indexObj = this;
    return this.as._jsonRequest({ method: 'POST',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/clear',
      hostType: 'write',
      callback: callback });
  },
  /*
   * Get settings of this index
   *
   * @param callback (optional) the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the settings object or the error message if a failure occured
   */
  getSettings: function(callback) {
    var indexObj = this;
    return this.as._jsonRequest({ method: 'GET',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/settings',
      hostType: 'read',
      callback: callback });
  },

  /*
   * Set settings for this index
   *
   * @param settigns the settings object that can contains :
   * - minWordSizefor1Typo: (integer) the minimum number of characters to accept one typo (default = 3).
   * - minWordSizefor2Typos: (integer) the minimum number of characters to accept two typos (default = 7).
   * - hitsPerPage: (integer) the number of hits per page (default = 10).
   * - attributesToRetrieve: (array of strings) default list of attributes to retrieve in objects.
   *   If set to null, all attributes are retrieved.
   * - attributesToHighlight: (array of strings) default list of attributes to highlight.
   *   If set to null, all indexed attributes are highlighted.
   * - attributesToSnippet**: (array of strings) default list of attributes to snippet alongside the number of words to return (syntax is attributeName:nbWords).
   *   By default no snippet is computed. If set to null, no snippet is computed.
   * - attributesToIndex: (array of strings) the list of fields you want to index.
   *   If set to null, all textual and numerical attributes of your objects are indexed, but you should update it to get optimal results.
   *   This parameter has two important uses:
   *     - Limit the attributes to index: For example if you store a binary image in base64, you want to store it and be able to
   *       retrieve it but you don't want to search in the base64 string.
   *     - Control part of the ranking*: (see the ranking parameter for full explanation) Matches in attributes at the beginning of
   *       the list will be considered more important than matches in attributes further down the list.
   *       In one attribute, matching text at the beginning of the attribute will be considered more important than text after, you can disable
   *       this behavior if you add your attribute inside `unordered(AttributeName)`, for example attributesToIndex: ["title", "unordered(text)"].
   * - attributesForFaceting: (array of strings) The list of fields you want to use for faceting.
   *   All strings in the attribute selected for faceting are extracted and added as a facet. If set to null, no attribute is used for faceting.
   * - attributeForDistinct: (string) The attribute name used for the Distinct feature. This feature is similar to the SQL "distinct" keyword: when enabled
   *   in query with the distinct=1 parameter, all hits containing a duplicate value for this attribute are removed from results.
   *   For example, if the chosen attribute is show_name and several hits have the same value for show_name, then only the best one is kept and others are removed.
   * - ranking: (array of strings) controls the way results are sorted.
   *   We have six available criteria:
   *    - typo: sort according to number of typos,
   *    - geo: sort according to decreassing distance when performing a geo-location based search,
   *    - proximity: sort according to the proximity of query words in hits,
   *    - attribute: sort according to the order of attributes defined by attributesToIndex,
   *    - exact:
   *        - if the user query contains one word: sort objects having an attribute that is exactly the query word before others.
   *          For example if you search for the "V" TV show, you want to find it with the "V" query and avoid to have all popular TV
   *          show starting by the v letter before it.
   *        - if the user query contains multiple words: sort according to the number of words that matched exactly (and not as a prefix).
   *    - custom: sort according to a user defined formula set in **customRanking** attribute.
   *   The standard order is ["typo", "geo", "proximity", "attribute", "exact", "custom"]
   * - customRanking: (array of strings) lets you specify part of the ranking.
   *   The syntax of this condition is an array of strings containing attributes prefixed by asc (ascending order) or desc (descending order) operator.
   *   For example `"customRanking" => ["desc(population)", "asc(name)"]`
   * - queryType: Select how the query words are interpreted, it can be one of the following value:
   *   - prefixAll: all query words are interpreted as prefixes,
   *   - prefixLast: only the last word is interpreted as a prefix (default behavior),
   *   - prefixNone: no query word is interpreted as a prefix. This option is not recommended.
   * - highlightPreTag: (string) Specify the string that is inserted before the highlighted parts in the query result (default to "<em>").
   * - highlightPostTag: (string) Specify the string that is inserted after the highlighted parts in the query result (default to "</em>").
   * - optionalWords: (array of strings) Specify a list of words that should be considered as optional when found in the query.
   * @param callback (optional) the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer or the error message if a failure occured
   */
  setSettings: function(settings, callback) {
    var indexObj = this;
    return this.as._jsonRequest({ method: 'PUT',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/settings',
      hostType: 'write',
      body: settings,
      callback: callback });
  },
  /*
   * List all existing user keys associated to this index
   *
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer with user keys list
   */
  listUserKeys: function(callback) {
    var indexObj = this;
    return this.as._jsonRequest({ method: 'GET',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/keys',
      hostType: 'read',
      callback: callback });
  },
  /*
   * Get ACL of a user key associated to this index
   *
   * @param key
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer with user keys list
   */
  getUserKeyACL: function(key, callback) {
    var indexObj = this;
    return this.as._jsonRequest({ method: 'GET',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/keys/' + key,
      hostType: 'read',
      callback: callback });
  },
  /*
   * Delete an existing user key associated to this index
   *
   * @param key
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer with user keys list
   */
  deleteUserKey: function(key, callback) {
    var indexObj = this;
    return this.as._jsonRequest({ method: 'DELETE',
      url: '/1/indexes/' + encodeURIComponent(indexObj.indexName) + '/keys/' + key,
      hostType: 'write',
      callback: callback });
  },
  /*
   * Add an existing user key associated to this index
   *
   * @param acls the list of ACL for this key. Defined by an array of strings that
   * can contains the following values:
   *   - search: allow to search (https and http)
   *   - addObject: allows to add/update an object in the index (https only)
   *   - deleteObject : allows to delete an existing object (https only)
   *   - deleteIndex : allows to delete index content (https only)
   *   - settings : allows to get index settings (https only)
   *   - editSettings : allows to change index settings (https only)
   * @param callback the result callback called with two arguments
   *  error: null or Error('message')
   *  content: the server answer with user keys list
   */
  addUserKey: function(acls, params, callback) {
    if (arguments.length === 1 || typeof params === 'function') {
      callback = params;
      params = null;
    }

    var postObj = {
      acl: acls
    };

    if (params) {
      postObj.validity = params.validity;
      postObj.maxQueriesPerIPPerHour = params.maxQueriesPerIPPerHour;
      postObj.maxHitsPerQuery = params.maxHitsPerQuery;
    }

    return this.as._jsonRequest({
      method: 'POST',
      url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/keys',
      body: postObj,
      hostType: 'write',
      callback: callback
    });
  },

  /**
   * Add an existing user key associated to this index
   * @deprecated use index.addUserKey()
   */
   addUserKeyWithValidity: deprecate(function(acls, params, callback) {
     return this.addUserKey(acls, params, callback);
   }, deprecatedMessage('index.addUserKeyWithValidity()', 'index.addUserKey()')),

   /**
    * Update an existing user key associated to this index
    * @param {string} key - The key to update
    * @param {string[]} acls - The list of ACL for this key. Defined by an array of strings that
    *   can contains the following values:
    *     - search: allow to search (https and http)
    *     - addObject: allows to add/update an object in the index (https only)
    *     - deleteObject : allows to delete an existing object (https only)
    *     - deleteIndex : allows to delete index content (https only)
    *     - settings : allows to get index settings (https only)
    *     - editSettings : allows to change index settings (https only)
    * @param {Object} [params] - Optionnal parameters to set for the key
    * @param {number} params.validity - Number of seconds after which the key will be automatically removed (0 means no time limit for this key)
    * @param {number} params.maxQueriesPerIPPerHour - Number of API calls allowed from an IP address per hour
    * @param {number} params.maxHitsPerQuery - Number of hits this API key can retrieve in one call
    * @param {Function} callback - The result callback called with two arguments
    *   error: null or Error('message')
    *   content: the server answer with user keys list
    * @return {Promise|undefined} Returns a promise if no callback given
    */
   updateUserKey: function(key, acls, params, callback) {
     if (arguments.length === 2 || typeof params === 'function') {
       callback = params;
       params = null;
     }

     var putObj = {
       acl: acls
     };

     if (params) {
       putObj.validity = params.validity;
       putObj.maxQueriesPerIPPerHour = params.maxQueriesPerIPPerHour;
       putObj.maxHitsPerQuery = params.maxHitsPerQuery;
     }

     return this.as._jsonRequest({
       method: 'PUT',
       url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/keys/' + key,
       body: putObj,
       hostType: 'write',
       callback: callback
     });
   },

  _search: function(params, callback) {
    return this.as._jsonRequest({ cache: this.cache,
      method: 'POST',
      url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/query',
      body: {params: params},
      hostType: 'read',
      fallback: {
        method: 'GET',
        url: '/1/indexes/' + encodeURIComponent(this.indexName),
        body: {params: params}
      },
      callback: callback
    });
  },

  as: null,
  indexName: null,
  typeAheadArgs: null,
  typeAheadValueOption: null
};

// extracted from https://github.com/component/map/blob/master/index.js
// without the crazy toFunction thing
function map(arr, fn){
  var ret = [];
  for (var i = 0; i < arr.length; ++i) {
    ret.push(fn(arr[i], i));
  }
  return ret;
}

function prepareHost(protocol) {
  return function prepare(host) {
    return protocol + '//' + host.toLowerCase();
  };
}

function notImplemented() {
  var message = 'algoliasearch: Not implemented in this environment.\n' +
  'If you feel this is a mistake, write to support@algolia.com';

  throw new Error(message);
}

function deprecatedMessage(previousUsage, newUsage) {
  var githubAnchorLink = previousUsage.toLowerCase()
    .replace('.', '')
    .replace('()', '');

  return 'algoliasearch: `' + previousUsage + '` was replaced by `' +
    newUsage + '`. Please see https://github.com/algolia/algoliasearch-client-js/wiki/Deprecated#' + githubAnchorLink
}

// Parse cloud does not supports setTimeout
// We do not store a setTimeout reference in the client everytime
// We only fallback to a fake setTimeout when not available
// setTimeout cannot be override globally sadly
function exitPromise(fn, _setTimeout) {
  _setTimeout(fn, 0);
}

function deprecate(fn, message) {
  var warned = false;

  function deprecated() {
    if (!warned) {
      console.log(message);
      warned = true;
    }

    return fn.apply(this, arguments);
  }

  return deprecated;
}

}).call(this,require(1))
},{"1":1,"10":10,"5":5,"8":8}],13:[function(require,module,exports){
module.exports = JSONPRequest;

var JSONPCounter = 0;

function JSONPRequest(url, opts, cb) {
  if (opts.method !== 'GET') {
    cb(new Error('Method ' + opts.method + ' ' + url + ' is not supported by JSONP.'));
    return;
  }

  opts.debug('JSONP: start');

  var cbCalled = false;
  var timedOut = false;

  JSONPCounter += 1;
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  var cbName = 'algoliaJSONP_' + JSONPCounter;
  var done = false;

  window[cbName] = function(data) {
    try {
      delete window[cbName];
    } catch (e) {
      window[cbName] = undefined;
    }

    if (timedOut) {
      return;
    }

    cbCalled = true;

    clean();

    cb(null, {
      body: data/*,
      // We do not send the statusCode, there's no statusCode in JSONP, it will be
      // computed using data.status && data.message like with XDR
      statusCode*/
    });
  };

  // add callback by hand
  url += '&callback=' + cbName;

  // add body params manually
  if (opts.jsonBody && opts.jsonBody.params) {
    url += '&' + opts.jsonBody.params;
  }

  var ontimeout = setTimeout(timeout, opts.timeout);

  // script onreadystatechange needed only for
  // <= IE8
  // https://github.com/angular/angular.js/issues/4523
  script.onreadystatechange = readystatechange;
  script.onload = success;
  script.onerror = error;

  script.async = true;
  script.defer = true;
  script.src = url;
  head.appendChild(script);

  function success() {
    opts.debug('JSONP: success');

    if (done || timedOut) {
      return;
    }

    done = true;

    // script loaded but did not call the fn => script loading error
    if (!cbCalled) {
      opts.debug('JSONP: Fail. Script loaded but did not call the callback');
      clean();
      cb(new Error('Failed to load JSONP script'));
    }
  }

  function readystatechange() {
    if (this.readyState === 'loaded' || this.readyState === 'complete') {
      success();
    }
  }

  function clean() {
    clearTimeout(ontimeout);
    script.onload = null;
    script.onreadystatechange = null;
    script.onerror = null;
    head.removeChild(script);

    try {
      delete window[cbName];
      delete window[cbName + '_loaded'];
    } catch (e) {
      window[cbName] = null;
      window[cbName + '_loaded'] = null;
    }
  }

  function timeout() {
    opts.debug('JSONP: Script timeout');

    timedOut = true;
    clean();
    cb(new Error('Timeout - Could not connect to endpoint ' + url));
  }

  function error() {
    opts.debug('JSONP: Script error');

    if (done || timedOut) {
      return;
    }

    clean();
    cb(new Error('Failed to load JSONP script'));
  }
}

},{}],14:[function(require,module,exports){
(function (global){
// This is the jQuery Algolia Search module
// It's using $.ajax to do requests with a JSONP fallback
// jQuery promises are returned

var inherits = require(11);

var AlgoliaSearch = require(12);
var inlineHeaders = require(16);
var JSONPRequest = require(13);

function algoliasearch(applicationID, apiKey, opts) {
  var extend = require(8);

  var getDocumentProtocol = require(15);

  opts = extend(true, {}, opts) || {};

  if (opts.protocol === undefined) {
    opts.protocol = getDocumentProtocol();
  }

  opts._ua = algoliasearch.ua;

  return new AlgoliaSearchJQuery(applicationID, apiKey, opts);
}

algoliasearch.version = require(17);
algoliasearch.ua = 'Algolia for jQuery ' + algoliasearch.version;

var $ = global.jQuery;

$.algolia = {Client: algoliasearch, ua: algoliasearch.ua, version: algoliasearch.version};

function AlgoliaSearchJQuery() {
  // call AlgoliaSearch constructor
  AlgoliaSearch.apply(this, arguments);
}

inherits(AlgoliaSearchJQuery, AlgoliaSearch);

AlgoliaSearchJQuery.prototype._request = function(url, opts) {
  return $.Deferred(function(deferred) {
    var body = opts.body;

    url = inlineHeaders(url, opts.headers);

    $.ajax(url, {
      type: opts.method,
      timeout: opts.timeout,
      dataType: 'json',
      data: body,
      complete: function(jqXHR, textStatus/* , error*/) {
        if (textStatus === 'timeout') {
          deferred.resolve(new Error('Timeout - Could not connect to endpoint ' + url));
          return;
        }

        if (jqXHR.status === 0) {
          deferred.reject(new Error('Network error'));
          return;
        }

        deferred.resolve({
          statusCode: jqXHR.status,
          body: jqXHR.responseJSON
        });
      }
    });
  }).promise();
};

AlgoliaSearchJQuery.prototype._request.fallback = function(url, opts) {
  url = inlineHeaders(url, opts.headers);

  return $.Deferred(function(deferred) {
    JSONPRequest(url, opts, function JSONPRequestDone(err, content) {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve(content);
    });
  }).promise();
};

AlgoliaSearchJQuery.prototype._promise = {
  reject: function(val) {
    return $.Deferred(function(deferred) {
      deferred.reject(val);
    }).promise();
  },
  resolve: function(val) {
    return $.Deferred(function(deferred) {
      deferred.resolve(val);
    }).promise();
  },
  delay: function(ms) {
    return $.Deferred(function(deferred) {
      setTimeout(function() {
        deferred.resolve();
      }, ms);
    }).promise();
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"11":11,"12":12,"13":13,"15":15,"16":16,"17":17,"8":8}],15:[function(require,module,exports){
(function (global){
module.exports = getDocumentProtocol;

function getDocumentProtocol() {
  var protocol = global.document.location.protocol;

  // when in `file:` mode (local html file), default to `http:`
  if (protocol !== 'http:' && protocol !== 'https:') {
    protocol = 'http:';
  }

  return protocol;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
module.exports = inlineHeaders;

var querystring = require(4);

function inlineHeaders(url, headers) {
  if (/\?/.test(url)) {
    url += '&';
  } else {
    url += '?';
  }

  return url + querystring.encode(headers);
}

},{"4":4}],17:[function(require,module,exports){
module.exports="3.2.4"
},{}]},{},[14]);
