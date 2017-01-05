/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const LocalTools = require('./libs/localtools');
const DataStore = require('./libs/datastore');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

var dataStore = new DataStore(path, fs, path.join(__dirname, 'data'));

// MOCK API
const apiData = {
  '/api/zones': {name: 'zones', array: dataStore.zones, customHandler: dataStore.customHandler.bind(dataStore)},
  '/api/users': {name: 'users', array: dataStore.users, customHandler: dataStore.customHandler.bind(dataStore)},
  '/api/action': {name: 'action', customHandler: dataStore.customHandler.bind(dataStore)},
  '/api/vcard/:userId': {name: 'vcard', customHandler: dataStore.customHandler.bind(dataStore)}
}

/**
 * /api/action POST
 *  - params:
 *      cmd=join zonecode, userid   => OK
 *      cmd=leave zonecode, userid  => OK (destroies zone if creator and all members left)
 *      cmd=zonemembers zonecode    => [ {user, creator: true}, {user}, ...]
 * 
 */

/**
 * vCard download
 * /api/vcard/:id
 * Content-type: text/vcard or text/x-vcard
 */


/** Sets up a route for 'apiPath' */
function setupAPI( apiPath, options) {

    app.all(apiPath, function (req, res, next) {
      if (!options.array && options.customHandler) {
          options.customHandler(options.name, req, res);
          console.log('CUSTOM: ' + apiPath + ', cmd: ' + req.body.cmd);
      } else {
        next();
      }
    });

    app.get(apiPath, function(req, res) {
        res.json(options.array);
    });

    app.get(apiPath + '/:id', function(req, res) {
        var index = options.array.findIndex((row) => {
            return (String(row.id) === req.params.id);
        });
        if ( index !== -1) {
          res.json(options.array[index]);
        } else {
          res.status(404).send({ error: 'Not found' });
        }       
    });    

    app.post(apiPath, function(req, res) {

        if ( req.body.row ) {
          var newRow = req.body.row;
          // NOTE: In a real implementation, we would likely rely on a database or
          // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
          // treat Date.now() as unique-enough for our purposes.
          newRow.id = Date.now();

          options.array.push(newRow);
          res.json(newRow);

          LocalTools.defer( function() {
            dataStore.synchronize();
          });
        } else if (options.customHandler) {
            options.customHandler(options.name, req, res);
        }
    });

    app.put(apiPath, function(req, res) {

        var updated = {};
        var index = options.array.findIndex((row) => {
            return (String(row.id) === req.body.row.id);
        });
        if (index !== -1 ) {
          var row = options.array[index];
          Object.keys(req.body.row).forEach((key) => {
            row[key] = req.body.row[key];
          });

          updated = row;
        }

        res.json(updated);
        LocalTools.defer( function() {
          dataStore.synchronize();
        });      
    });

    app.delete(apiPath, function(req, res) {

        var deleted = {};
        var index = options.array.findIndex((row) => {
            return (String(row.id) === req.body.row.id);
        });
        if (index !== -1 ) {
          deleted = options.array[index];
          options.array.splice(index, 1);
        }

        res.json(deleted);
        LocalTools.defer( function() {
          dataStore.synchronize();
        });      
    });
}

Object.keys(apiData).forEach(function(key) {
  setupAPI(key, apiData[key]);
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
