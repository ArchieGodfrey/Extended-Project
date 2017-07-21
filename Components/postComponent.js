import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import LikeComponent from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/likeComponent"
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
    const { USERID,DATE,URI  } = this.props;

  }

  render() {
    return(
      <Image 
        style={{resizeMode: 'cover', height: (frame.height / 2), width: (frame.width)}}
        source={{uri: this.props.URI}}/>
    )
  }
}

class PostDetails extends Component {
  constructor (props) {
    super(props);
    this.state = {
      avatarSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/blackBackground.png", 
    }
  }

  componentWillMount() {
    const { USERID,DATE,TITLE,LIKES  } = this.props;
    functions.getProfilePicture(this.props.USERID).then((URI) => {
      this.setState({avatarSource:URI})
    })
  }

  render() {
    return(
      <View style={{flexDirection:'row',marginLeft:(frame.width / 40),marginTop:(frame.width / 40)}} >
        <Image style={{resizeMode: 'cover', height: (frame.height / 10), width: (frame.width / 6)}} source={{uri: this.state.avatarSource}} />
        <Text style={{fontSize:20,marginTop:(frame.height / 80),marginLeft:(frame.height / 80),marginBottom:(frame.height / 160)}}>
          {this.props.TITLE}
        </Text>
        <LikeComponent USERID={this.props.USERID} DATE={this.props.DATE} />
      </View>
      
    )
  }
}

class DescriptionContainer extends Component {
  constructor (props) {
    super(props);
  }

  componentWillMount() {
    const { USERID,DESC } = this.props;
  }

  render() {
    return(
      <View style={{flex:1,borderColor:'grey',borderBottomWidth:1,
      marginTop: (frame.height / 80), marginLeft:(frame.width / 10), marginRight:(frame.width / 10)}} >
        <Text style={{fontSize:16}}>
          {this.props.DESC}
        </Text>
      </View>
      
    )
  }
}



export default class PostTemplate extends Component {

  componentWillMount() {
    const { URI,USERID,DATE,TITLE,DESC,LIKES } = this.props;
    functions.getFromAsyncStorage("@userID:key").then((UserID) => {
      //functions.getTimeline(UserID) 
    })
  }

  render() {
    return(
      <View style={{flex:1}}>
        <ImageContainer URI={this.props.URI}/>
        <PostDetails style={{borderColor:'grey',borderTopWidth:1,borderBottomWidth:1,}} 
          USERID={this.props.USERID} DATE={this.props.DATE} TITLE={this.props.TITLE} />
        <DescriptionContainer DESC={this.props.DESC}/>      
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
