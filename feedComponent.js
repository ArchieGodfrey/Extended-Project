import actions from "ExtendedProject/Actions"
import firebase from 'ExtendedProject/firebaseConfig'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions
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
    dataSource: ds.cloneWithRows(['hello']),
  }
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

    this.feedValue = new Animated.Value(0)
}

getFollowing() {
  var results = []
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

updateListView() {
  this.setState({dataSource: this.state.dataSource.cloneWithRows(actions.postList)})
}

async newGetPosts(post) {
  function getPosts()  {
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
                     })
                   })
                 })
               })
             })
           } else {
             alert("There was a problem getting posts")
             this.logOut()
             this.setState(modalVisible: actions.visible)
           }
         })
    } catch (error) {
      // Error retrieving data
      alert("There was a problem getting posts")
      this.logOut()
      this.setState(modalVisible: actions.visible)
    }
  }
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(getPosts())}, 1000)
    })
  }

likePost() {
  let {
    otherUserID,postDate,UserID
  } = this.state
  var likesRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + moment(postDate, "MMMM Do, h:mm:ss").format('MMDDYYYYhmmss') + "/likedBy/")
  likesRef.once("value")
    .then(function(snapshot) {
      if (snapshot.val() !== null) {
        snapshot.forEach(function(childSnapshot) {
          if (childSnapshot.key !== UserID) {
            var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + moment(postDate, "MMMM Do, h:mm:ss").format('MMDDYYYYhmmss'))
            postsRef.child("likes").once('value', (likesSnapshot) => {
              actions.postLikes = likesSnapshot.val()
              actions.postLikes = actions.postLikes + 1
            })
            postsRef.update( {
              likes: actions.postLikes,
            });
            postsRef.child('likedBy/' + UserID).update({
              User: UserID
            })
          }
        })
      } else {
        actions.postLikes = 1
        var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts/" + moment(postDate, "MMMM Do, h:mm:ss").format('MMDDYYYYhmmss'))
        postsRef.update( {
          likes: 1
        });
        postsRef.child('likedBy/' + UserID).update({
          User: UserID
        })
      }
  })
  this.setState({postLikes: actions.postLikes})
}

previousPost() {
  this.postIndex = this.postIndex + 1
  this.showPost(this.postIndex).then(() => {
    this.setState({postTitle: actions.prevPostTitle})
    this.setState({otherUserID: actions.prevPostUserID})
    this.setState({postDate: moment(actions.prevPostDate, "MMDDYYYYhmmss").format('MMMM Do, h:mm:ss')})
    this.setState({postDesc: actions.prevPostDesc})
    this.setState({postLikes: actions.prevPostLikes})
    this.prepNextPost(this.postIndex)
    this.prepPrevPost(this.postIndex)
  })
  }

nextPost() {
  if (this.postIndex > 0) {
    this.postIndex = this.postIndex - 1
  }
  this.showPost(this.postIndex).then(() => {
    this.setState({postTitle: actions.nextPostTitle})
    this.setState({otherUserID: actions.nextPosttUserID})
    this.setState({postDate: moment(actions.nextPostDate, "MMDDYYYYhmmss").format('MMMM Do, h:mm:ss')})
    this.setState({postDesc: actions.nextPostDesc})
    this.setState({postLikes: actions.nextPostLikes})
    this.prepNextPost(this.postIndex)
    this.prepPrevPost(this.postIndex)
  })
  }

prepPrevPost(postIndex) {
  actions.postList.map(function(item, i) {
    if (i == postIndex + 1) {
      actions.prevPostUserID = item.USERID
      actions.prevPostTitle = item.TITLE
      actions.prevPostDate = item.DATE
      actions.prevPostDesc = item.DESC
      actions.prevPostLikes = item.LIKES
    }
  })
}

prepNextPost(postIndex) {
  actions.postList.map(function(item, i) {
    if (i == postIndex - 1) {
      actions.nextPostUserID = item.USERID
      actions.nextPostTitle = item.TITLE
      actions.nextPostDate = item.DATE
      actions.nextPostDesc = item.DESC
      actions.nextPostLikes = item.LIKES
    }
  })
}


