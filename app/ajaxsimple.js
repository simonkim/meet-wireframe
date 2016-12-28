// ajaxsimple.js

class AjaxSimple {

    constructor() {

    }

    post(url, content, cb) {
        this.request('POST', url, content, cb);
    }

    get(url, cb) {
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                cb(data)
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(url, status, err.toString());
                cb(null, err, status)
            }.bind(this)
        });    
    }    

    put(url, content, cb) {
        this.request('PUT', url, content, cb);
    }

    request(type, url, content, cb) {
        $.ajax({
            url: url,
            dataType: 'json',
            type: type,
            cache: false,
            data: content,
            success: function(data) {
                cb(data)
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(url, status, err.toString());
                cb(null, err, status)
            }.bind(this)
        });    
    }    
}

module.exports = AjaxSimple;