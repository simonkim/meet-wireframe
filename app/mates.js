// mates.js
var React = require('react');

class Mates extends React.Component {
  render() {

    var mates = this.props.mates.filter((mate) => mate.name);

    return (
      <div>
      <p> Mates </p>
      <ul>
        {mates.map(mate => (
          <li key={mate.id}>{mate.name} <a href={ "/api/vcard/" + mate.id} ><span className="glyphicon glyphicon-save" aria-hidden="true"></span></a></li>
        ))}
      </ul>
      </div>    
    )
  }
}

module.exports = Mates;
