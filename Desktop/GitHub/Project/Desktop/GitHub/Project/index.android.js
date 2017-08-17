import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import Router from '/Users/archiegodfrey/Desktop/GitHub/Project/Router.js'

export default class Project extends Component {
  render() {
    return (
        <Router ref={nav => { this.navigator = nav; }}/>   
    ); 
  }
}

AppRegistry.registerComponent('Project', () => Project);
