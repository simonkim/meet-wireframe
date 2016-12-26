// zone.js
/**
 * <Zone>
 *      <ZoneDisplay />
 *      or
 *      <ZoneEntry />
 * </Zone>
 */
var React = require('react');
const GeoLocTool = require('./geoloctool')
const GeoLocDistance = require('geolocation-distances')

function ZoneDisplay(props) {
    return ( 
        <div>
          <h2>{props.data.code} </h2> 

          <p className="text-right mt-zone-location"> {props.data.name}</p>
          <div className="col-md-4 text-center">       
            <button type="button" className="btn btn-danger" aria-label="Leave">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
              Leave
            </button>        
          </div>

          <img src="images/mock-map.png" />          
        </div>
    );
}

class ZoneEntry extends React.Component {

  get maxCodeLength() {
    return 4
  }
  /**
   * props:
   * - code (optional)
   * - onInput(code)
   */
  constructor(props) {
    super(props)

    this.state = {code: props.code} 
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  render() {
      return(
        <form className="form-horizontal" role="form" onSubmit={this.handleSubmit}>
          <legend className="righter">Enter Zone Code</legend>        

          <div className="form-group">          
            <div className="col-md-4 text-center">               
              <input type="text" name="code" className="form-control" id="title" placeholder="A B C D" onChange={this.handleChange} />
            </div>        
          </div>

          <div className="form-group">
            <div className="col-md-4 text-center">               
              <button type="submit" className="btn btn-primary" aria-label="Enter">
                Enter
              </button>
            </div>        
          </div>          
        </form>  
      )  
  }

  handleChange(e) {
    var value = e.target.value
    if (!value || (value.length <= this.maxCodeLength) ) {
      this.setState( {code: e.target.value})
    } else {
      e.target.value = this.state.code
    }
  }

  handleSubmit(e) {
    e.preventDefault()
    if (this.state.code.length == this.maxCodeLength) {
      this.props.onInput(this.state.code)
    }
  }
}

class Zone extends React.Component {
  /**
   * props:
   * - data: code, location.center, location.border
   * - onZoneChange: Callback when found a zone for the code entered by user
   */
  constructor(props) {
    super(props);
    this.handleZoneCodeInput = this.handleZoneCodeInput.bind(this);

    console.log('Zone: props.data:' + JSON.stringify(props.data));
  }

  render() {
    console.log('Zone render state.data:' + JSON.stringify(this.props.data));
    if (this.props.data) {
      console.log('ZoneDisplay');
      return ( 
          <section className="zone">
            <div className="mt-zone-container">
              <ZoneDisplay data={this.props.data}/>
            </div>
          </section>          
      )
    } else {
      console.log('ZoneEntry');
      return(
          <section className="zone">
            <div className="mt-zone-container">
              <ZoneEntry onInput={this.handleZoneCodeInput} />
            </div>
          </section>          
      )
    }
  }

  handleZoneCodeInput(code) {
    /*
     * current location center, border -> search zones within the border
     *                                 -> filter with code
     * 1. found: report back: onZoneChange
     * 2. not found: alert and wait for another code input
     */
    console.log('input:' + code)

    var geolocTool = new GeoLocTool()
    geolocTool.getLocation((location) => {
      this.queryZonesNearby( location.coords, (zones) => {
        var matches = zones.filter((zone) => zone.code == code)
        if (matches.length > 0) {
          // found:
          this.props.onZoneChange( matches[0] )
        } else {
          // not found
          console.log('zone not found');
        }
      })
    })
  }

  queryZonesNearby( coords, cb) {
      // 100M
      var border = GeoLocDistance.getNearLocationsBorder(coords, 0.1);

      // TODO: query over AJAX
      
      cb([])
  }
}

module.exports = Zone;