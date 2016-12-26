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

class UserContactEdit extends React.Component {
    /**
     * Props:
     * - contactInfo (optional)
     * - onInputComplete
     */
  constructor(props) {
    super(props);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangePhone = this.handleChangePhone.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);    

    this.state = this.stateFromContactInfo( props.contactInfo )
  }

  // convert props to state
  stateFromContactInfo(contactInfo) {
    var result
    if (contactInfo) {
      result = { 
          contactName: contactInfo.name,
          contactPhone: contactInfo.phone,
          contactEmail: contactInfo.email,
      }
    } else {
      result = { 
        contactName: '',
        contactPhone: '',
        contactEmail: ''
      }      
    }

    return result
  }

  // convert state to props
  contactInfoFromState(state) {
    return { name: state.contactName,
      phone: state.contactPhone,
      email: state.contactEmail
    }    
  }
  
  render() {
      return(
        <form onSubmit={this.handleSubmit}>
          <div><label>Name:</label> <input onChange={this.handleChangeName} value={this.state.contactName} /> </div>
          <div><label>Phone:</label> <input onChange={this.handleChangePhone} value={this.state.contactPhone} /> </div>
          <div><label>Email:</label> <input onChange={this.handleChangeEmail} value={this.state.contactEmail} /> </div>
          <button>Share</button>
        </form>
      )
  }

  handleChangeName(e) {
    this.setState({ contactName: e.target.value })
  }
  handleChangePhone(e) {
    this.setState({ contactPhone: e.target.value })
  }
  handleChangeEmail(e) {
    this.setState({ contactEmail: e.target.value })
  }

  handleSubmit(e) {
    e.preventDefault();

    // TODO: callback
    console.log( this.state.contactName )
    console.log( this.state.contactPhone )
    console.log( this.state.contactEmail )

    var contactInfo = this.contactInfoFromState( this.state )
    this.validateInput( contactInfo, (contactInfo, error) => {
      if (contactInfo) {
        this.props.onInputComplete( contactInfo )
      } else {
        console.log(error.message + ", at field:" + error.field)    
      }
    })
  }

  validateInput(contactInfo, callback) {
    const keys = [ "name", "phone", "email"]

    for( var i = 0; i < keys.length; i++) {
      if (! (contactInfo[keys[i]] && contactInfo[keys[i]].length > 0) ) {
        callback(null, {message: "Non entered", field: keys[i]})
        return
      }
    }
    // valid
    callback(contactInfo)
  }
}

class UserContactDisplay extends React.Component {
  /**
   * props:
   * - contactInfo
   * - onShare(contactInfo)
   */
  constructor(props) {
    super(props)
  }

  render() {
      /*
       * ------------------------
       * Welcome Sam,
       * (S) Sam One
       *                  [Share]
       * ------------------------
       */
      return (
        <div>
          <p> Welcome, {this.props.contactInfo.name} </p>
          <button onClick={this.handleClickShare.bind(this)} >Share</button>
        </div>
      )
  }

  handleClickShare(e) {
    this.props.onShare(this.props.contactInfo)
  }
}

class User extends React.Component {
  /**
   * protps:
   * - contactInfo: { name, phone, email, ...}
   * - onShare(contactInfo[, newInput])
   */
  constructor(props) {
    super(props);
  }
  
  render() {
    if (this.props.contactInfo) {
      return(<UserContactDisplay contactInfo={this.props.contactInfo} onShare={this.props.onShare} />)
    } else {
      return(
        <UserContactEdit onInputComplete={this.handleNewContactInfo.bind(this)} />
      )
    }
  }

  handleNewContactInfo(contactInfo) {
    this.props.onShare(contactInfo, true)
  }

}

class Mates extends React.Component {
  render() {
    return (
      <div>
      <p> Mates </p>
      <ul>
        {this.props.mates.map(mate => (
          <li key={mate.id}>{mate.name}</li>
        ))}
      </ul>
      </div>    
    )
  }
}

/* AJAX example:
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
*/

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
