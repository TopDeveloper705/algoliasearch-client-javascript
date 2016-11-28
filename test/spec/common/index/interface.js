'use strict';

var test = require('tape');

// this test will ensure we are implementing a particular API method
// If you had a new method, it will first fail, you will have to write a test
// for it
test('AlgoliaSearch index API spec', function(t) {
  t.plan(1);

  var algoliasearch = require('../../../../');
  var filter = require('lodash-compat/collection/filter');
  var functions = require('lodash-compat/object/functions');

  var onlyPublicProperties = require('../../../utils/only-public-properties');

  var client = algoliasearch('test', 'methods');
  var index = client.initIndex('himethods');

  var actualMethods = filter(functions(index), onlyPublicProperties).sort();

  var expectedMethods = [
    'addObject',
    'addObjects',
    'addUserKey',
    'addUserKeyWithValidity',
    'batchSynonyms',
    'browse',
    'browseAll',
    'browseFrom',
    'clearCache',
    'clearIndex',
    'clearSynonyms',
    'deleteByQuery',
    'deleteObject',
    'deleteObjects',
    'deleteSynonym',
    'deleteUserKey',
    'getObject',
    'getObjects',
    'getSettings',
    'getSynonym',
    'getUserKeyACL',
    'listUserKeys',
    'partialUpdateObject',
    'partialUpdateObjects',
    'saveObject',
    'saveObjects',
    'saveSynonym',
    'search',
    'searchForFacetValues',
    'searchFacet',
    'searchSynonyms',
    'setSettings',
    'similarSearch',
    'ttAdapter',
    'updateUserKey',
    'waitTask'
  ].sort();

  t.deepEqual(actualMethods, expectedMethods, 'We only implement what is tested');
});
