import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions.js"
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions,NetInfo
} from 'react-native';

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height
}

let previousValue = new Animated.Value(500)

import { NavigationActions } from 'react-navigation'

const resetAction = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'SignIn'})
  ]
})

const navigateAction = NavigationActions.navigate({

  routeName: 'MainNavigation',

  params: {},

  action: NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Feed'})
  ]
})
})

export default class SignIn extends Component {
  constructor (props) {
    super(props);
    this.state = {
        Username: "",
        password: "",
    }
  }

    componentWillMount() {
      //this.props.navigation.dispatch(resetAction)
      firebaseApp.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in.
            
            try {
                AsyncStorage.setItem('@userID:key', user.uid);
            } catch (error) {
                // Error saving data
                alert('error saving username')
            }
        this.props.navigation.dispatch(navigateAction)
        } else {
            // No user is signed in.     
        }
    })
  }

  render() {
      return (
          <View>
            <View>
                <Text style={{position: 'absolute', top: 25, left: 130, fontSize: 50}}>Login</Text>
                <TextInput
                style={{position: 'absolute', top: 150, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
                placeholder={' Enter email address'}
                onChange={(event) => this.setState({Username: event.nativeEvent.text})}
                autoCapitalize={'none'}
                />
                <TextInput
                    style={{position: 'absolute', top: 200, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
                    placeholder={' Enter password'}
                    secureTextEntry={true}
                    onChange={(event) => this.setState({password: event.nativeEvent.text})}
                    />
                <TouchableHighlight onPress={() => {login(this.state.Username,this.state.password)}} style={{position: 'absolute', top: 260, left: 100}} underlayColor="#f1f1f1">
                    <Text style={{fontSize: 20}}>Login</Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => {slidePageLeft()}} style={{position: 'absolute', top: 300, left: 100}} underlayColor="#f1f1f1">
                    <Text style={{fontSize: 20}}>Create Account</Text>
                </TouchableHighlight>
            </View>

            <Animated.View style={{flex:1,backgroundColor:"white", transform: [{translateX: previousValue}]}}>
                <SignUpPage/>
            </Animated.View>
        </View>
      )
  }
}

class SignUpPage extends React.Component {
    constructor (props) {
    super(props);
    this.state = {
        Username: "",
        password: "",
    }
  }

  async createUser () {
    let {
        Username, password, name
      } = this.state;
    return new Promise(function(resolve, reject) {
      if (name.length >= 1) {
        if (password.length > 5) {
          firebaseApp.auth().createUserWithEmailAndPassword(Username, password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(errorMessage)
          resolve(false)
          })
          .then(() => {
            var user = firebaseApp.auth().currentUser;
            var userRef = firebaseApp.database().ref("UserID/" + user.uid)
            userRef.update( {
              User: user.uid,
              Name: name,
              Email: Username
            });
            try {
             AsyncStorage.setItem('@userID:key', user.uid);
            } catch (error) {
              // Error saving data
              alert('error saving username')
              resolve(false)
            }
            resolve(true)
          })
        } else {
          alert('Password must be longer than 5 characters')
          resolve(false)
        }
      } else {
        alert('Please enter your name')
        resolve(false)
      }
    })
  }

    render() {
        return(
            <View style={{flex:1}}>
                <Text style={{position: 'absolute', top: 25, left: 50, fontSize: 50}}>Create Account</Text>
                <TextInput
                    style={{position: 'absolute', top: 150, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
                    placeholder={' Enter your name'}
                    onChange={(event) => this.setState({name: event.nativeEvent.text})}
                />
                <TextInput
                style={{position: 'absolute', top: 200, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
                placeholder={' Enter email address'}
                onChange={(event) => this.setState({Username: event.nativeEvent.text})}
                autoCapitalize={'none'}
                />
                <TextInput
                    style={{position: 'absolute', top: 250, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
                    placeholder={' Enter password'}
                    secureTextEntry={true}
                    onChange={(event) => this.setState({password: event.nativeEvent.text})}
                />
                <TouchableHighlight onPress={() => {this.createUser().then((result) => {if (result == true) {this.moveRight()}})}} style={{position: 'absolute', top: 310, left: 100}} underlayColor="#f1f1f1">
                    <Text style={{fontSize: 20}}>Create Account</Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => {slidePageRight()}} style={{position: 'absolute', top: 350, left: 100}} underlayColor="#f1f1f1">
                    <Text style={{fontSize: 20}}>Back</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

function login(Username,password) {
    return new Promise(function(resolve, reject) {
        firebaseApp.auth().signInWithEmailAndPassword(Username, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
            resolve(false)
        })
    })
  }

function slidePageLeft () {
    Animated.parallel([
      Animated.timing(
        previousValue,
        {
          toValue: 0,
          duration: 550,
          easing: Easing.linear
        })
    ]).start()
  };

function slidePageRight () {
    Animated.sequence([
      Animated.timing(
        previousValue,
        {
          toValue: 500,
          duration: 550,
          easing: Easing.linear
        }
      )
    ]).start()
  };
