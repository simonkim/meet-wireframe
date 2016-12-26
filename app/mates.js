// mates.js
var React = require('react');

class Mates extends React.Component {
  render() {
    return (
      <div>
      <p> Mates </p>
      <ul>
        {this.props.mates.map(mate => (
          <li key={mate.id}>{mate.name}</li>
        ))}
      </ul>
      </div>    
    )
  }
}

module.exports = Mates;
