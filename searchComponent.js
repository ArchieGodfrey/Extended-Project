import actions from "EP/Actions"
import firebase from 'EP/firebaseConfig'
import LikeComponent from "EP/likeComponent"
import dismissKeyboard from 'dismissKeyboard'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView, TouchableOpacity, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const window = Dimensions.get('window');

export default class SearchContents extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
    searchQuery: "",
    resultsOpacity: 0,
    dataSource: ds.cloneWithRows([]),
    searchResults: ds.cloneWithRows([]),
    otherUserID: "",
    otherName: "Loading",
    otherProfDesc: "Loading",
    following: "Loading",
  }
  this.otherAccountValue = new Animated.Value(-500)
  this.profileValue = new Animated.Value(500)
  this.editXValue = new Animated.Value(0)
  this.listYValue = new Animated.Value(0)
  this.postXValue = new Animated.Value(1000)
}

searchForUser (searchQuery) {
  this.setState({resultsOpacity:1})
    actions.foundUsers = []
    this.searchUsers(searchQuery).then((result) => {
      if (result == false) {
        alert('Could not find any users with that name')
        this.setState({resultsOpacity:0})
        this.getResults()
      } else {
        this.getResults()
      }
    })
    dismissKeyboard()
}

searchUsers(searchQuery) {
  return new Promise(function(resolve, reject) {
    var found = false
    var query = firebaseApp.database().ref("UserID").orderByKey();
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          // key will be "ada" the first time and "alan" the second time
          var key = childSnapshot.key;
          // childData will be the actual contents of the child
          //alert(childSnapshot.key)
          var newRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/Name")
          //alert(newRef)
          newRef.once("value")
            .then(function(newSnapshot) {
              if (searchQuery == newSnapshot.val()) {
                found = true
                actions.searchFunction(childSnapshot.key, newSnapshot.val())
              }
            })
          })
        })
        setTimeout(function() {
          resolve(found)}, 2000)
      })
}

getResults() {
  this.setState({searchResults: this.state.searchResults.cloneWithRows(actions.foundUsers)})
  this.setState({resultsOpacity:0})
}

async prepAccountInfo(otherUserID) {
  this.setState({otherUserID: otherUserID})
  return new Promise(function(resolve, reject) {
  try {
    AsyncStorage.getItem('@userID:key').then((value) => {
     var UserID = value;
     actions.following = false
       var name, desc = ""
       var following = false
       var userRef = firebaseApp.database().ref("UserID/" + otherUserID + "/Name")
       userRef.once('value', (userSnapshot) => {
         name = userSnapshot.val()
         var userProfRef = firebaseApp.database().ref("UserID/" + otherUserID + "/ProfDesc")
         userProfRef.once('value', (descSnapshot) => {
           if (descSnapshot.val() == null) {
             desc = " "
           } else {
             desc = descSnapshot.val()
           }
           var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
           followRef.once("value")
             .then(function(snapshot) {
               if (snapshot.val() !== null) {
                 snapshot.forEach(function(childSnapshot) {
                   if (childSnapshot.key == UserID) {
                     resolve([name,desc,"Following"])
                   }
                 })
               } else {
                 resolve([name,desc,"Follow?"])
               }
           })
         })
       })
      })
     } catch (error) {
        // Error retrieving data
        resolve(["Loading","Loading","Follow"])
     }
  })
}

downloadImage(otherUserID) {
  return new Promise(function(resolve, reject) {
    var Realurl = ""
    var Realurl2 = ""
    firebaseApp.storage().ref('Users/' + otherUserID).child('Profile').getDownloadURL().then(function(url) {
      Realurl = url
    }).catch((error) => {
      firebaseApp.storage().ref('blackBackground.png').getDownloadURL().then(function(url) {
        Realurl = url
      })
    })
    firebaseApp.storage().ref('Users/' + otherUserID).child('Background').getDownloadURL().then(function(url2) {
      resolve([Realurl, url2])
    }).catch((error) =>  {
      firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
        resolve([Realurl, url2])
      })
    })
  })
}

showAccountInfo(otherUserID) {
  actions.otherUserPosts = []
  this.setState({following: "Loading"})
  this.setState({otherName: "Loading"})
  this.setState({otherProfDesc: "Loading"})
  this.showOtherAccount()
  this.downloadImage(otherUserID).then((urls) => {
    this.setState({avatarSource:urls[0]})
    this.setState({backgroundSource:urls[1]})
  })
  this.prepAccountInfo(otherUserID).then((result) => {
    this.setState({otherName: result[0]})
    this.setState({otherProfDesc: result[1]})
    this.setState({following: result[2]})
    this.getUserPosts(otherUserID).then(() => {
      actions.getOtherAccountPostList().then((list) => {
        this.updateListView(list)
    })
  })
})
}

updateListView(list) {
  this.setState({dataSource: this.state.dataSource.cloneWithRows(list)})
}

