import actions from "EPRouter/Actions"
import firebase from 'EPRouter/firebaseConfig'
import dismissKeyboard from 'dismissKeyboard'
import PostComponent from "EPRouter/Components/postComponent"
import RNFetchBlob from 'react-native-fetch-blob'
import Interactable from 'react-native-interactable';
import React, { Component } from 'react';
import {
  AppRegistry,Alert,RefreshControl,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions,Platform,KeyboardAvoidingView
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

export default class NewPostContents extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
    modalVisible: false,
    textEntered: false,
    Username: "",
    password: "",
    postTitle: "",
    postDesc: "",
    postImage: "",
    postDate: "",
    Following: [],
    liking:false,
    loaded: true,
    update:false,
    dataSource: ds.cloneWithRows([]),
  }
    this.clearText = this.clearText.bind(this);
    this.postTitle = "Original"
    this.postDesc = "Original"
    this.postIndex = 0
    this.loadIndex = 1
    this.postList = []
    this.post = null
    this.postTitleList = []
    this.postDescList = []
    this.visible = false
    this.UserID = ""
    this.Username = ""
    this.password = ""
    this.date = ""
    this.prevTitle = ""
    this.nextTitle = ""

    this.previousValue = new Animated.Value(500)
    this.crossValue = new Animated.Value(0)
    this.feedValue = new Animated.Value(0)
    this.inputValue = new Animated.Value(0)
}

getFollowing() {
  function following() {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var userID = value;
       if (userID !== null){
         var query = firebaseApp.database().ref("UserID/" + userID + "/following").orderByKey();
         query.once("value")
           .then(function(snapshot) {
             snapshot.forEach(function(childSnapshot) {
               var userRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/Name")
               userRef.once('value', (Snapshot) => {
                 var newRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/posts")
                 newRef.once("value")
                   .then(function(newSnapshot) {
                     newSnapshot.forEach(function(newChildSnapshot) {
                       actions.orderUsers(Snapshot.val(), newChildSnapshot.key)
                     })
                   })
               })
             })
           })
         }
       })
    } catch (error) {
       // Error retrieving data
       actions.badLogin()
    }
  }
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(following())}, 1000)
    })
}

updateListView(list) {
  this.setState({dataSource: this.state.dataSource.cloneWithRows(list)})
}

async newGetPosts() {
  function networkError() {
    Alert.alert(
          'Whoops, we got lost!',
          "We couldn't find your feed, please connect to the internet and try again",
          [
            {text: 'Try again'},
          ]
        )
  }
  function downloadImage(otherUserID,date) {
    return new Promise(function(resolve, reject) {
      var Realurl = ""
      firebaseApp.storage().ref('Users/' + otherUserID).child(date).getDownloadURL().then(function(url) {
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
  return new Promise(function(resolve, reject) {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var UserID = value
       if (UserID !== null) {
         var query = firebaseApp.database().ref("UserID/" + UserID + "/following").orderByKey();
         query.once("value")
           .then(function(snapshot) {
             snapshot.forEach(function(childSnapshot) {
               // key will be "ada" the first time and "alan" the second time
               var key = childSnapshot.key;
               // childData will be the actual contents of the child
               var followedUserID = childSnapshot.val();
               var newRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/posts")
               newRef.once("value")
                 .then(function(newSnapshot) {
                   newSnapshot.forEach(function(newChildSnapshot) {
                     var postTitle, postDesc, postLikes = ""
                     var postTitleRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/posts/" + newChildSnapshot.key + "/title")
                     postTitleRef.once('value', (titleSnapshot) => {
                       postTitle = titleSnapshot.val()
                     })
                     var postDescRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/posts/" + newChildSnapshot.key + "/desc")
                     postDescRef.once('value', (descSnapshot) => {
                       postDesc = descSnapshot.val()
                     })
                     var postLikesRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/posts/" + newChildSnapshot.key + "/likes")
                     postLikesRef.once('value', (likesSnapshot) => {
                       postLikes = likesSnapshot.val()
                     })
                     downloadImage(childSnapshot.key, newChildSnapshot.key).then((url) => {
                       actions.loadPost(postTitle,postDesc,newChildSnapshot.key,postLikes,childSnapshot.key,url)
                       clearTimeout(timeOut)
                       resolve(true)
                     })
                   })
                 })
               })
             })
           }
         })
    } catch (error) {
      // Error retrieving data
      networkError()
    }
    var timeOut = setTimeout(function() {
      networkError()}, 10000)
    })
  }

  uploadImage = (userID, loc, uri, mime = 'application/octet-stream') => {
   return new Promise((resolve, reject) => {
     const uploadUri =  Platform.OS === 'ios' ? uri.replace('file://', '') : uri
     let uploadBlob = null
     const imageRef = firebaseApp.storage().ref('Users/' + userID).child(loc)

     fs.readFile(uploadUri, 'base64')
       .then((data) => {
         return Blob.build(data, { type: `${mime};BASE64` })
       })
       .then((blob) => {
         uploadBlob = blob
         return imageRef.put(blob, { contentType: mime })
       })
       .then(() => {
         uploadBlob.close()
         return imageRef.getDownloadURL()
       })
       .then((url) => {
         resolve(url)
       })
       .catch((error) => {
         reject(error)
     })
   })
  }

  pictureChosen() {
    this.choosePicture().then((result) => {
      this.setState({image:result})
    })
  }

  choosePicture() {
    return new Promise((resolve, reject) => {
    var options = {
    title: 'Select A Picture',
    allowsEditing: true,
    storageOptions: {
      skipBackup: true,
      path: 'images'
    }
  };
  ImagePicker.showImagePicker(options, (response) => {
    console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled image picker');
    }
    else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    }
    else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
    }
    else {
      //let source = { uri: response.uri };

      // You can also display the image using data:
      //let source = { uri: 'data:image/jpeg;base64,' + response.data };
      this.setState({postImage:response.uri})
      resolve(response.uri)
      }
    })
  })
  }

