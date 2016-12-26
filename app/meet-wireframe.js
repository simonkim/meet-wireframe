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

const Zone = require('./zone')
const User = require('./user')
const Mates = require('./mates')

class WFTop extends React.Component {

  /** 
   * - zoneData: code, location.center, location.border
   */  
  constructor(props) {
    super(props);
    this.state = {
      mates: [{ id: '1', name: 'Lukar'}],
    };

    this.codegen = new ZoneCodeGen();
  }

  render() {

    if ( this.state.zoneData ) {
      console.log('WFTop render state.zoneData:' + JSON.stringify(this.state.zoneData));
    } else {
      console.log('WFTop render state.zoneData: is null or undefined');
    }
    
    return (<div>
      <Zone data={this.state.zoneData} onZoneChange={this.onZoneChange.bind(this)} />
      <User contactInfo={this.state.userContactInfo} onShare={this.onShareContactInfo.bind(this)} />
      <Mates mates={this.state.mates}/>
      </div>
    )
  }

  onShareContactInfo(contactInfo, newInput) {
    console.log(contactInfo)

    if (newInput === true) {
      this.setState( {
        userContactInfo: contactInfo
      })
      // entered for share
    } // else, clicked Share

    // proceed with share
    console.log('TODO: share contact!')

    var geolocTool = new GeoLocTool()
    geolocTool.getLocation((location) => {
      console.log('location' + location)

      // 100M
      var border = GeoLocDistance.getNearLocationsBorder(location.coords, 0.1);
      console.log('zone range: ' + JSON.stringify(border))    

      var center = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      this.requestZoneCreation( {center: center, border: border}, (zoneData, error) => {
        console.log('zoneData: ' + zoneData);
        this.setState( {zoneData: zoneData} )        
      });
    })
  }

  onZoneChange(zoneData) {
    this.setState( {zoneData: zoneData} )
  }

  requestZoneCreation( location, cb ) {

      var zoneData = {
        code: this.codegen.gen(4).join(''),
        location: location
      }

      var content = {
        row: zoneData
      };  

      $.ajax({
        url: this.props.urlzoneapi,
        dataType: 'json',
        type: 'POST',
        data: content,
        success: function(data) {
          console.log('res: ' + data);
          cb(zoneData)
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.urlzoneapi, status, err.toString());
        }.bind(this)
      });
  }
}

ReactDOM.render(
  <WFTop urlzoneapi="/api/zones" />,
  document.getElementById('content')
);
