import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import Router from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Router.js'

export default class EPRouter extends Component {
  render() {
    return (
        <Router ref={nav => { this.navigator = nav; }}/>   
    ); 
  }
}

AppRegistry.registerComponent('EPRouter', () => EPRouter);