showPost(index, dir) {
  function loadPost() { () => {
    if (this.loadIndex == 1) {
      this.prepPrevPost()
    } else {
      this.prepNextPost()
    }
  }

  }

  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()}, 1000)
    })
}

showFeed(UserID) {
  var newRef = firebaseApp.database().ref("UserID/" + UserID + "/posts")
  newRef.once("value")
    .then(function(newSnapshot) {
      newSnapshot.forEach(function(newChildSnapshot) {
        actions.postDate = newChildSnapshot.key;
        var postTitleRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + newChildSnapshot.key + "/title")
        postTitleRef.once('value', (titleSnapshot) => {
          actions.postTitle = titleSnapshot.val()
        })
        var postDescRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + newChildSnapshot.key + "/desc")
        postDescRef.once('value', (descSnapshot) => {
          actions.postDesc = descSnapshot.val()
        })
        var postLikesRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + newChildSnapshot.key + "/likes")
        postLikesRef.once('value', (likesSnapshot) => {
          actions.postLikes = likesSnapshot.val()
          actions.loadPost(actions.postTitle,actions.postDesc,newChildSnapshot.key,actions.postLikes,UserID)
        })
      })
    })
  this.animateShow()
}

/*<ListView
  enableEmptySections={true}
  style={{position: 'absolute', top: 0, left: 0}}
  dataSource={this.state.dataSource}
  renderRow={(rowData) =>
  <TouchableHighlight style={{height:60, width:window.width, borderColor: "black", borderWidth:1, justifyContent: "center"}} onPress={() => this.showFeed(rowData.USERID)}>
    <Text  style={{fontSize: 25}}>NAME: {rowData.NAME}</Text>
  </TouchableHighlight>}
/>*/

render() {
  if (this.state.loaded == true) {
    return (
    <View style={{backgroundColor:"white", opacity:1, height: actions.height, width:actions.width}}>
      <Text>Loading...</Text>
    </View>
  )
  } else {
    return(
    <Animated.View style={{transform: [{translateX: this.feedValue}]}}>
      <Text>RESULTS:</Text>
      <ListView
        enableEmptySections={false}
        style={{position: 'absolute', top: 0, left: 0, height: actions.height, width:actions.width}}
        contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
        horizontal={true}
        dataSource={this.state.dataSource}
        renderRow={(rowData) =>
        <View style={{width:actions.width}}>
          <View style={styles.Imagecontainer}>
            <Image
              style={styles.postImage} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/luggageCase.jpg')}/>
          </View>
          <View style={styles.userContainer}>
            <Image
              style={styles.profileIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/Avatar.png')}/>
            <Text style={styles.userName}>{rowData.TITLE}</Text>
              <Image
                style={styles.ClockIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/ClockIcon.png')}/>
              <Text style={styles.dateStyle}>{moment(rowData.DATE, "MMDDYYYYhmmss").format('MMMM Do, h:mma')}</Text>
              <Image
                style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/LikeIcon.png')}/>
              <Text style={styles.likeNumber}>{rowData.LIKES}</Text>
            <Text style={styles.postDesc}>{rowData.DESC}</Text>
          </View>
          <View style={styles.buttons}>
            <TouchableHighlight onPress={this.likePost.bind(this)} underlayColor="#f1f1f1">
              <Image
                style={styles.LikeButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/LikeButton.png')}/>
            </TouchableHighlight>
            <Image
              style={styles.CommentButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/CommentIcon.png')}/>
            <Image
              style={styles.OptionsButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/OptionsIcon.png')}/>
          </View>
        </View>}
      />
    </Animated.View>
    );
  }
}

componentWillMount () {
  this.newGetPosts().then(() => {

    this.getFollowing().then(() => {
      actions.getPostList().then(() => {
        this.setState({loaded: false})
        this.updateListView()
      })
    })
  })
}

animateShow () {
  Animated.parallel([
    Animated.timing(
      this.feedValue,
      {
        toValue: 0,
        duration: 500,
        easing: Easing.linear
      }
    )
  ]).start()
};

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
    resizeMode: 'cover'
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