followUser(otherUserID) {
  return new Promise(function(resolve, reject) {
  try {
    AsyncStorage.getItem('@userID:key').then((value) => {
     var UserID = value;
      var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
      followRef.once("value")
        .then(function(snapshot) {
          if (snapshot.val() !== null) {
            var following = true
            snapshot.forEach(function(childSnapshot) {
              if (childSnapshot.key !== UserID) {
                following = false
                followRef.child(UserID).update( {
                  User: UserID
                });
                var userRef = firebaseApp.database().ref("UserID/"+ UserID + "/following")
                userRef.child(otherUserID).update( {
                  User: otherUserID
                });
                resolve()
              }
            })
            if (following == true) {
              var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
              followRef.child(UserID).remove()
              var userRef = firebaseApp.database().ref("UserID/"+ UserID + "/following")
              userRef.child(otherUserID).remove()
          }
        } else {
            var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
            followRef.child(UserID).update( {
              User: UserID
            });
            var userRef = firebaseApp.database().ref("UserID/"+ UserID + "/following")
            userRef.child(otherUserID).update( {
              User: otherUserID
            });
          }
      })
    })
  } catch (error) {
     // Error retrieving data
     resolve(alert("Failed to follow user"))
  }

    setTimeout(function() {
      resolve()}, 1000)
    })
}

