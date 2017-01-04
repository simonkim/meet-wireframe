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
      /*
       * ------------------------------------
       * Name:
       * Phone:
       * Email:
       *                         [Save/Share]
       * ------------------------------------
       *                              [Login] 
       * ------------------------------------
       */
    
      return (
        <form className="form-horizontal" role="form" onSubmit={this.handleSubmit}>
            <legend className="righter">Please provide your contact information:</legend>
            <div className="form-group">
                <label for="name" className="col-xs-2 control-label">Name</label>
                <div className="col-xs-4">
                    <input type="text" className="form-control" id="name" placeholder="..." onChange={this.handleChangeName} value={this.state.contactName}/>
                </div>
            </div>
            <div className="form-group">
                <label for="phone" className="col-xs-2 control-label">Phone</label>
                <div className="col-xs-4">
                    <input type="text" className="form-control" id="phone" placeholder="..." onChange={this.handleChangePhone} value={this.state.contactPhone}/>
                </div>
            </div>
            <div className="form-group">
                <label for="email" className="col-xs-2 control-label">Email</label>
                <div className="col-xs-4">
                    <input type="text" className="form-control" id="email" placeholder="..." onChange={this.handleChangeEmail} value={this.state.contactEmail}/>
                </div>
            </div>

            <div className="col-md-4 text-center">               
              <button type="submit" className="btn btn-primary" aria-label="Share">
                Share
              </button>
            </div>
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
   * - onEdit(contactInfo)
   */
  constructor(props) {
    super(props)
  }

  render() {

      /*
       * ------------------------------------
       * Welcome Sam,
       * (S) Sam One
       *                  [Edit] [Save/Share]
       * ------------------------------------
       *                  [Not Sam?] [Logout] 
       * ------------------------------------
       */
      return (
        <div>
          <legend className="righter">Welcome, <strong>{this.props.contactInfo.name}</strong></legend>
          <div className="col-md-4">
            <address>
              <a href="mailto:#">{this.props.contactInfo.email}</a><br/>
              <abbr title="Phone">P:</abbr> {this.props.contactInfo.phone}          
            </address>
          </div>

          <div className="col-md-4 text-center">               
            <button type="button" className="btn btn-default" aria-label="Edit" onClick={this.handleClickEdit.bind(this)}>
              Edit
            </button>
            <button type="button" className="btn btn-primary" aria-label="Share" onClick={this.handleClickShare.bind(this)}>
              Share
            </button>
          </div>              
        </div>
      )
  }

  handleClickShare(e) {
    this.props.onShare(this.props.contactInfo)
  }

  handleClickEdit(e) {
    this.props.onEdit(this.props.contactInfo)
  }
}

class UserLoginLogout extends React.Component {

    /**
     * props:
     * - name: String
     * - infoAvailable: Bool    [Not you?] button
     * - authenticated: Bool    [Login/Logout] button
     * - onReset()
     * - onLogin(Bool)
     */

    constructor(props) {
        super(props);

        var buttonLabel = 'Login';
        if (props.authenticated) {
            buttonLabel = 'Logout';
        }
        this.state = { authButtonLabel: buttonLabel }
    }

    render() {
        if (this.props.infoAvailable) {
            return (
              <div className="col-md-4 text-center">               
                <button type="button" className="btn btn-default" aria-label="Reset" 
                  onClick={this.props.onReset}>
                  Not {this.props.name}?
                </button>
                <button type="button" className="btn btn-primary" aria-label="{this.state.authButtonLabel}" 
                  onClick={this.handleLogin.bind(this)}>
                  {this.state.authButtonLabel}
                </button>
              </div>
            );
        } else {
            return (
              <div className="col-md-4 text-center">               
                <button type="button" className="btn btn-primary" aria-label="{this.state.authButtonLabel}" 
                  onClick={this.handleLogin.bind(this)}>
                  {this.state.authButtonLabel}
                </button>
              </div>
            );
        }
    }

    handleLogin() {
        this.props.onLogin( !this.props.authenticated );
    }

}

class User extends React.Component {

    /**
     * props:
     * - contactInfo: { name, phone, email, ...}
     * - onShare(contactInfo[, newInput])
     * - onChange(contactInfo)
     */
  constructor(props) {
    super(props);
    this.state = {isEditing: false};
  }
  
  render() {
    if ( !jQuery.isEmptyObject(this.props.contactInfo) && this.state.isEditing === false) {
      return(
        <section className="user">
          <div className="container">
            <UserContactDisplay contactInfo={this.props.contactInfo} 
              onShare={this.props.onShare} 
              onEdit={this.onEditRequest.bind(this)}
            />
            <UserLoginLogout name={this.props.contactInfo.name} infoAvailable={true} authenticated={false} 
              onReset={this.props.onReset} />
          </div>
        </section>
        )
    } else {
      return(
        <section className="user">
          <div className="container">
            <UserContactEdit contactInfo={this.props.contactInfo}
                onInputComplete={this.handleNewContactInfo.bind(this)} 
            />
            <UserLoginLogout infoAvailable={false} authenticated={false}/>
          </div>
        </section>
      )
    }
  }

  handleNewContactInfo(contactInfo) {
    if (this.state.isEditing) {
      // edit complete
      this.setState( {isEditing: false})
      this.props.onChange(contactInfo)
    } else {
      // share
      this.props.onShare(contactInfo, true)
    }
  }

  onEditRequest(contactInfo) {
    this.setState( {isEditing: true})
  }

  onResetUserInfo() {
      this.props.onChange({})
  }
}

module.exports = User;