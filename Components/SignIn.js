import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions.js"
import dismissKeyboard from 'dismissKeyboard'
import { NavigationActions } from 'react-navigation'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,ScrollView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions,NetInfo
} from 'react-native';

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const frame = Dimensions.get('window');

let previousValue = new Animated.Value(500)

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({ routeName: 'MainNavigation' }),
    ],
    key: null
});

export default class SignIn extends Component {
  constructor (props) {
    super(props);
    this.state = {
        Username: "",
        password: "",
    }
  }

    componentWillMount() {
      firebaseApp.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in.
            try {
                AsyncStorage.setItem('@userID:key', user.uid);
            } catch (error) {
                // Error saving data
                alert('error saving username')
            }
        this.props.navigation.dispatch(resetAction)
        } else {
            // No user is signed in.     
        }
    })
  }

  render() {
      return (
          <ScrollView keyboardShouldPersistTaps="never" scrollEnabled={false} 
            style={{backgroundColor:'white'}}>
            <View style={{width:(frame.width),alignItems:"center",justifyContent:"center"}}>
                <Text style={{fontSize: 50,marginTop:(frame.height / 10)}}>Login</Text>
                <TextInput
                style={{height: (frame.height / 20), width: (frame.width / 1.5),marginTop:(frame.height / 6), borderColor: 'gray', borderBottomWidth: 1}}
                placeholder={' Email address'}
                onChange={(event) => this.setState({Username: event.nativeEvent.text})}
                autoCapitalize={'none'}
                />
                <TextInput
                    style={{height: (frame.height / 20), width: (frame.width / 1.5),marginTop:(frame.height / 80), borderColor: 'gray', borderBottomWidth: 1}}
                    placeholder={' Password'}
                    secureTextEntry={true}
                    onChange={(event) => this.setState({password: event.nativeEvent.text})}
                    />
                <TouchableHighlight onPress={() => {login(this.state.Username,this.state.password)}} 
                     style={{marginTop:(frame.height / 20)}} underlayColor="#f1f1f1">
                    <Text style={{fontSize: 24}}>Login</Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => {slidePageLeft()}} 
                     style={{marginTop:(frame.height / 40)}} underlayColor="#f1f1f1">
                    <Text style={{fontSize: 24}}>Create an Account</Text>
                </TouchableHighlight>
            </View>

            <Animated.View style={{position:'absolute',top:0,height:(frame.height),width:(frame.width),backgroundColor:"white", transform: [{translateX: previousValue}]}}>
                <SignUpPage/>
            </Animated.View>
        </ScrollView>
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
            <View style={{backgroundColor:"white",alignItems:"center",justifyContent:"center"}}>
                <Text style={{fontSize: 50,marginTop:(frame.height / 10)}}>Create Account</Text>
                <TextInput
                    style={{height: (frame.height / 20), width: (frame.width / 1.5),marginTop:(frame.height / 6), borderColor: 'gray', borderBottomWidth: 1}}
                    placeholder={' Name'}
                    onChange={(event) => this.setState({name: event.nativeEvent.text})}
                />
                <TextInput
                style={{height: (frame.height / 20), width: (frame.width / 1.5),marginTop:(frame.height / 80), borderColor: 'gray', borderBottomWidth: 1}}
                placeholder={' Email address'}
                onChange={(event) => this.setState({Username: event.nativeEvent.text})}
                autoCapitalize={'none'}
                />
                <TextInput
                    style={{height: (frame.height / 20), width: (frame.width / 1.5),marginTop:(frame.height / 80), borderColor: 'gray', borderBottomWidth: 1}}
                    placeholder={' Password'}
                    secureTextEntry={true}
                    onChange={(event) => this.setState({password: event.nativeEvent.text})}
                />
                <TouchableHighlight onPress={() => {this.createUser().then((result) => {if (result == true) {this.moveRight()}})}} 
                     style={{marginTop:(frame.height / 20)}} underlayColor="#f1f1f1">
                    <Text style={{fontSize: 24}}>Create</Text>
                </TouchableHighlight>
                <TouchableHighlight style={{marginTop:(frame.height / 40)}} onPress={() => {slidePageRight()}} 
                     underlayColor="#f1f1f1">
                    <Text style={{fontSize: 24}}>Back</Text>
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
        dismissKeyboard()
    })
  }

function slidePageLeft () {
    Animated.parallel([
      Animated.timing(
        previousValue,
        {
          toValue: 0,
          duration: 150,
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
          duration: 150,
          easing: Easing.linear
        }
      )
    ]).start()
  };
