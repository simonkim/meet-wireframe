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
}

module.exports = DataStore;