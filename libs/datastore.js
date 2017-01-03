'use strict';

const LocalTools = require('./localtools');

class DataStore {
    constructor(path, fs, dataPath) {
        this.path = path;           // path object such as node.js require('path)
        this.fs = fs;               // fs object such as node.js require('fs')
        this.dataPath = dataPath;   // path.join(__dirname, 'data'), for example
        this._zones =[];
        this._users = [];

        this.customHandlers = {
            action: this.handleAction.bind(this)
        };
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

    userWithId(userid) {
        var index = this.users.findIndex((user) => (String(user.id) === userid) );
        if ( index !== -1 ) {
            return this.users[index];
        }
        return null;
    }

    // returns array of user objects with contact info filled, or empty array.
    usersWithIds(userids) {
        var contacts = [];
        userids.forEach( (userid) => {
            var user = this.userWithId(userid);
            if (user) {
                contacts.push(user);
            }
        });
        return contacts;
    }

    zoneWithCode( zonecode ) {
        var index = this.zones.findIndex((zone) => (String(zone.code) === zonecode));
        if ( index !== -1 ) {
            return this.zones[index];
        }
        return null;
    }

    zoneRemoveMember(zone, userid) {
        var members = zone.members || [];
        var index = members.findIndex((member) => member === userid);
        if (index !== -1) {
            members.splice(index, 1);
            zone.members = members;
            return true;
        }
        return false;        
    }

    zoneAddMember(zone, userid) {
        var members = zone.members || [];
        var index = members.findIndex((member) => member === userid);
        if (index === -1) {
            members.push(userid);
            zone.members = members;
            return true;
        }
        return false;        
    }    

    /**
     * /api/action POST
     *  - params:
     *      cmd=join zonecode, userid   => OK
     *      cmd=leave zonecode, userid  => OK (destroies zone if creator and all members left)
     *      cmd=zonemembers zonecode    => [ {user, creator: true}, {user}, ...]
     * 
     */      
    handleAction(req, res) {
        if (req.method == "POST" ) {
            if (req.body.cmd == "join") {
                // zonecode, userid
                var userid = req.body.userid;
                var result = null;

                if ( !this.userWithId(userid) ) {
                    res.status(400).send({error: 'Not valid userid'});
                    return;
                }

                var zone = this.zoneWithCode( req.body.zonecode );
                if ( !zone ) {
                    res.status(400).send({error: 'Zone not found'});
                    return;
                }
                
                // member can't join again
                if (this.zoneAddMember(zone, userid)) {
                    result = this.usersWithIds(zone.members || []);                    
                }
                if (result) {
                    res.json(result);
                    LocalTools.defer( () => {
                        this.synchronize();
                    });                    
                } else {
                    res.status(400).send({ error: 'Invalid request parameters'});
                }
            } else if (req.body.cmd == "leave") {
                // zonecode, userid

                var userid = req.body.userid;
                var result = null;

                if ( !this.userWithId(userid) ) {
                    res.status(400).send({error: 'Not valid userid'});
                    return;
                }

                var zone = this.zoneWithCode( req.body.zonecode );
                if ( !zone ) {
                    res.status(400).send({error: 'Zone not found'});
                    return;
                }
                
                if (this.zoneRemoveMember(zone, userid)) {
                    result = {};
                }

                if (result) {
                    res.json(result);
                    LocalTools.defer( () => {
                        this.synchronize();
                    });                    
                } else {
                    res.status(400).send({ error: 'Invalid request parameters'});
                }                
            } else if (req.body.cmd == "zonemembers") {
                // zonecode

                var result = null;
                var zone = this.zoneWithCode( req.body.zonecode );
                if (zone) {
                    var contacts = this.usersWithIds(zone.members || []);
                    res.json(contacts);
                } else {
                    res.status(400).send({error: 'Zone not found'});
                }
            }
            
        }
    }
    /**
     * 
     * cb(data, status, message)
     */
    customHandler(name, req, res) {
        if (name === 'zones') {
            var result = null;
            if ( req.method === 'POST' ) {
                if (req.body.coords) {
                    // find zone where coords.latitude within border.latitude.min/max, and coords.longitude within border.longitude.min/max
                    var coords = req.body.coords;
                    result = this.zones.filter((zone) => {
                        return this.isCoordsWithinBorder(coords, zone.location.border);
                    });
                }
            }
            if (result === null) {
                res.status(404).send({ error: 'Invalid request parameters'});
            } else {
                res.json(result);
            }      
        } else {
            var fn = this.customHandlers[name];
            fn(req, res);
        }
  }
}

module.exports = DataStore;
