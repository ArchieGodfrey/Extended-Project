import actions from "EP/Actions"
import firebase from 'EP/firebaseConfig'
import LikeComponent from "EP/likeComponent"
import OtherAccountComponent from "EP/otherUserAccount"
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")


const window = Dimensions.get('window');

export default class OtherAccountContents extends Component {
  constructor (props) {
    super(props);
    this.state = {
    loaded: true,
    key:0,
    showAccount:0,
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
    this.setState({otherUser: otherUserID})
    this.setState({showAccount:1})
    this.showOtherAccount()
    this.setState({ key: Math.random() })
  }

  likeController(otherUserID, postDate) {
    if (this.state.liking == false) {
      this.setState({liking:true})
      this.likePost(otherUserID, postDate).then(() => {
        this.tryLoadFeed()
        this.setState({liking:false})
      })
    }
  }

likePost(otherUserID, postDate) {
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
                  liked = true
                 }
               })
             } else {
               likes = 1
               var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate)
               postsRef.update( {
                 likes: 1
               });
               postsRef.child('likedBy/' + UserID).update({
                 User: UserID
               })
               resolve(likes)
             }
         }).then(() => {
             if (liked == true) {
               var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate)
               postsRef.child("likes").once('value', (likesSnapshot) => {
                 likes = likesSnapshot.val() - 1
                 postsRef.update( {
                   likes: likes
                 });
                 postsRef.child('likedBy/' + UserID).remove()
               })
               resolve(likes)
             } else {
               var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate)
               postsRef.child("likes").once('value', (likesSnapshot) => {
                 likes = likesSnapshot.val() + 1
                 postsRef.update( {
                   likes: likes
                 });
                 postsRef.child('likedBy/' + UserID).update({
                   User: UserID
                 })
               })
               resolve(likes)
             }
         })
       }
     })
   } catch (error) {
     // Error retrieving data
     alert("There was a problem getting posts")
     resolve(likes)
   }


    setTimeout(function() {
      resolve()}, 1000)
    })
}

getLikes(otherUserID, postDate) {
  return new Promise(function(resolve, reject) {
    var likes = 0
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var UserID = value
       if (UserID !== null) {
         var likesRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate + "/likedBy/")
         likesRef.once("value")
           .then(function(snapshot) {
             if (snapshot.val() !== null) {
               var liked = true
               snapshot.forEach(function(childSnapshot) {
                 if (childSnapshot.key !== UserID) {
                   resolve(0)
                 } else {
                   resolve(1)
                 }
               })
             } else {
               resolve(1)
             }
           })
         }
       })
     } catch (error) {
       // Error retrieving data
       resolve(false)
     }

      setTimeout(function() {
        resolve(false)}, 1000)
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
        <View style={{width:window.width, height:window.height, position:'absolute'}}>
          <View style={styles.Imagecontainer}>
            <Image
              style={styles.postImage} source={{uri: this.props.URI}}/>
          </View>
          <View style={styles.userContainer}>
            <TouchableHighlight onPress={() => this.showAccountInfo(this.props.USERID)} underlayColor="#f1f1f1">
              <Image
                style={styles.profileIcon} source={{uri: this.state.avatarSource}}/>
            </TouchableHighlight>
            <Text style={styles.userName}>{this.props.TITLE}</Text>
              <Image
                style={styles.ClockIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/ClockIcon.png')}/>
              <Text style={styles.dateStyle}>{moment(this.props.DATE, "MMDDYYYYhmmss").format('MMMM Do, h:mm')}</Text>
              <Image
                style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/LikeIcon.png')}/>
              <LikeComponent USERID={this.props.USERID} DATE={this.props.DATE} />
              <Text style={styles.likeNumber} ref={component => this._likeNum = component}>{this.props.LIKES}</Text>
            <Text style={styles.postDesc}>{this.props.DESC}</Text>
          </View>
          <View style={styles.buttons}>
            <TouchableHighlight onPress={() => this.likeController(this.props.USERID,this.props.DATE)} underlayColor="#f1f1f1">
              <Image
                style={styles.LikeButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/LikeButton.png')}/>
            </TouchableHighlight>
            <Image
              style={styles.CommentButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/CommentIcon.png')}/>
            <Image
              style={styles.OptionsButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/OptionsIcon.png')}/>
        </View>

        <Animated.View key={this.state.key} style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: -2,  backgroundColor: "white", flex:1, backgroundColor: '#FFFFFF', transform: [{translateY: this.otherAccountValue}] }}>
              <OtherAccountComponent value={this.state.otherUser} visibility={this.state.showAccount}/>
                <TouchableHighlight
                  onPress={this.closeOtherAccount.bind(this)}
                  style={{position: 'absolute', top: 0, height:45, width: 40, left: 0, backgroundColor:"white"}}
                  underlayColor="#f1f1f1">
                <Animated.Image
                  style={{height: 35, width: 25, position: 'absolute', top: 5, left: 5}}  source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/BackIcon.png')}/>
              </TouchableHighlight>
        </Animated.View>
      </View>
)}
}

componentWillMount() {
  const { USERID,TITLE,LIKES,DESC,URI,DATE  } = this.props;
  this.downloadImage(this.props.USERID).then((url) => {
    this.setState({avatarSource:url})
  })
}

showOtherAccount() {
  Animated.sequence([
    Animated.timing(
      this.otherAccountValue,
      {
        toValue: 0,
        duration: 250,
        easing: Easing.linear
      }
    )
  ]).start()
}

closeOtherAccount() {
  Animated.parallel([
    Animated.timing(
      this.otherAccountValue,
      {
        toValue: 1500,
        duration: 250,
        easing: Easing.linear
      }
    ),
  ]).start()
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
