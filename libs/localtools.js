'use strict';

class LocalTools {
    /**
     * Calls cb asynchronously, setTimeout() with 0ms;
     */
    static defer( cb ) {
        setTimeout(cb, 0);  
    }
}

module.exports = LocalTools;