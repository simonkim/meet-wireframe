/**
 * <Tools: Unclear>
 * <Zone />
 * <User />
 * <Mates />
 * <Extra: Unclear>
 */
var React = require('react');
const GeoLocTool = require('./geoloctool')
const GeoLocDistance = require('geolocation-distances')
const ZoneCodeGen = require('./zonecodegen')
const AjaxSimple = require('./ajaxsimple')

const Zone = require('./zone')
const User = require('./user')
const Mates = require('./mates')
const Alert = require('./alert')

class WFTop extends React.Component {

  /** 
   * propts:
   *  - urlzoneapi: /api/zones
   *  - urlusersapi: /api/users
   * 
   * states:
   * - mates: []
   * - zoneData: {code, location.center, location.border}
   */  
  constructor(props) {
    super(props);
    this.state = {
      mates: [{ id: '1', name: 'Lukar'}],
      zoneData: {},
      geolocation: { error: {} },
      userContactInfo: {},
      userId: localStorage.getItem('userId')
    };

    this.codegen = new ZoneCodeGen();
    this.ajax = new AjaxSimple();    
  }

  render() {
      console.log(this.constructor.name + ': render');
      
    return (<div>
      <Zone data={this.state.zoneData} 
        coords={this.state.geolocation.coords}
        onZoneChange={this.onZoneChange.bind(this)} 
        onZoneQuery={this.onZoneQuery.bind(this)}
        onCreate={this.onZoneCreate.bind(this)}
      />

      <Alert type="danger"
            visible={!jQuery.isEmptyObject(this.state.geolocation.error)}
            message={this.state.geolocation.error.message}
      />
    
      <User contactInfo={this.state.userContactInfo} 
          onChange={this.onChangeContactInfo.bind(this)} 
          onReset={this.onResetContactInfo.bind(this)}
      />
      <Mates mates={this.state.mates}/>
      </div>
    )
  }

    componentDidMount() {
        if (this.state.userId) {
            this.ajax.get(this.props.urlusersapi + '/' + this.state.userId, (contactInfo, err, status) => {
                if ( contactInfo ) {
                    console.log(this.constructor.name + ': setState(userContactInfo)');                    
                    this.setState( { userContactInfo: contactInfo});
                } else {
                    console.error( 'Wrong userId? ' + this.state.userId);
                }
            });
        }

        // Get the location
        var geolocTool = new GeoLocTool();
        this.setState( {
            geolocation: {
                error: {},
                waiting: true
            }
        });
        geolocTool.getLocation((location, error) => {
            if (!this.state.geolocation.waiting) {
                return;
            }
            var geolocation = { error: {}, waiting: false }
            if (error) {
                geolocation.error = error;
                console.error('location detection failed: ' + error.message);
            }

            if (location) {
                geolocation.coords = location.coords;
                var coords = { latitude: geolocation.coords.latitude, longitude: geolocation.coords.longitude};
                console.log('location detected: ' + JSON.stringify(coords));
            }
            console.log(this.constructor.name + ': setState(geolocation)');
            this.setState( { geolocation: geolocation });
        });
    }

    // - cb(contactInfo, error, status)
    createEmptyUser(cb) {
        this.ajax.post( this.props.urlusersapi, { row: { placeholder: true } }, (data, err, status) => {
            if (data) {
                localStorage.setItem('userId', data.id);

                console.log(this.constructor.name + ': setState(userContactInfo, userId)');
                this.setState( {
                  userContactInfo: data,
                  userId: data.id
                });                
            }
            cb(data, err, status);
        });

    }

