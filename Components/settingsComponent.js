import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');
var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const frame = Dimensions.get('window');

class OptionsContainer extends Component {
    render() {
        return(
            <View>
                <TouchableHighlight onPress={() => 
                    {logOut().then(() => {this.props.navigation.navigate('SignIn')})}}>
                    <Text style={{fontSize:20}}>Log Out</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

class RequestContainer extends Component {
    render() {
        return(
            <View>
                <Text style={{fontSize:20}}>Requests</Text>
            </View>
        )
    }
}

export default class SettingsContents extends Component {
    render() {
        return(
            <View style={{flex:1,backgroundColor:'white'}}>
                <RequestContainer/>
                <OptionsContainer/>
            </View>
        )
    }
}

function logOut() {
    return new Promise(function(resolve, reject) {
        firebaseApp.auth().signOut()
        AsyncStorage.clear()
        resolve(true)
    })
}