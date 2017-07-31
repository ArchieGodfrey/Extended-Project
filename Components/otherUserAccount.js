import actions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Actions"
import firebase from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/firebaseConfig'
import PostComponent from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/postComponent"
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
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
    loaded: false,
    dataSource: ds.cloneWithRows([]),
  }
  this.otherAccountValue = new Animated.Value(-500)
  this.editXValue = new Animated.Value(0)
  this.listYValue = new Animated.Value(0)
  this.postXValue = new Animated.Value(-1000)
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
        firebaseApp.storage().ref('Users/' + otherUserID).child('Background').getDownloadURL().then(function(url2) {
          Realurl2 = url2
          resolve([Realurl, url2])
        }).catch((error) =>  {
          firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
            Realurl2 = url2
            resolve([Realurl, Realurl2])
          })
        })
      }).catch((error) => {
        firebaseApp.storage().ref('blackBackground.png').getDownloadURL().then(function(url) {
          Realurl = url
          firebaseApp.storage().ref('Users/' + otherUserID).child('Background').getDownloadURL().then(function(url2) {
            Realurl2 = url2
            resolve([Realurl, url2])
          }).catch((error) =>  {
            firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
              Realurl2 = url2
              resolve([Realurl, Realurl2])
            })
          })
        })
      })

    })
  }

  showAccountInfo(otherUserID) {
    this.setState({following: "Loading"})
    this.setState({otherName: "Loading"})
    this.setState({otherProfDesc: "Loading"})
    this.downloadImage(otherUserID).then((urls) => {
      this.setState({avatarSource:urls[0]})
      this.setState({backgroundSource:urls[1]})
    })
    this.accountReady(otherUserID)
  }

  accountReady(otherUserID) {
    this.prepAccountInfo(otherUserID).then((result) => {
      this.setState({otherName: result[0]})
      this.setState({otherProfDesc: result[1]})
      this.setState({following: result[2]})
      this.setState({loaded: true})
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


  async followUser(otherUserID) {
    this.setState({following: "-----"})
    this.followController(otherUserID).then((result) => {
      if (result[0] == false) {
        var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
        followRef.child(result[1]).update( {
          User: result[1]
        });
        var userRef = firebaseApp.database().ref("UserID/"+ result[1] + "/following")
        userRef.child(otherUserID).update( {
          User: otherUserID
        }).then(() => {this.accountReady(otherUserID)})
      } else {
        var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
        followRef.child(result[1]).remove()
        var userRef = firebaseApp.database().ref("UserID/"+ result[1] + "/following")
        userRef.child(otherUserID).remove().then(() => {this.accountReady(otherUserID)})
      }
    })
  }


  async followController(otherUserID) {
    return new Promise(function(resolve, reject) {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var UserID = value;
        var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
        followRef.once("value")
          .then(function(snapshot) {
            if (snapshot.val() !== null) {
              snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.key == UserID) {
                  resolve([true,UserID])
                }
              })
              resolve([false,UserID])
            } else {
              resolve([false,UserID])
            }
          })
        })
      } catch (error) {
         // Error retrieving data
         alert("Failed to follow user")
      }
  })
}

  async getUserPosts(otherUserID) {
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
       var query = firebaseApp.database().ref("UserID/" + otherUserID + "/posts").orderByKey();
       query.once("value")
         .then(function(snapshot) {
           snapshot.forEach(function(childSnapshot) {
             var postTitle,postDesc,postLikes = ""
             var postTitleRef = firebaseApp.database().ref("UserID/" + otherUserID + "/posts/" + childSnapshot.key + "/title")
             postTitleRef.once('value', (titleSnapshot) => {
               postTitle = titleSnapshot.val()
             })
             var postDescRef = firebaseApp.database().ref("UserID/" + otherUserID + "/posts/" + childSnapshot.key + "/desc")
             postDescRef.once('value', (descSnapshot) => {
               postDesc = descSnapshot.val()
             })
             var postLikesRef = firebaseApp.database().ref("UserID/" + otherUserID + "/posts/" + childSnapshot.key + "/likes")
             postLikesRef.once('value', (likesSnapshot) => {
               postLikes = likesSnapshot.val()
             })
             downloadImage(otherUserID, childSnapshot.key).then((url) => {
               actions.loadOtherAccountPosts(postTitle,postDesc,childSnapshot.key,postLikes,otherUserID,url)
               clearTimeout(timeOut)
               resolve(true)
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
    if (this.state.loaded == false) {
      return (
      <View style={{backgroundColor:"white", opacity:1, height: window.height, width:window.width}}>
        <Text>Loading...</Text>
      </View>
    )
    } else {
      const {navigate} = this.props.navigation;
      return(
        <View style={{flex:1, position:'absolute'}}>
        <Image
          style={{resizeMode: 'cover', width: window.width, height: (window.height / 3) }}  blurRadius={2} source={{uri:this.state.backgroundSource}}/>
        <View style={{position: 'absolute', width:window.width, height: (window.height / 3), flexDirection: "column", justifyContent:"center", alignItems: 'center'}}>
        <Image
        style={{paddingTop:76, resizeMode: 'cover', height: 76, width: 71}}
        source={{uri: this.state.avatarSource}}/>
        <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}} >{this.state.otherName}</Text>
        <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}} >{this.state.otherProfDesc !== null ? this.state.otherProfDesc : "" }</Text>
          <TouchableHighlight onPress={() => this.followUser(this.state.otherUserID)} underlayColor="#f1f1f1">
            <Text style={{fontSize: 20, color: "white"}}>{this.state.following}</Text>
          </TouchableHighlight>
        </View>
        <View style={{flex:1}}>
          <ListView
            enableEmptySections={true}
            onScroll={() => {this.showList()}}
            style={{backgroundColor:'white', paddingLeft: 10, paddingRight: 10,  width: window.width}}
            contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
            dataSource={this.state.dataSource}
            renderRow={(rowData, sec, i) =>
            <View style={{alignSelf: 'flex-start', width:(window.width / 2) - 20}}
              snapPoints={[{x: (i % 2) === 0 ? 0 : window.width / 2 }, {x: (i % 2) === 0 ?  window.width / 2 : window.width }]}>
              <Text style={{fontSize: 25}}> {rowData.TITLE}</Text>
              <TouchableHighlight
                onPress={() => {this.showPosts(), this.listView.scrollTo({ x:window.width * i, y:0, animated:false })}}>
                  <Image
                    style={{resizeMode: 'cover', width: window.width / 2, height: window.height / 6}} source={{uri: rowData.URI}}/>
              </TouchableHighlight>
              <Text style={{fontSize: 15}}> {rowData.DESC !== null ? rowData.DESC.slice(0,45) : "Loading" }...</Text>
            </View>
            }
            renderFooter={() => <View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
            <Text style={{height: window.height}}>                           </Text>
            <Text style={{fontSize: 20}}>Nothing more to see here...</Text>
            </View>}
          />
      </View>

        <Animated.View style={{flexGrow:1, position:'absolute', backgroundColor:'white', transform: [{translateX: this.postXValue}]}}>
          <TouchableHighlight
          onPress={this.closePosts.bind(this)}
          style={{height: 40, width: 50, position: 'absolute',top: -42, left: 325, backgroundColor:"white"}}
          underlayColor="#f1f1f1">
          <Animated.Image
            style={{resizeMode: 'cover', height: 25, width: 15, position: 'absolute', top: 0, left: 0}}  source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/BackIcon.png')}/>
        </TouchableHighlight>
          <ListView ref={component => this.listView = component}
            enableEmptySections={true}
            style={{position: 'absolute', top: 0, left: 0, height: window.height, width:window.width}}
            contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
            horizontal={true}
            dataSource={this.state.dataSource}
            renderRow={(rowData, s, i) =>
            <View style={{width:window.width, backgroundColor:'white'}}>
              <PostComponent USERID={rowData.USERID} TITLE={rowData.TITLE} LIKES={rowData.LIKES} DESC={rowData.DESC} DATE={rowData.DATE} URI={rowData.URI} navigate={navigate}/>
            </View>}
          />
        </Animated.View>
        <View style={{width:40,height:40,backgroundColor:'#21c064',justifyContent:'center'}} initialPosition={{x: window.width - (window.width / 5), y: window.height - (window.height / 3)}} boundaries={{top:0, bottom:window.height - 50,left: 0, right: window.width - 80}} frictionAreas={[{damping: 0.4}]}>
          <TouchableHighlight style={{justifyContent:'center'}} onPress={() => this.followUser(this.state.otherUserID)} underlayColor="#f1f1f1">
                <Image style={{height: 40, width: 40}}source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/EditIcon.png')}/>
            </TouchableHighlight>
          </View>
      </View>
    )
  }
}
  componentWillMount() {
    const { USERID } = this.props.navigation.state.params;
    this.showAccountInfo(USERID)
  }

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
          toValue: -1000,
          duration: 250,
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
showList () {
  this.getUserPosts(this.props.navigation.state.params.USERID).then(() => {
    actions.getOtherAccountPostList().then((list) => {
      this.updateListView(list)
  })
})
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
