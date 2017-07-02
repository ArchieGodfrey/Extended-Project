import actions from "EPRouter/Actions"
import firebase from 'EPRouter/firebaseConfig'
import LikeComponent from "EPRouter/Components/likeComponent"
import OtherAccountComponent from "EPRouter/Components/otherUserAccount"
import React, { Component } from 'react';
import { StackNavigator  } from 'react-navigation';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage");


const window = Dimensions.get('window');

export default class OtherAccountContents extends Component {
  constructor (props) {
    super(props);
    this.state = {
    loaded: true,
    liking:false,
    lastPress:0,
    }
    this.otherAccountValue = new Animated.Value(1500)
  }

  downloadImage(otherUserID) {
    return new Promise(function(resolve, reject) {
      var Realurl = ""
      firebaseApp.storage().ref('Users/' + otherUserID).child('Profile').getDownloadURL().then(function(url) {
        Realurl = url
        resolve(Realurl)
      }).catch((error) => {
        firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
          Realurl = url2
          resolve(Realurl)
        })
      })
    })
  }

  showAccountInfo(otherUserID) {
    this.props.navigate('UserDetail', { USERID:  otherUserID })
  }

  likeController(otherUserID, postDate) {
    if (this.state.liking == false) {
      this.setState({liking:true})
      this.checklikePost(otherUserID, postDate).then((liked) => {
        this.likePost(otherUserID,postDate,liked).then(() => {
          this.countLikes(otherUserID,postDate).then((likes) => {
            this.setState({likes: likes})
            this.setState({liking:false})
          })
        })
      })
    }
  }

async countLikes(otherUserID,postDate) {
  return new Promise(function(resolve, reject) {
    var likes = 0
    var likesRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate + "/likedBy/")
    likesRef.once("value")
      .then(function(snapshot) {
        if (snapshot.val() !== null) {
          snapshot.forEach(function(childSnapshot) {
            likes = likes + 1
          })
          var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate)
          postsRef.update( {
            likes: likes
          });
        }
        resolve(likes)
      })

  })
}

async likePost(otherUserID,postDate,liked) {
  return new Promise(function(resolve, reject) {
    try {
      AsyncStorage.getItem('@userID:key').then((UserID) => {
      if (liked == true) {
        var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate)
        postsRef.child("likes").once('value', (likesSnapshot) => {
          postsRef.child('likedBy/' + UserID).remove()
          resolve()
        })
      } else {
        var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate)
        postsRef.child("likes").once('value', (likesSnapshot) => {
          postsRef.child('likedBy/' + UserID).update({
            User: UserID
          })
          resolve()
        })
      }
    })
    } catch (error) {
      // Error retrieving data
    }
  })
}

async checklikePost(otherUserID, postDate) {
  return new Promise(function(resolve, reject) {
    var likes = 0
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
               likes = 1
               var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate)
               postsRef.update( {
                 likes: 1
               });
               postsRef.child('likedBy/' + UserID).update({
                 User: UserID
               })
               resolve(false)
             }
         })
       }
     })
   } catch (error) {
     // Error retrieving data
   }


    setTimeout(function() {
      resolve()}, 1000)
    })
}

onPhotoPress() {
    var delta = new Date().getTime() - this.state.lastPress;

    if(delta < 200) {
      // double tap happend
      this.likeController(this.props.USERID,this.props.DATE)
    }

    this.setState({
      lastPress: new Date().getTime()
    })
  }

  render() {
    if (this.state.loaded == false) {
      return (
      <View style={{backgroundColor:"white", opacity:1, height: window.height, width:window.width}}>
        <Text>Loading...</Text>
      </View>
    )
    } else {
      return(
        <View style={{flex:1, width:window.width, height:window.height, position:'absolute'}}>
          <View style={styles.Imagecontainer}>
            <TouchableHighlight onPress={() => this.onPhotoPress()} >
            <Image
              style={styles.postImage} source={{uri: this.props.URI}}/>
            </TouchableHighlight>
          </View>
          <View style={styles.userContainer}>
            <TouchableHighlight onPress={() => this.showAccountInfo(this.props.USERID)} underlayColor="#f1f1f1">
              <Image
                style={styles.profileIcon} source={{uri: this.state.avatarSource}}/>
            </TouchableHighlight>
            <Text style={styles.userName}>{this.props.TITLE}</Text>
              <Image
                style={styles.ClockIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EPRouter/Images/ClockIcon.png')}/>
              <Text style={styles.dateStyle}>{moment(this.props.DATE, "MMDDYYYYhmmss").format('MMMM Do, h:mm')}</Text>
              <Image
                style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EPRouter/Images/LikeIcon.png')}/>
              <LikeComponent USERID={this.props.USERID} DATE={this.props.DATE} />
              <Text style={styles.likeNumber}>{this.state.likes}</Text>
            <Text style={styles.postDesc}>{this.props.DESC}</Text>
          </View>
          <View style={styles.buttons}>
            <TouchableHighlight onPress={() => this.likeController(this.props.USERID,this.props.DATE)} underlayColor="#f1f1f1">
              <Image
                style={styles.LikeButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EPRouter/Images/LikeButton.png')}/>
            </TouchableHighlight>
            <Image
              style={styles.CommentButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EPRouter/Images/CommentIcon.png')}/>
            <Image
              style={styles.OptionsButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EPRouter/Images/OptionsIcon.png')}/>
        </View>
      </View>
)}
}

componentWillMount() {
  const { USERID,TITLE,LIKES,DESC,URI,DATE  } = this.props;
  this.setState({likes:this.props.LIKES})
  const {navigate} = this.props;
  this.likeController(this.props.USERID, this.props.DATE)
  this.downloadImage(this.props.USERID).then((url) => {
    this.setState({avatarSource:url})
  })
}

}

const styles = StyleSheet.create({
  row: {
    fontSize:20,
    alignItems: 'center',
    padding: 25,
    height: 50,
  },
  navBar: {
    flexDirection: 'column',
    padding: 20,
    borderBottomColor: "black",
    borderBottomWidth: 2,
  },
  titleStyle: {
    position: 'absolute',
    top: 20,
    left: 125,
    color: 'black',
    fontSize: 36,
  },
  Imagecontainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  postImage: {
    resizeMode: 'cover',
    width: window.width,
    height: window.height / 2
  },
  userContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  ClockIcon: {
    position: 'absolute',
    top: 40,
    left: 69,
  },
  dateStyle: {
    position: 'absolute',
    top: 40,
    left: 92,
    color: 'grey',
    fontSize: 18,
  },
  profileIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    height: 56,
    width: 51,
  },
  LikeIcon: {
    position: 'absolute',
    top: 25,
    left: 280,
  },
  likeNumber: {
    position: 'absolute',
    top: 25,
    left: 320,
    color: 'black',
    fontSize: 24,
  },
  userName: {
    position: 'absolute',
    top: 15,
    left: 69,
    color: 'black',
    fontSize: 20,
  },
  postDesc: {
    position: 'absolute',
    top: 75,
    left: 30,
    color: 'black',
    fontSize: 15,
  },
  buttons: {
    position: 'absolute',
    top: 385,
  },
  LikeButton: {
    position: 'absolute',
    top: 150,
    left: 5,
  },
  CommentButton: {
    position: 'absolute',
    top: 150,
    left: 110,
  },
  OptionsButton: {
    position: 'absolute',
    top: 150,
    left: 304,
  },
  PageTurn: {
    position: 'absolute',
    top: 623,
  },
});
