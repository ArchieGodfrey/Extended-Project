import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions.js"
import firebase from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/firebaseConfig'
import dismissKeyboard from 'dismissKeyboard'
import RNFetchBlob from 'react-native-fetch-blob'
import ImagePicker from 'react-native-image-crop-picker';

import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import React, { Component } from 'react';
import {
  Alert,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions,KeyboardAvoidingView
} from 'react-native';

var moment = require('moment');
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

  chooseImage() {
    ImagePicker.openPicker({
      width:(frame.width),
      height:(frame.height / 2),
      cropping: true,
      compressImageQuality:1,
    }).then(image => {
      this.setState({imageSource: image.path})
    });
  }

  render() {
    if (this.state.imageSource !== "null") {
      return(
        <TouchableHighlight onPress={() => this.chooseImage()} underlayColor="#f1f1f1">
          <Image 
            style={{resizeMode: 'cover', height: (frame.height / 2), width: (frame.width)}}
            source={{uri: this.state.imageSource}}/>
        </TouchableHighlight>
    )
    } else {
      return(
      <View style={{marginTop:(frame.height / 40), marginBottom:(frame.height / 40),
        alignItems:'center', borderColor:'grey',borderBottomWidth:1,}}>
        <TouchableHighlight onPress={() => this.chooseImage()} underlayColor="#f1f1f1">
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
          <AutoGrowingTextInput style={{fontSize:22, height:(frame.height / 20)}} 
            placeholder={'Title'}
             maxHeight={200}
            minHeight={45}
            />
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
  render() {
    return(
      <View style={{borderColor:'grey',borderBottomWidth:1,
      marginTop: (frame.height / 80), marginLeft:(frame.width / 10), marginRight:(frame.width / 10)}} >
        <AutoGrowingTextInput style={{fontSize:20, height:(frame.height / 20)}}
          placeholder={'Description'}
           maxHeight={200}
          minHeight={45}
          maxLength={300}/>
      </View>
      
    )
  }
}

class Footer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      day:"",
      month:"",
      year:"",
      time:"",
    }
  }

  checkAllDates() {
    if (this.state.day !== "") {
      if (this.state.month !== "") {
        if (this.state.year !== "") {
          if (this.state.time !== "") {
            if (this.state.year.length === 4) {
              if (this.state.year < moment().format('YYYY')) {
                this.setState({year: ""})
                alert('Must expire in the future!') 
              } else if (this.state.year = moment().format('YYYY')) { //If it is this year, days matter
                if (this.state.month >= moment().format('MM')) {
                  if (this.state.day >= moment().format('DD')) {
                    if (this.state.time.length == 5) {
                      if (moment().format('HH:mm') > this.state.time) {
                        this.setState({time: ""}) 
                        alert('Must expire in the future!')
                      } else {
                        dismissKeyboard();
                      }
                    }
                  } else {
                    this.setState({day: ""})
                    alert('Must expire in the future!')
                  }
                } else {
                  this.setState({month: ""})
                  alert('Must expire in the future!') 
                }
              }  else {
                if (this.state.day !== "") {
                  if (this.state.month !== "") {
                    if (this.state.time.length == 5) {
                      if (moment().format('HH:mm') > this.state.time) {
                        this.setState({time: ""}) 
                        alert('Must expire in the future!')
                      } else {
                        dismissKeyboard();
                      }
                    }
                  }
                }
              }
            } 
          }
        }
      }
    }
  }

  checkYear(year) {
    this.setState({year: year})
    if (year.length === 4) {
      if (year < moment().format('YYYY')) {
        this.setState({year: ""})
        alert('Must expire in the future!') 
      } 
    }  
  } 

  checkTime(time) {
    this.setState({time: time})
    temp = time.replace(':','')
    if ((temp.length > 1) && (temp.length < 3)) {
      this.setState({time: temp.concat(':')})
    }   
  } 

  render() {
    return(
      <View style={{alignSelf:'center', marginTop: (frame.height / 80),flexDirection:'column'}}>
        <Text style={{fontSize:12}}>Expiration Date</Text>
        <View style={{alignSelf:'center',flexDirection:'row'}}>
          <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 10), marginLeft:(frame.width / 40)}}
          placeholder={moment().format('DD')}
          keyboardType={"number-pad"}
          value={this.state.day}
          onEndEditing={() => {this.checkAllDates()}}
          onChange={(event) => this.setState({day:event.nativeEvent.text})}
          maxLength={2}/>
          <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 10), marginLeft:(frame.width / 40)}}
          placeholder={moment().format('MM')}
          keyboardType={"number-pad"}
          value={this.state.month}
          onEndEditing={() => {this.checkAllDates()}}
          onChange={(event) => this.setState({month:event.nativeEvent.text})}
          maxLength={2}/>
          <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 6), marginLeft:(frame.width / 40)}}
          placeholder={moment().format('YYYY')}
          keyboardType={"number-pad"}
          value={this.state.year}
          onEndEditing={() => {this.checkAllDates()}}
          onChange={(event) => this.checkYear(event.nativeEvent.text)}
          maxLength={4}/>
          <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 6), marginLeft:(frame.width / 40)}}
          placeholder={moment().format('HH:mm')}
          keyboardType={"number-pad"}
          value={this.state.time}
          onEndEditing={() => {this.checkAllDates()}}
          onChange={(event) => this.checkTime(event.nativeEvent.text)}
          maxLength={5}/>
        </View>
        <TouchableHighlight style={{alignSelf:'center',paddingTop:(frame.height / 40)}}>
          <Text style={{fontSize:20}}>Upload Post</Text>
        </TouchableHighlight>
      </View>
    )
  }
}

export default class NewPostTemplate extends Component {
  render() {
    return(
      <KeyboardAvoidingView style={{flex:1,backgroundColor:'white'}} behavior='position'>
        <ImageContainer />
        <PostDetails />
        <DescriptionContainer />    
        <Footer />  
      </KeyboardAvoidingView>
    )
  }
}