async getUserPosts(otherUserID) {
  return new Promise(function(resolve, reject) {
     var query = firebaseApp.database().ref("UserID/" + otherUserID + "/posts").orderByKey();
     query.once("value")
       .then(function(snapshot) {
         snapshot.forEach(function(childSnapshot) {
           var title,desc,likes = ""
           var postTitleRef = firebaseApp.database().ref("UserID/" + otherUserID + "/posts/" + childSnapshot.key + "/title")
           postTitleRef.once('value', (titleSnapshot) => {
             title = titleSnapshot.val()
           })
           var postDescRef = firebaseApp.database().ref("UserID/" + otherUserID + "/posts/" + childSnapshot.key + "/desc")
           postDescRef.once('value', (descSnapshot) => {
             desc = descSnapshot.val()
           })
           var postLikesRef = firebaseApp.database().ref("UserID/" + otherUserID + "/posts/" + childSnapshot.key + "/likes")
           postLikesRef.once('value', (likesSnapshot) => {
             likes = likesSnapshot.val()
             actions.loadOtherAccountPosts(title, desc, childSnapshot.key,likes,otherUserID)
           })
         })
       })
    var timeOut = setTimeout(function() {
      resolve(false)}, 2000)
    })
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

  render() {
    if (this.state.loaded == true) {
      return (
      <View style={{backgroundColor:"white", opacity:1, height: actions.height, width:actions.width}}>
        <Text>Loading...</Text>
      </View>
    )
    } else {
      return(
        <View>
          <Text style={{position: 'absolute', top: 10, left: 150, fontSize: 25}}>Search</Text>
          <TextInput
          style={{position: 'absolute', top: 50, left: 40, height: 40, width: 225, borderColor: 'gray', borderWidth: 1}}
          placeholder={' Search for a name'}
          onChange={(event) => this.setState({searchQuery: event.nativeEvent.text})}
          ref={component => this._titleInput = component}
          />
        <TouchableHighlight onPress={() => this.searchForUser(this.state.searchQuery)} style={{position: 'absolute', top: 60, left: 275}} underlayColor="#f1f1f1">
            <Text style={{fontSize: 20}}>Search</Text>
        </TouchableHighlight>
        <Text style={{opacity: this.state.resultsOpacity, position: 'absolute', top: 100, left: 40, fontSize: 20}}>Searching...</Text>
          <ListView
            enableEmptySections={true}
            style={{position: 'absolute', top: 150, left: 25}}
            dataSource={this.state.searchResults}
            renderRow={(rowData) =>
            <TouchableHighlight style={{height:40, width:325, borderColor: "black", borderWidth:1, justifyContent: "center"}} onPress={() => this.showAccountInfo(rowData.USERID)}>
              <Text  style={{fontSize: 25}}> {rowData.NAME}</Text>
            </TouchableHighlight>}
          />

        <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: -2,  backgroundColor: "white", flex:1, backgroundColor: '#FFFFFF', transform: [{translateX: this.otherAccountValue}] }}>
            <TouchableHighlight
              onPress={this.closeOtherAccount.bind(this)}
              style={{position: 'absolute',top: -42, height: 50, width: 50, left: 325}}
              underlayColor="#f1f1f1">
            <Animated.Image
              style={{height: 25, width: 15, position: 'absolute', top: 0, left: 0}}  source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/BackIcon.png')}/>
          </TouchableHighlight>
          <Image
            style={{resizeMode: 'cover', width: window.width, height: (window.height / 3) }}  blurRadius={2} source={{uri:this.state.backgroundSource}}/>
          <View style={{position: 'absolute', width:window.width, height: (window.height / 3), flexDirection: "column", justifyContent:"center", alignItems: 'center'}}>
          <Image
          style={{paddingTop:76, resizeMode: 'cover', height: 76, width: 71}}
          source={{uri: this.state.avatarSource}}/>
          <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}} >{this.state.otherName}</Text>
          <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}} >{this.state.otherProfDesc !== null ? this.state.otherProfDesc : "" }</Text>
            <TouchableHighlight onPress={() => this.followUser(this.state.otherUserID).then(() => {this.showAccountInfo(this.state.otherUserID)})} underlayColor="#f1f1f1">
              <Text style={{fontSize: 20, color: "white"}}>Following: {this.state.following}</Text>
            </TouchableHighlight>
          </View>
          <TouchableOpacity
            style={{position: 'absolute', top:5, width: window.width, height:60}}
            onPress={() => {this.closeList()}}>
          </TouchableOpacity>
          <Animated.View style={{flex:1, transform: [{translateY: this.listYValue}]}}>
            <ListView
              onScroll={() => {this.showList()}}
              enableEmptySections={true}
              style={{backgroundColor:'white', paddingLeft: 10, paddingRight: 10,  width: window.width}}
              contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
              dataSource={this.state.dataSource}
              renderRow={(rowData, sec, i) =>
              <View style={{alignSelf: 'flex-start', width:(window.width / 2) - 20}}>
                <Text style={{fontSize: 25}}> {rowData.TITLE}</Text>
                <TouchableHighlight
                  onPress={() => {this.showPosts(), this.listView.scrollTo({ x:window.width * i, y:0, animated:false })}}>
                    <Image
                      style={{resizeMode: 'cover', width: window.width / 2, height: window.height / 6}} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/luggageCase.jpg')}/>
                </TouchableHighlight>
                <Text style={{fontSize: 15}}> {rowData.DESC !== null ? rowData.DESC.slice(0,45) : "Loading" }...</Text>
              </View>
              }
              renderFooter={() => <View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
                <Text style={{fontSize: 20}}>Nothing more to see here...</Text>
                <Text style={{height: 100}}>                           </Text>
              </View>}
            />
          </Animated.View>
          </Animated.View>

          <Animated.View style={{flexGrow:1, position:'absolute', backgroundColor:'white', transform: [{translateX: this.postXValue}]}}>
            <TouchableHighlight
            onPress={this.closePosts.bind(this)}
            style={{height: 50, width: 50, position: 'absolute',top: -42, left: 325}}
            underlayColor="#f1f1f1">
            <Animated.Image
              style={{resizeMode: 'cover', height: 25, width: 15, position: 'absolute', top: 0, left: 0}}  source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/BackIcon.png')}/>
          </TouchableHighlight>
            <ListView ref={component => this.listView = component}
              enableEmptySections={true}
              style={{position: 'absolute', top: 0, left: 0, height: window.height, width:window.width}}
              contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
              horizontal={true}
              dataSource={this.state.dataSource}
              renderRow={(rowData, s, i) =>
              <View style={{width:actions.width, backgroundColor:'white'}}>
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
                    <Text style={styles.dateStyle}>{moment(rowData.DATE, "MMDDYYYYhmmss").format('MMMM Do, h:mm')}</Text>
                    <Image
                      style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/LikeIcon.png')}/>
                    <LikeComponent USERID={rowData.USERID} DATE={rowData.DATE} />
                    <Text style={styles.likeNumber} ref={component => this._likeNum = component}>{rowData.LIKES}</Text>
                  <Text style={styles.postDesc}>{rowData.DESC}</Text>
                </View>
                <View style={styles.buttons}>
                  <TouchableHighlight onPress={() => this.likePost(rowData.USERID,rowData.DATE).then(() => {actions.getOtherAccountPostList().then((list) => {this.updateListView(list)})})} underlayColor="#f1f1f1">
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
          </Animated.View>

        </View>
      )}
    }
    componentWillMount() {

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
          toValue: -500,
          duration: 250,
          easing: Easing.linear
        }
      ),
    ]).start()
  }
  showList () {
    Animated.sequence([
      Animated.timing(
        this.listYValue,
        {
          toValue: -150,
          duration: 200,
          easing: Easing.linear
        }
      )
    ]).start()
  };
  closeList () {
    Animated.sequence([
      Animated.timing(
        this.listYValue,
        {
          toValue: 0,
          duration: 200,
          easing: Easing.linear
        }
      )
    ]).start()
  };
    showPosts () {
      Animated.parallel([
        Animated.timing(
          this.editXValue,
          {
            toValue: 100,
            duration: 250,
            easing: Easing.linear
          }
        ),
        Animated.timing(
          this.postXValue,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.linear
          }
        )
      ]).start()
    };
    closePosts () {
      Animated.parallel([
        Animated.timing(
          this.editXValue,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.linear
          }
        ),
        Animated.timing(
          this.postXValue,
          {
            toValue: 1000,
            duration: 250,
            easing: Easing.linear
          }
        )
      ]).start()
  };
  accountLeft () {
    dismissKeyboard()
    if (actions.pressed == false) {
      actions.alternateSpin(2)
      Animated.parallel([
        Animated.timing(
          this.profileValue,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.linear
          })
      ]).start()
    } else {
      actions.alternateSpin(2)
      Animated.parallel([
        Animated.timing(
          this.profileValue,
          {
            toValue: 500,
            duration: 250,
            easing: Easing.linear
          })
        ]).start()
    }
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
