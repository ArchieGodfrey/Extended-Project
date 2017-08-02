import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import { NavigationActions } from 'react-navigation'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');
var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const frame = Dimensions.get('window');
const resetAction = NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({ routeName: 'SignIn' }),
    ],
    key: null
});
const navigateAction = NavigationActions.navigate({

  routeName: 'EditAccount',

  params: {},

  action: NavigationActions.navigate({ routeName: 'EditAccount'})
})

class OptionsContainer extends Component {
    render() {
        const {dispatch} = this.props;
        return(
            <View>
                <TouchableHighlight onPress={() => 
                    {logOut().then(() => {this.props.dispatch(resetAction)})}}>
                    <Text style={{fontSize:20,paddingBottom:(frame.height / 20)}}>Log Out</Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => 
                    {this.props.dispatch(navigateAction)}}>
                    <Text style={{fontSize:20}}>Edit Account</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

class RequestContainer extends Component {
    render() {
        return(
            <View>
                <Text style={{fontSize:20,paddingBottom:(frame.height / 20)}}>Requests</Text>
            </View>
        )
    }
}

export default class SettingsContents extends Component {
    render() {
        return(
            <View style={{flex:1,backgroundColor:'white'}}>
                <RequestContainer/>
                <OptionsContainer dispatch={this.props.navigation.dispatch}/>
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