    onChangeContactInfo(contactInfo) {
        if (!this.state.userId) {
            // We are editing, not creating.
            console.error('TBD: Make sure user has already been created');

            return;
        }

        contactInfo.id = this.state.userId;
        contactInfo.placeholder = false;

        console.log(this.constructor.name + ': setState(userContactInfo)');
        this.setState( { userContactInfo: contactInfo });
        this.ajax.put(this.props.urlusersapi, { row: contactInfo }, (contactInfo, err, status) => {
            if (err) {
                console.error( 'ERROR PUT ' + this.props.urluserapi + ', status:' + status + ', error:' + err);
            } else if ( contactInfo ) {
                this.setState( { userContactInfo: contactInfo });              
            }
        });
    }

    /**
     * The contactInfo is not for the visitor.
     */   
    onResetContactInfo() {
        this.setState( {
          userContactInfo: {},
          userId: null
        });
        localStorage.removeItem('userId');

        this.createEmptyUser((contactInfo, err, status) => {
            console.error('TBD: Handle creating empty user failure. error: ' + err.message);
        });
    }

    createZone(coords, userid, cb) {
        // 100M
        var border = GeoLocDistance.getNearLocationsBorder(coords, 0.1);
        var center = { latitude: Number(coords.latitude), longitude: Number(coords.longitude) };
        var zoneData = { 
            creator: userid, 
            location: {center: center, border: border},
            members: [userid]
        };
        this.requestZoneCreation( zoneData, cb);
    }

    onZoneChange(zoneData) {
        console.log(this.constructor.name + ': setState(zoneData)');
        var prevZoneCode = this.state.zoneData.code;
        this.setState( { zoneData: zoneData } )
        var content = {};

        if ( !jQuery.isEmptyObject(zoneData) ) {
            // join
            content = {cmd: 'join', zonecode: zoneData.code, userid: this.state.userId};
            this.ajax.post(this.props.urlactionapi, content, (data, err, status) => {
                // array of userContactInfo
                if (data) {
                    this.setState( { mates: data });
                    console.log(data);
                } else {
                    console.error(status + ': ' + err.message);
                }
            });
        } else if (prevZoneCode) {
            // leave
            this.setState( { mates: [] });
            
            content = {cmd: 'leave', zonecode: prevZoneCode, userid: this.state.userId};
            this.ajax.post(this.props.urlactionapi, content, (data, err, status) => {
                if (data) {
                  console.log(data);
                } else {
                    console.error(status + ': ' + err.message);
                }
            });
        }
    }

  onZoneQuery(coords, cb) {
    this.ajax.post(this.props.urlzoneapi, 
      {coords: {latitude: Number(coords.latitude), longitude: Number(coords.longitude)} }, 
      (data, err, status) => {
      cb(data || []);
    });
  }

    onZoneCreate() {
        //
        console.log('create zone');

        var coords = this.state.geolocation.coords;
        var userid = this.state.userContactInfo.id;
        
        if (!coords) {
          // Can't access geolocation. Either not supported or not permitted.
          console.error('TBD: Make sure coords are available at this point');

          return;
        }

        var createZone = (co, uid) => {
            this.createZone(co, uid, (zone, error) => {
              console.log(this.constructor.name + ': setState(zoneData)');
              this.setState( {zoneData: zone} )        
            });
        };

        if (!userid) {
            this.createEmptyUser((contactInfo, err, status) => {
                if ( contactInfo ) {
                    createZone(coords, contactInfo.id);
                } else {
                    console.error( 'POST:' + this.props.urlusersapi + ', status:' + status + ', error:' + err);                                    
                }
            });

        } else {
            createZone(coords, userid);
        }
    }

  requestZoneCreation( zoneData, cb ) {
      zoneData.code = this.codegen.gen(4).join('');

      var content = {
        row: zoneData
      };  

      this.ajax.post( this.props.urlzoneapi, content, (data, err, status) => {
          if (data) {
              cb(zoneData)
          } else {
              console.error( 'POST:' + this.props.urlzoneapi + ', status:' + status + ', error:' + err);
          }
      })
  }

}

ReactDOM.render(
  <WFTop urlzoneapi="/api/zones" urlusersapi="/api/users" urlactionapi="/api/action" />,
  document.getElementById('content')
);
