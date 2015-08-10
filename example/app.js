var React = require('react');
var Editor = require('../index.js');

var App = React.createClass({

    getInitialState: function() {
        return {
            scale: 1,
            highQuality: false,
            preview: null
        };
    },

    componentDidMount: function() {
    },

    handleSave: function(data) {
        var img = this.refs.avatar.getImage();
        this.setState({preview: img});
    },

    handleScale: function() {
        var scale = this.refs.scale.getDOMNode().value;
        this.setState({scale: scale})
    },

    handleHighQuality: function() {
        var highQuality = this.refs.highQuality.getDOMNode().checked;
        this.setState({highQuality: highQuality})
    },

    render: function() {
        return <div>
            <Editor ref="avatar" rotation={this.state.rotation} scale={parseFloat(this.state.scale)} highQuality={this.state.highQuality} onSave={this.handleSave} image="example/avatar.jpg" />
            <br />
            <label><input type="checkbox" ref="highQuality" checked={this.state.highQuality} onChange={this.handleHighQuality} /> High quality</label>
            <br />
            <input name="scale" type="range" ref="scale" onChange={this.handleScale} min="1" max="2" step="0.01" defaultValue="1" />    <br />
            <br />
            <input type="button" onClick={this.handleSave} value="Preview" />
            <br />
            <img src={this.state.preview} />
        </div>
    }

});

React.render(<App />, document.getElementById('app'));
