import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import React, { Component } from 'react';
import { StackNavigator  } from 'react-navigation';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage");

const frame = Dimensions.get('window');

class ImageContainer extends Component {
  componentWillMount() {
    const { USERID,DATE  } = this.props;

  }

  render() {
    return(
      <Image 
        style={{resizeMode: 'cover', height: (frame.width / 4), width: (frame.width / 4)}}
        source={{uri: this.state.avatarSource}}/>
    )
  }
}

class PostDetails extends Component {
  componentWillMount() {
    const { USERID,TITLE,DESC,LIKES  } = this.props;

  }

  render() {
    return(
      <View>
        <Text>
        {this.props.TITLE}
      </Text>
      </View>
      
    )
  }
}

export default class PostTemplate extends Component {

  componentWillMount() {
    const { USERID,DATE,TITLE,DESC,LIKES } = this.props;
    functions.getFromAsyncStorage("@userID:key").then((UserID) => {
      //functions.getTimeline(UserID) 
    })
  }

  render() {
    return(
      <View>
        <PostDetails USERID={this.props.USERID} TITLE={this.props.TITLE} DESC={this.props.DESC} LIKES={this.props.LIKES}/>
      </View>
    )
  }


  /*
  Image(Optional)
  Profile Pic - Name - Title - Likes
  Desc(Optional)
  Timestamp
  */
}
