import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import React, { Component } from 'react';
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
      imageSource:null, 
    }
  }

  componentWillMount() {
    const { USERID,DATE } = this.props;
      functions.getPostPhoto(this.props.USERID,DATE).then((URI) => {
        this.setState({imageSource:URI})
      }) 
  } 

  render() {
    if (this.state.imageSource !== null) {
      return(
      <Image 
        style={{resizeMode: 'cover', height: (frame.height / 2), width: (frame.width)}}
        source={{uri: this.state.imageSource}}/>
    )
    } else {
      return(
      <View style={{marginBottom:(frame.height / 40),borderColor:'grey',borderBottomWidth:1,}}></View>
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
    const { USERID,DATE,TITLE,LIKES  } = this.props;
    functions.getProfilePicture(this.props.USERID).then((URI) => {
      this.setState({avatarSource:URI})
    })
  }

  transition(location) {
    this.props.navigate('UserDetail', { USERID:  this.props.USERID })
}

  render() {
    return(
      <View style={{flexDirection:'row',marginLeft:(frame.width / 40),marginTop:(frame.width / 40)}} >
        <TouchableHighlight onPress={() => {if (this.props.DATE !== null) {this.transition("UserDetail")}}}>
          <Image style={{resizeMode: 'cover', height: (frame.height / 10), 
            width: (frame.width / 6)}} source={{uri: this.state.avatarSource}} />
        </TouchableHighlight>
        
        <View style={{flexDirection:'column',marginTop:(frame.height / 80),marginLeft:(frame.height / 80)
          ,marginBottom:(frame.height / 160)}}> 
          <Text style={{fontSize:22}}>
            {this.props.TITLE}
          </Text>
          <View style={{alignSelf:'flex-end',flexDirection:'row', marginTop: (frame.height / 80), 
            marginBottom: (frame.height / 40), marginRight:(frame.width / 10)}} >
            <Text style={{fontSize:16,color:'grey'}}>
              {moment(this.props.DATE, "MMDDYYYYHHmmss").format('MMMM Do YYYY, HH:mm')}
            </Text>
          </View>
        </View>
        <LikeComponent style={{marginTop:(frame.height / 20), alignSelf:'flex-end'}} USERID={this.props.USERID} DATE={this.props.DATE} />
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
      marginTop: (frame.height / 80), marginLeft:(frame.width / 10), marginRight:(frame.width / 10)}} >
        <Text style={{fontSize:20,marginBottom: (frame.height / 40)}}>
          {this.props.DESC}
        </Text>
      </View>
      
    )
  }
}

class Footer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      expirationDate:null, 
    }
  }

  componentWillMount() {
    const { USERID,DATE } = this.props;
    functions.getExpiration(USERID,DATE).then((data) => {
      this.setState({expirationDate:data})
    })
  }

  render() {
    if (this.state.expirationDate !== null) {
      return(
      <View style={{marginTop: (frame.height / 40), alignSelf:'center',flexDirection:'row'}}>
        <Text style={{paddingRight:(frame.width / 20),fontSize:18,color:'black'}}>2 Comments</Text>
        <View style={{flexDirection:'row',marginBottom: (frame.height / 40)}} >
        <Image
          style={{resizeMode: 'cover', height: (frame.height / 34), width:(frame.width / 18)}} 
          source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/ClockIcon.png')}/>
        <Text style={{paddingLeft:(frame.width / 80),fontSize:16,color:'grey'}}>
          {moment(this.state.expirationDate, "MMDDYYYYHHmm").format('MMMM Do YYYY, HH:mm')}
        </Text>
        </View>
      </View>
    )
    } else {
      return(
      <View style={{marginTop: (frame.height / 40), alignSelf:'center',flexDirection:'row'}}>
        <Text style={{paddingRight:(frame.width / 20),fontSize:18,color:'black'}}>2 Comments</Text>
      </View>
    )
    }
    
  }
}

class LikeComponent extends Component {
  constructor(props) {
    super(props);
    this.update = true
    this.liked = false
    this.likeValue = new Animated.Value(0)
  }

  render() {
    return (
        <Animated.Image style={{opacity: this.likeValue}}
             source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/LikedIcon.png')}/>
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

export default class PostTemplate extends Component {
  componentWillMount() {
    const { USERID,DATE,TITLE,DESC,LIKES,navigate} = this.props;
    
  }

  render() {
    return(
      <View style={{flex:1,backgroundColor:'white', paddingBottom:(frame.height / 40)}}>
        <ImageContainer USERID={this.props.USERID} DATE={this.props.DATE}/>
        <PostDetails navigate={this.props.navigate}
          USERID={this.props.USERID} DATE={this.props.DATE} TITLE={this.props.TITLE} />
        <DescriptionContainer DESC={this.props.DESC}/>    
        <Footer USERID={this.props.USERID} DATE={this.props.DATE}/>  
      </View>
    )
  }
}
