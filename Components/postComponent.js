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
  constructor (props) {
    super(props);
    this.state = {
      imageSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/greyBackground.png", 
    }
  }

  componentWillMount() {
    const { USERID,DATE } = this.props;
      functions.getPostPhoto(this.props.USERID,DATE).then((URI) => {
        this.setState({imageSource:URI})
      }) 
  }

  render() {
    return(
      <Image 
        style={{resizeMode: 'cover', height: (frame.height / 2), width: (frame.width)}}
        source={{uri: this.state.imageSource}}/>
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
        <Image style={{resizeMode: 'cover', height: (frame.height / 10), width: (frame.width / 6)}} source={{uri: this.state.avatarSource}} 
          onPress={transition("UserDetail")}/>
        <View style={{flexDirection:'column',marginTop:(frame.height / 80),marginLeft:(frame.height / 80),marginBottom:(frame.height / 160)}}> 
          <Text style={{fontSize:20}}>
            {this.props.TITLE}
          </Text>
          <View style={{alignSelf:'flex-end',flexDirection:'row', marginTop: (frame.height / 80), 
            marginBottom: (frame.height / 40), marginRight:(frame.width / 10)}} >
            <Text style={{fontSize:16,color:'grey'}}>
              {moment(this.props.DATE, "MMDDYYYYhmmss").format('MMMM Do YYYY')}
            </Text>
          </View>
        </View>
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
      <View style={{borderColor:'grey',borderBottomWidth:1,
      marginTop: (frame.height / 80), marginBottom: (frame.height / 40), marginLeft:(frame.width / 10), marginRight:(frame.width / 10)}} >
        <Text style={{fontSize:16}}>
          {this.props.DESC}
        </Text>
      </View>
      
    )
  }
}

class TimeStamp extends Component {
  constructor (props) {
    super(props);
  }

  componentWillMount() {
    const { DATE } = this.props;
  }

  render() {
    return(
      <View style={{alignSelf:'flex-end',flexDirection:'row', marginTop: (frame.height / 80), 
      marginBottom: (frame.height / 40), marginRight:(frame.width / 10)}} >
        <Image
          style={{resizeMode: 'cover', height: (frame.height / 34), width:(frame.width / 18)}} source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/ClockIcon.png')}/>
        <Text style={{paddingLeft:(frame.width / 80),fontSize:16,color:'grey'}}>
          {moment(this.props.DATE, "MMDDYYYYhmmss").format('MMMM Do YYYY, h:mm')}
        </Text>
        </View>
      
    )
  }
}



export default class PostTemplate extends Component {

  componentWillMount() {
    const { USERID,DATE,TITLE,DESC,LIKES } = this.props;
  }

  render() {
    return(
      <View style={{flex:1,marginBottom:(frame.height / 40)}}>
        <ImageContainer USERID={this.props.USERID} DATE={this.props.DATE}/>
        <PostDetails 
          USERID={this.props.USERID} DATE={this.props.DATE} TITLE={this.props.TITLE} />
        <DescriptionContainer DESC={this.props.DESC}/>    
        <TimeStamp DATE={this.props.DATE}/>  
      </View>
    )
  }
}

function transition(location) {
  this.props.navigation.navigate(location)
}
