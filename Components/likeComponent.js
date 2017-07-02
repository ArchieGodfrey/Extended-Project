import actions from "Extended-Project/Actions"
import firebase from 'Extended-Project/firebaseConfig'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const window = Dimensions.get('window');

export default class likeButton extends Component {
  constructor(props) {
    super(props);
    this.update = true
    this.liked = false
    this.likeValue = new Animated.Value(0)
  }

  render() {
    return (
        <Animated.Image style={{position: 'absolute', top: 25, left: 280, opacity: this.likeValue}}
             source={require('Extended-Project/Images/LikedIcon.png')}/>
    );
  }

  readyToGetLikes() {
    if (this.update == true) {
      const { USERID,DATE  } = this.props;
      this.getLikes(this.props.USERID,this.props.DATE ).then((value) => {
        if (value == true) {
          Animated.timing(
            this.likeValue,
            {
              toValue: 1,
              duration: 250,
              easing: Easing.linear
            }).start()
        } else {
          Animated.timing(
            this.likeValue,
            {
              toValue: 0,
              duration: 350,
              easing: Easing.linear
            }).start()
        }
        this.readyToGetLikes()
      })
    }
  }

  componentWillMount() {
    this.readyToGetLikes()
}
  componentWillUnmount() {
    this.update = false
  }

async getLikes(otherUserID, postDate) {
  return new Promise(function(resolve, reject) {
    var liked = false
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var UserID = value
       if (UserID !== null) {
         var likesRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate + "/likedBy/")
         likesRef.once("value")
           .then(function(snapshot) {
             if (snapshot.val() !== null) {
               snapshot.forEach(function(childSnapshot) {
                 if (childSnapshot.key == UserID) {
                  resolve(true)
                 }
               })
               resolve(false)
             } else {
               resolve(false)
             }
       })
     }
     })
   } catch (error) {
     // Error retrieving data
     alert("There was a problem getting posts")
     resolve(false)
   }


    setTimeout(function() {
      resolve(false)}, 1000)
    })
  }
}
