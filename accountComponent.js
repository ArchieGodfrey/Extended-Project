import actions from "ExtendedProject/Actions"
import firebase from 'ExtendedProject/firebaseConfig'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const window = Dimensions.get('window');

export default class PostContents extends Component {
  constructor (props) {
    super(props);
    this.state = {
    Username: "Loading",
    name: "Loading",
    profDesc: "Loading"
  }
}

getAccountInfo() {
  function getAccount() {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var nameRef = firebaseApp.database().ref("UserID/"+ value + "/Name")
       nameRef.once('value', (nameSnapshot) => {
         actions.name = nameSnapshot.val();
       });
       var descRef = firebaseApp.database().ref("UserID/"+ value + "/ProfDesc")
       descRef.once('value', (descSnapshot) => {
         actions.profDesc =  descSnapshot.val();
        });
        var emailRef = firebaseApp.database().ref("UserID/"+ value + "/Email")
        emailRef.once('value', (emailSnapshot) => {
          actions.Username =  emailSnapshot.val();
         });
      });
    } catch(error) {
      alert(error)
    }
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve()}, 1000)
      })
  }

  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(getAccount())}, 1000)
    })
}

  render() {
    if (this.state.loaded == true) {
      return (
      <View style={{backgroundColor:"white", opacity:1, height: actions.height, width:actions.width}}>
        <Text>Loading...</Text>
      </View>
    )
    } else {
      return(
        <View>
          <Image
            style={{position: 'absolute', top: 25, left: 25, height: 56, width: 51}} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/Avatar.png')}/>
          <Text style={{position: 'absolute', top: 25, left: 100, fontSize: 20}}>NAME: {this.state.name}</Text>
          <Text style={{position: 'absolute', top: 60, left: 100, fontSize: 20}}>EMAIL: {this.state.Username}</Text>
          <Text style={{position: 'absolute', top: 100, left: 25, fontSize: 20}}>{this.state.profDesc}</Text>
        </View>
      )}
    }
    componentWillMount() {
      this.getAccountInfo().then(() => {
        this.setState({name: actions.name})
        this.setState({profDesc: actions.profDesc})
        this.setState({Username: actions.Username})
        this.setState({loaded: false})
      })
    }

}