newPost () {
  var timeKey = moment().format('MMDDYYYYhmmss')
  var postTitle = this.state.postTitle
  var postDesc = this.state.postDesc
  var postImage = this.state.postImage
  if (postTitle.length >= 1) {
    try {
    AsyncStorage.getItem('@userID:key').then((value) => {
     this.setState({UserID: value});
     var UserID = value
     var postsRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts")
     postsRef.child(timeKey).update( {
       title: postTitle,
       desc: postDesc
     });
      this.uploadImage(UserID, timeKey, postImage).then(() => {
       this.tryLoadFeed()
     })
      this.clearText()
      this.rotateCross()
      });;
     } catch(error) {
       alert('Failed to post!')
    }
  } else {
    alert("Post must have a title")
  }
}

clearText() {
 this._titleInput.setNativeProps({text: ''});
 this._descInput.setNativeProps({text: ''});
 dismissKeyboard();
}


render() {
  const cross = this.crossValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg','45deg']
})

  if (this.state.loaded == true) {
    return (
      <View style={{backgroundColor:"white", opacity:1, height: actions.height, width:actions.width}}>
        <Text>Loading...</Text>
      </View>
  )
  } else {
    const {navigate} = this.props.navigation;
    return(
    <Animated.View>

    <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: frame.height, width:frame.width, position: 'absolute', top: -2, backgroundColor: "white", flexDirection: "column", justifyContent:"flex-start", alignItems: 'center'}}>
          <Image
           style={{resizeMode: 'cover', height: frame.height / 2, width:frame.width}}
           source={{uri: this.state.postImage}}/>
         <TouchableHighlight onPress={() => this.pictureChosen()} style={{justifyContent:"center", backgroundColor: "white", alignItems: 'center', marginTop:10}} underlayColor="#f1f1f1">
              <Text style={{fontSize: 20}}>Upload A Picture</Text>
        </TouchableHighlight>
        <KeyboardAvoidingView style={{flexDirection: "column", justifyContent:"center", alignItems: 'center', backgroundColor: "white"}} behavior='position'>
        <TextInput
        style={{marginTop: 10, height: 40, width: frame.width - 10, borderColor: 'gray', borderWidth: 1,backgroundColor:'white'}}
        placeholder={' Enter Post Title'}
        onChange={(event) => this.setState({postTitle: event.nativeEvent.text})}
        ref={component => this._titleInput = component}
        />
        <TextInput
        style={{marginTop: 1, height: 80, width: frame.width - 10, borderColor: 'gray', borderWidth: 1,backgroundColor:'white'}}
        placeholder={' Enter Post description'}

        maxLength={300}
        onChange={(event) => this.setState({postDesc: event.nativeEvent.text})}
        ref={component => this._descInput = component}
        />

      <View style={{width:frame.width, height:60, flexDirection: "column", justifyContent:"center", alignItems: 'center', backgroundColor: "white"}}>
        <TouchableHighlight onPress={this.newPost.bind(this)} style={{paddingTop: 10}} underlayColor="#f1f1f1">
              <Text style={{fontSize: 20}}>Upload</Text>
          </TouchableHighlight>
      </View>
      </KeyboardAvoidingView>
      </Animated.View>
    </Animated.View>
    );
  }
}

tryLoadFeed() {
  actions.postList = []
  this.newGetPosts().then((result) => {
    if (result == true) {
      this.getFollowing().then(() => {
        actions.getPostList().then((list) => {
          this.setState({loaded: false})
          this.updateListView(list)
        })
      })
    }
  })
}

componentWillMount () {
  this.setState({loaded: false})
  firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then((url) => {
    this.setState({postImage:url})
  })
  try {
    AsyncStorage.getItem('@userID:key').then((UserID) => {
      var postTitleRef = firebaseApp.database().ref("UserID/" + UserID)
      postTitleRef.on('child_changed', (titleSnapshot) => {
        this.tryLoadFeed()
      })
    })

  } catch (error) {

  }
}

rotateCross () {
  dismissKeyboard();
  if (actions.crossSpun == false) {
    actions.alternateSpin(0)
    Animated.parallel([
      Animated.timing(
        this.crossValue,
        {
          toValue: 1,
          duration: 550,
          easing: Easing.linear
        }),
      Animated.timing(
        this.previousValue,
        {
          toValue: 0,
          duration: 550,
          easing: Easing.linear
        })
    ]).start()
  } else {
    actions.alternateSpin(0)
    Animated.parallel([
      Animated.timing(
        this.crossValue,
        {
          toValue: 0,
          duration: 550,
          easing: Easing.linear
        }),
      Animated.timing(
        this.previousValue,
        {
          toValue: 500,
          duration: 550,
          easing: Easing.linear
        })
    ]).start()
  }
}

    likedAnimation () {
      if (actions.liked == false) {
        actions.alternateSpin(4)
          Animated.timing(
            this.likeValue,
            {
              toValue: 0,
              duration: 550,
              easing: Easing.linear
            }).start()
      } else {
        actions.alternateSpin(4)
          Animated.timing(
            this.likeValue,
            {
              toValue: 1,
              duration: 550,
              easing: Easing.linear
            }).start()
  }
}

}//last




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
    width: frame.width
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
