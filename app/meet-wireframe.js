/**
 * <Tools: Unclear>
 * <Zone />
 * <User />
 * <Mates />
 * <Extra: Unclear>
 */
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
      geolocation: {
          error: {},
      },
      userId: localStorage.getItem("userId")
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
      />

      <Alert type="danger"
            visible={!jQuery.isEmptyObject(this.state.geolocation.error)}
            message={this.state.geolocation.error.message}
      />
    
      <User contactInfo={this.state.userContactInfo} 
          onShare={this.onShareContactInfo.bind(this)} 
          onChange={this.onChangeContactInfo.bind(this)} 
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
          
          this.setState( {
            userContactInfo: contactInfo
          });
        } else {
          console.error( 'Wrong userId? ' + this.state.userId);
        }
      });
    }

    // Get the location
    var geolocTool = new GeoLocTool();
    geolocTool.getLocation((location, error) => {
        var geolocation = { error: {} }
        if (error) {
          geolocation.error = error;
        }

        if (location) {
          geolocation.coords = location.coords;
        }
        console.log(this.constructor.name + ': setState(geolocation)');
        this.setState( {
          geolocation: geolocation
        })
    });
  }

  onChangeContactInfo(contactInfo) {
      contactInfo.id = this.state.userId;
      console.log(this.constructor.name + ': setState(userContactInfo)');
      this.setState( {
        userContactInfo: contactInfo
      })

      this.ajax.put(this.props.urlusersapi, { row: contactInfo }, (contactInfo, err, status) => {
        if (err) {
          console.error( 'ERROR PUT ' + this.props.urluserapi + ', error:' +err);
        }
      });
  }

  onShareContactInfo(contactInfo, newInput) {
    console.log(contactInfo)

    if (newInput === true) {
      // entered and share immediately
      console.log(this.constructor.name + ': setState(userContactInfo)');
      this.setState( {
        userContactInfo: contactInfo
      });

      this.ajax.post( this.props.urlusersapi, { row: contactInfo }, (data, err, status) => {
        if (data) {
          localStorage.setItem('userId', data.id);
          console.log(this.constructor.name + ': setState(userContactInfo, userId)');
          this.setState( {
            userContactInfo: data,
            userId: data.id
          });
        } else {
          console.error(this.props.urlusersapi, status, err.toString());          
        }
      })

    } // else, clicked Share

    // proceed with share

    if (this.state.geolocation.coords) {
      var coords = this.state.geolocation.coords;

      // 100M
      var border = GeoLocDistance.getNearLocationsBorder(coords, 0.1);
      border.latitude.min = Number(border.latitude.min);
      border.latitude.max = Number(border.latitude.max);
      border.longitude.min = Number(border.longitude.min);
      border.longitude.min = Number(border.longitude.min);
      console.log('zone range: ' + JSON.stringify(border))    

      var center = { latitude: Number(coords.latitude), longitude: Number(coords.longitude) };
      this.requestZoneCreation( {center: center, border: border}, (zoneData, error) => {
        console.log(this.constructor.name + ': setState(zoneData)');
        this.setState( {zoneData: zoneData} )        
      });
    } else {
      // Can't access geolocation. Either not supported or not permitted.
    }
  }

  onZoneChange(zoneData) {
      console.log(this.constructor.name + ': setState(zoneData)');
      this.setState( {zoneData: zoneData} )
  }

  onZoneQuery(coords, cb) {
    this.ajax.post(this.props.urlzoneapi, 
      {coords: {latitude: Number(coords.latitude), longitude: Number(coords.longitude)} }, 
      (data, err, status) => {
      cb(data || []);
    });
  }

  requestZoneCreation( location, cb ) {

      var zoneData = {
        code: this.codegen.gen(4).join(''),
        location: location
      }

      var content = {
        row: zoneData
      };  

      this.ajax.post( this.props.urlzoneapi, content, (data, err, status) => {
        if (data) {
          cb(zoneData)
        } else {
          console.error(this.props.urlzoneapi, status, err.toString());          
        }
      })
  }

}

ReactDOM.render(
  <WFTop urlzoneapi="/api/zones" urlusersapi="/api/users" />,
  document.getElementById('content')
);
