// geolocation
/**
 * Example
 * ```
 * GeoLocTool = import('./geoloctool.js')
 * GeoLocTool.getLocation((location) {
 *  // ...
 * })
 */
function GeoLocTool() {

}

GeoLocTool.prototype.getLocation = function(cb) {
    if (navigator.geolocation) {
        console.log('geolocation supported')
        navigator.geolocation.getCurrentPosition(function(location){
            console.log('lat' + location.coords.latitude)
            console.log('lon' + location.coords.longitude)
            cb(location)
        }, 
        function(error){
            var message = ""
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = "User denied the request for Geolocation."
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = "Location information is unavailable."
                    break;
                case error.TIMEOUT:
                    message = "The request to get user location timed out."
                    break;
                case error.UNKNOWN_ERROR:
                    message = "An unknown error occurred."
                    break;
            }
            console.log(message)
            // TODO: Report error so the caller can take actions
        });
        return
    } else {
        console.log('geolocation unsupported')
        // TODO: define NOT_SUPPORTED constant
        cb(null, NOT_SUPPORTED)
    }    
    console.log('TBD: GeoLocTool.getLocation()')
}

module.exports = GeoLocTool