// user.js
var React = require('react');

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

module.exports = User;