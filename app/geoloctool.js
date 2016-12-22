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
        navigator.geolocation.getCurrentPosition(function(location){
            cb(location)
        });
    } else {
        cb(null, NOT_SUPPORTED)
    }    
    console.log('TBD: GeoLocTool.getLocation()')
}

module.exports = GeoLocTool