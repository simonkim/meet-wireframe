// geolocation
/**
 * Example
 * ```
 * GeoLocTool = import('./geoloctool.js')
 * GeoLocTool.getLocation((location, error) => {
 *  // ...
 * })
 */
'use strict';

class GeoLocTool {
  
  constructor() {
    this.code = {
      NOT_SUPPORTED: "NOT_SUPPORTED",
      
      messages: {
        NOT_SUPPORTED: "The browser does not support geolocation detection feature."
      }
    };
    Object.freeze( this.code );
    this.pretendUnsupported = false;
    this.timeoutms = 10000;
  }
  
  _buildErrorFromGeoLocationError(error) {
      var messages = { };
      messages[error.PERMISSION_DENIED] = "User denied the request for Geolocation.";
      messages[error.POSITION_UNAVAILABLE] = "Location information is unavailable.";
      messages[error.TIMEOUT] = "The request to get user location timed out.";
      messages[error.UNKNOWN_ERROR] = "An unknown error occurred.";
      
      var message = messages[error.code] || "";

      var err = Object.assign({}, error, {
        code: error.code,
        message: message,
        PERMISSION_DENIED: error.PERMISSION_DENIED,
        POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
        TIMEOUT: error.TIMEOUT,
        UNKNOWN_ERROR: error.UNKNOWN_ERROR,
      }); 
      return err;
  }
  
  getLocation(cb) {
    
      if (navigator.geolocation && !this.pretendUnsupported) {
          navigator.geolocation.getCurrentPosition(
            (location) => {
              cb(location)
            }, 
            (error) => {
              var err = this._buildErrorFromGeoLocationError(error);
              cb(null, err);                
            },
            { timeout: this.timeoutms }
          );
      } else {
          var error = Object.assign({}, this.code, {
            code: this.code.NOT_SUPPORTED,
            message: this.code.messages[this.code.NOT_SUPPORTED]
          });
          
          cb(null, error)
      }    
  }  
}

module.exports = GeoLocTool

/*
// Test code for error callback
// Move this to unit test (jasmine, maybe?)

console.log("* const test");

var tool = new GeoLocTool();
console.log(tool.code);

// This causes TypeError with 'use strict'; which means 'const' is working fine.
// tool.code.NOT_SUPPORTED = "SUPPORTED";
// console.log(tool.code);
 
console.log();
console.log("* NOT_SUPPORTED test");
tool.pretendUnsupported = true;
tool.getLocation((location, error) => {
  if (location) {
    console.log(location);  
  } else {
    if (error.code == error.NOT_SUPPORTED) {
      console.log("ERROR: " + error.message);
    } else {
      console.log("ERROR: code: " + error.code + ', message:' + error.message);
    }  
  }
});


console.log();
console.log("* PERMISSION_DENIED test");
tool.pretendUnsupported = false;
tool.getLocation((location, error) => {
  if (location) {
    console.log('lat: ' + location.coords.latitude)
    console.log('lon: ' + location.coords.longitude)
  } else {

    if (error.code == error.PERMISSION_DENIED) {
      console.log("PERMISSION_DENIED");
    } else {
      console.log("ERROR: code: " + error.code + ', message:' + error.message);
    }
  }
});
*/