import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions,NetInfo
} from 'react-native';

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

import Router from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Router.js'
import SignIn from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/SignIn.js'

export default class EPRouter extends Component {
  constructor (props) {
    super(props);
    this.state = {
      loggedIn: "true",
    }
  }

  updateLoggedInState() {
    if (this.state.loggedIn === "true") {
      this.setState({loggedIn: "false"})
      AsyncStorage.setItem('@loggedIn:key', "false");
    } else {
      this.setState({loggedIn: true})
      AsyncStorage.setItem('@loggedIn:key', "true");
    }
  }

  componentWillMount() {
    try {
        AsyncStorage.getItem('@loggedIn:key').then((value) => {
          this.setState({loggedIn: value})
          if (value === "false") {
            firebaseApp.auth().signOut()
            AsyncStorage.clear()
          }
        });
      } catch (error) {
        // Error retrieving data
        resolve(false)
      }
  }

  render() {
    if (this.state.loggedIn === "true") {
      return (
          <Router ref={nav => { this.navigator = nav; }}/>   
      );
    } else {
      return (
          <SignIn updateLoggedInState={this.updateLoggedInState.bind(this)} />   
      );
    }  
  }
}

AppRegistry.registerComponent('EPRouter', () => EPRouter);