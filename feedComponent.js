import actions from "EP/Actions"
import firebase from 'EP/firebaseConfig'
import dismissKeyboard from 'dismissKeyboard'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const window = Dimensions.get('window');

export default class PostContents extends Component {
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
    loaded: true,
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
                     actions.postDate = newChildSnapshot.key;
                     var postTitleRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/posts/" + newChildSnapshot.key + "/title")
                     postTitleRef.once('value', (titleSnapshot) => {
                       actions.postTitle = titleSnapshot.val()
                     })
                     var postDescRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/posts/" + newChildSnapshot.key + "/desc")
                     postDescRef.once('value', (descSnapshot) => {
                       actions.postDesc = descSnapshot.val()
                     })
                     var postLikesRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/posts/" + newChildSnapshot.key + "/likes")
                     postLikesRef.once('value', (likesSnapshot) => {
                       actions.postLikes = likesSnapshot.val()
                       actions.loadPost(actions.postTitle,actions.postDesc,newChildSnapshot.key,actions.postLikes,childSnapshot.key)
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

likePost(otherUserID, postDate) {
  return new Promise(function(resolve, reject) {
    var likes = 0
    var UserID = actions.UserID
    var likesRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate + "/likedBy/")
    likesRef.once("value")
      .then(function(snapshot) {
        if (snapshot.val() !== null) {
          snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.key !== UserID) {
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
        }
    })
    setTimeout(function() {
      resolve()}, 1000)
    })
}

getLikes(otherUserID, postDate) {
  return new Promise(function(resolve, reject) {
    var likes = 0
    var likesRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate + "/likedBy/")
    likesRef.once("value")
      .then(function(snapshot) {
        if (snapshot.val() !== null) {
          snapshot.forEach(function(childSnapshot) {
            var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + postDate)
            postsRef.child("likes").once('value', (likesSnapshot) => {
              likes = likesSnapshot.val() + 1
            })
          })
        } else {
          likes = 0
        }
    })
    setTimeout(function() {
      resolve(alert(likes))}, 1000)
    })
}

newPost () {
  var timeKey = moment().format('MMDDYYYYhmmss')
  var postTitle = this.state.postTitle
  var postDesc = this.state.postDesc
  try {
  AsyncStorage.getItem('@userID:key').then((value) => {
           this.setState({UserID: value});
           var postsRef = firebaseApp.database().ref("UserID/"+ this.state.UserID + "/posts")
           postsRef.child(timeKey).update( {
             title: postTitle,
             desc: postDesc
           });
           this.clearText()
           this.rotateCross()
           });;
} catch(error) {
  alert('Failed to post!')
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
    return(
    <Animated.View style={{transform: [{translateX: this.feedValue}]}}>
      <TouchableHighlight
        onPress={this.rotateCross.bind(this)}
        style={{width: 40,height: 30, position: 'absolute',top: -44, height:25, width:25, left: 325 }}
        underlayColor="#f1f1f1">
        <Animated.Image
         style={{position: 'absolute',top: 0, height:25, width:25, left: 0, transform: [{rotate: cross}]}}
         source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/PlusIcon.png')}/>
      </TouchableHighlight>
      <ListView
        enableEmptySections={true}
        style={{position: 'absolute', top: 0, left: 0, height: window.height, width:window.width}}
        contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
        horizontal={true}
        dataSource={this.state.dataSource}
        renderRow={(rowData) =>
        <View style={{width:actions.width}}>
          <View style={styles.Imagecontainer}>
            <Image
              style={styles.postImage} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/luggageCase.jpg')}/>
          </View>
          <View style={styles.userContainer}>
            <Image
              style={styles.profileIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/Avatar.png')}/>
            <Text style={styles.userName}>{rowData.TITLE}</Text>
              <Image
                style={styles.ClockIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/ClockIcon.png')}/>
              <Text style={styles.dateStyle}>{moment(rowData.DATE, "MMDDYYYYhmmss").format('MMMM Do, h:mma')}</Text>
              <Image
                style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/LikeIcon.png')}/>
              <Text style={styles.likeNumber}>{rowData.LIKES}</Text>
            <Text style={styles.postDesc}>{rowData.DESC}</Text>
          </View>
          <View style={styles.buttons}>
            <TouchableHighlight onPress={() => this.likePost(rowData.USERID,rowData.DATE).then(() => {this.newGetPosts().then(() => {actions.getPostList().then(() => {this.updateListView()})})})} underlayColor="#f1f1f1">
              <Image
                style={styles.LikeButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/LikeButton.png')}/>
            </TouchableHighlight>
            <Image
              style={styles.CommentButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/CommentIcon.png')}/>
            <Image
              style={styles.OptionsButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/OptionsIcon.png')}/>
          </View>
        </View>}
      />
    <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: -2,  backgroundColor: "white",transform: [{translateX: this.previousValue}]}}>
        <Text style={{position: 'absolute', top: 10, left: 100, fontSize: 25}}>Create a new post</Text>
        <TextInput
        style={{position: 'absolute', top: 50, left: 40, height: 40, width: 300, borderColor: 'gray', borderWidth: 1}}
        placeholder={' Enter Post Title'}
        onChange={(event) => this.setState({postTitle: event.nativeEvent.text})}
        ref={component => this._titleInput = component}
        />
        <TextInput
        style={{position: 'absolute', top: 95, left: 40, height: 80, width: 300, borderColor: 'gray', borderWidth: 1}}
        placeholder={' Enter Post description'}
        multiline={true}
        onChange={(event) => this.setState({postDesc: event.nativeEvent.text})}
        ref={component => this._descInput = component}
        />
      <TouchableHighlight onPress={this.newPost.bind(this)} style={{position: 'absolute', top: 155, left: 130, padding:25}} underlayColor="#f1f1f1">
          <Text style={{fontSize: 20}}>Upload</Text>
        </TouchableHighlight>
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
  this.tryLoadFeed()

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
    width: window.width
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
