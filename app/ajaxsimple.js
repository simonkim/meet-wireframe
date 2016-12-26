// ajaxsimple.js

class AjaxSimple {

    constructor() {

    }

    post(url, content, cb) {
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'POST',
            data: content,
            success: function(data) {
            cb(data)
            }.bind(this),
            error: function(xhr, status, err) {
            console.error(this.props.urlzoneapi, status, err.toString());
            cb(null, err, status)
            }.bind(this)
        });    
    }
}

module.exports = AjaxSimple;