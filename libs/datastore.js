'use strict';

class DataStore {
  constructor(path, fs, dataPath) {
    this.path = path;           // path object such as node.js require('path)
    this.fs = fs;               // fs object such as node.js require('fs')
    this.dataPath = dataPath;   // path.join(__dirname, 'data'), for example
    this._zones =[];
    this._users = [];
  }

  get zones() {
    return this._zones;
  }

  get users() {
    return this._users;
  }

  synchronize() {
      const zonesPath = this.path.join(this.dataPath, 'zones.json');
      const usersPath = this.path.join(this.dataPath, 'users.json');

      this.synchronizeData(this.zones, zonesPath);
      this.synchronizeData(this.users, usersPath);

      console.log('DataStore: synchronized');
  }

  synchronizeData(dataRows, dataPath) {
      this.fs.writeFile(dataPath, JSON.stringify(dataRows, null, 4), function(err) {
        if (err) {
          console.error('Failed synchronizing ' + 'zones' + ', error:' + err);
        }
      });
  }

  isCoordsWithinBorder(coords, border) {
      return (Number(border.latitude.min) <= Number(coords.latitude) && Number(coords.latitude) <= Number(border.latitude.max)) &&
        (Number(border.longitude.min) <= Number(coords.longitude) && Number(coords.longitude) <= Number(border.longitude.max));
  }
  /**
   * 
   * cb(data, status, message)
   */
  customHandler(name, req, res) {
      var result = null;
      var error
      if (name === "zones") {
          if ( req.method == "POST" ) {
              if (req.body.coords) {
                  // find zone where coords.latitude within border.latitude.min/max, and coords.longitude within border.longitude.min/max
                  var coords = req.body.coords;
                  result = this.zones.filter((zone) => {
                      return this.isCoordsWithinBorder(coords, zone.location.border);
                  });
              }
          }
      }
      if (result === null) {
          res.status(404).send({ error: 'Invalid request parameters'});
      } else {
          res.json(result);
      }
  }
}

module.exports = DataStore;