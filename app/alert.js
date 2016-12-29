// alert.js

var React = require('react');

/**
 * props: 
 * - vislble: Bool
 * - message: String
 * - type: info (default), success, warning, danger
 */
class Alert extends React.Component {
    constructor(props) {
        super(props);
        this.state = { type: props.type || 'info'}
    }

    alertClass() {
        return 'alert alert-' + this.state.type;
    }

    render() {
        if (!this.props.visible)  {
            return (<div> </div>)
        }
        return (
            <div className={this.alertClass()} role="alert">
                <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                {this.props.message}
            </div>  
        )
    }
}

module.exports = Alert;
