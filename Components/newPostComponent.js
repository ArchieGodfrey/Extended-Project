import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions.js"
import firebase from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/firebaseConfig'
import dismissKeyboard from 'dismissKeyboard'
import RNFetchBlob from 'react-native-fetch-blob'

import React, { Component } from 'react';
import {
  Alert,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions,KeyboardAvoidingView
} from 'react-native';

var moment = require('moment');
var ImagePicker = require('react-native-image-picker');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const frame = Dimensions.get('window');

class ImageContainer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      imageSource:"null", 
    }
  }

  componentWillMount() {
    
  } 

  render() {
    if (this.state.imageSource !== "null") {
      return(
      <Image 
        style={{resizeMode: 'cover', height: (frame.height / 2), width: (frame.width)}}
        source={{uri: this.state.imageSource}}/>
    )
    } else {
      return(
      <View style={{marginTop:(frame.height / 40), marginBottom:(frame.height / 40),
        alignItems:'center', borderColor:'grey',borderBottomWidth:1,}}>
        <TouchableHighlight>
          <Text style={{fontSize:20,marginBottom:(frame.height / 40)}}>Add an Image or Video</Text>
        </TouchableHighlight>
      </View>
    )
    }
    
  }
}

class PostDetails extends Component {
  constructor (props) {
    super(props);
    this.state = {
      avatarSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/greyBackground.png", 
    }
  }

  componentWillMount() {
    functions.getFromAsyncStorage("@userID:key").then((UserID) => {
      functions.getProfilePicture(UserID).then((URI) => {
        this.setState({avatarSource:URI})
      })
    })
  }

  render() {
    return(
      <View style={{flexDirection:'row',marginLeft:(frame.width / 40),marginTop:(frame.width / 40)}} >
          <Image style={{resizeMode: 'cover', height: (frame.height / 10), 
            width: (frame.width / 6)}} source={{uri: this.state.avatarSource}} />
        <View style={{flexDirection:'column',marginTop:(frame.height / 80),marginLeft:(frame.height / 80)
          ,marginBottom:(frame.height / 160)}}> 
          <TextInput style={{fontSize:22, height:(frame.height / 20)}} 
            placeholder={'Title'}/>
          <View style={{alignSelf:'flex-end',flexDirection:'row', marginTop: (frame.height / 80), 
            marginBottom: (frame.height / 40), marginRight:(frame.width / 10)}} >
            <Text style={{fontSize:16,color:'grey'}}>
              {moment().calendar()}
            </Text>
          </View>
        </View>
      </View>
      
    )
  }
}

class DescriptionContainer extends Component {
  componentWillMount() {
    
  }

  render() {
    return(
      <View style={{borderColor:'grey',borderBottomWidth:1,
      marginTop: (frame.height / 80), marginLeft:(frame.width / 10), marginRight:(frame.width / 10)}} >
        <TextInput style={{fontSize:20, height:(frame.height / 20)}}
          placeholder={'Description'}
          multiline={true}
          maxLength={300}/>
      </View>
      
    )
  }
}

class Footer extends Component {
  constructor (props) {
    super(props);
    this.state = {date:"2016-05-15"}
  }

  componentWillMount() {
    const { DATE } = this.props;
  }

  render() {
    return(
      <View style={{alignSelf:'flex-start', marginTop: (frame.height / 80),flexDirection:'row'}}>
      <Image
          style={{resizeMode: 'cover', height: (frame.height / 34), width:(frame.width / 18)}} 
          source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/ClockIcon.png')}/>
        <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 10), marginRight:(frame.width / 40)}}
          placeholder={'Day'}
          maxLength={2}/>
          <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 10), marginRight:(frame.width / 40)}}
          placeholder={'Month'}
          maxLength={2}/>
          <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 5), marginRight:(frame.width / 40)}}
          placeholder={'Year'}
          maxLength={4}/>
          <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 5), marginRight:(frame.width / 40)}}
          placeholder={'Time'}
          maxLength={4}/>
      </View>
      
    )
  }
}

export default class NewPostTemplate extends Component {
  render() {
    return(
      <View style={{flex:1,backgroundColor:'white'}}>
        <ImageContainer />
        <PostDetails />
        <DescriptionContainer />    
        <Footer />  
      </View>
    )
  }
}