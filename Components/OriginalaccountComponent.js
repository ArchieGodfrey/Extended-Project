import actions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Actions"
import firebase from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/firebaseConfig'
import PostComponent from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/postComponent"
import dismissKeyboard from 'dismissKeyboard'
import RNFetchBlob from 'react-native-fetch-blob'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');
var ImagePicker = require('react-native-image-picker');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const frame = Dimensions.get('window');

export default class AccountContents extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
    Username: "Loading",
    name: "Loading",
    profDesc: "Loading",
    loaded:true,
    dataSource: ds.cloneWithRows([]),
  }
  this.clearText = this.clearText.bind(this);
  this.profileValue = new Animated.Value(500)
  this.editXValue = new Animated.Value(0)
  this.listYValue = new Animated.Value(0)
  this.postXValue = new Animated.Value(-1000)
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

clearText() {
 this._titleInput.setNativeProps({text: ''});
 this._descInput.setNativeProps({text: ''});
 dismissKeyboard();
 }

getAccountInfo() {
  return new Promise(function(resolve, reject) {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var nameRef = firebaseApp.database().ref("UserID/"+ value + "/Name")
       nameRef.once('value', (nameSnapshot) => {
         actions.name = nameSnapshot.val();
       });
       var descRef = firebaseApp.database().ref("UserID/"+ value + "/ProfDesc")
       descRef.once('value', (descSnapshot) => {
         actions.profDesc =  descSnapshot.val();
        });
        var emailRef = firebaseApp.database().ref("UserID/"+ value + "/Email")
        emailRef.once('value', (emailSnapshot) => {
          actions.Username =  emailSnapshot.val();
          clearTimeout(timeOut)
          resolve(true)
         });
      });
    } catch(error) {
      alert(error)
      resolve(false)
    }

    var timeOut = setTimeout(function() {
      resolve(false)}, 10000)
    })
  }

async getUserPosts() {
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
         var query = firebaseApp.database().ref("UserID/" + UserID + "/posts").orderByKey();
         query.once("value")
           .then(function(snapshot) {
             snapshot.forEach(function(childSnapshot) {
               var postTitle,postDesc,postLikes = ""
               var postTitleRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + childSnapshot.key + "/title")
               postTitleRef.once('value', (titleSnapshot) => {
                 postTitle = titleSnapshot.val()
               })
               var postDescRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + childSnapshot.key + "/desc")
               postDescRef.once('value', (descSnapshot) => {
                 postDesc = descSnapshot.val()
               })
               var postLikesRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + childSnapshot.key + "/likes")
               postLikesRef.once('value', (likesSnapshot) => {
                 postLikes = likesSnapshot.val()
               })
               downloadImage(UserID, childSnapshot.key).then((url) => {
                 actions.loadAccountPosts(postTitle,postDesc,childSnapshot.key,postLikes,UserID,url)
                 clearTimeout(timeOut)
                 resolve(true)
               })
             })
           })
         }
       })
    } catch (error) {
      // Error retrieving data
      alert("There was a problem getting posts")
      resolve(false)
    }
    var timeOut = setTimeout(function() {
      resolve(false)}, 2000)
    })
  }

updateListView(list) {
  this.setState({dataSource: this.state.dataSource.cloneWithRows(list)})
}

likePost(otherUserID, postDate) {
  return new Promise(function(resolve, reject) {
    var likes = 0
    var liked = false
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var UserID = value
       if (UserID !== null) {
         var likesRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts/" + postDate + "/likedBy/")
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
               var postsRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts/" + postDate)
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
               var postsRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts/" + postDate)
               postsRef.child("likes").once('value', (likesSnapshot) => {
                 likes = likesSnapshot.val() - 1
                 postsRef.update( {
                   likes: likes
                 });
                 postsRef.child('likedBy/' + UserID).remove()
               })
               resolve(likes)
             } else {
               var postsRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts/" + postDate)
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

saveProfile() {
  var name = this.state.name;
  var profDesc = this.state.profDesc;
  try {
    AsyncStorage.getItem('@userID:key').then((value) => {
     var userID = value;
     if (userID !== null){
       var postsRef = firebaseApp.database().ref("UserID/"+ userID)
       postsRef.update( {
         Name: name,
         ProfDesc: profDesc
       });
     }
   })
 } catch (error) {
    // Error retrieving data
 }
  AsyncStorage.setItem('@name:key', name);
  AsyncStorage.setItem('@profDesc:key', profDesc);
  this.accountLeft()
}

choosePicture(loc) {
  var options = {
  title: 'Select ' + loc + ' Picture',
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
    let source = { uri: 'data:image/jpeg;base64,' + response.data };
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var userID = value;
       this.uploadImage(userID, loc, response.uri).then(() => {
         this.tryLoadFeed()
       })
     })
    } catch (error) {
       // Error retrieving data
    }
    }
  })
}

downloadProfileImage() {
  return new Promise(function(resolve, reject) {
    var Realurl = ""
    var Realurl2 = ""
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var userID = value;
       var Realurl = ""
       var Realurl2 = ""
       firebaseApp.storage().ref('Users/' + userID).child('Profile').getDownloadURL().then(function(url) {
         Realurl = url
         firebaseApp.storage().ref('Users/' + userID).child('Background').getDownloadURL().then(function(url2) {
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
           firebaseApp.storage().ref('Users/' + userID).child('Background').getDownloadURL().then(function(url2) {
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
    } catch (error) {
       // Error retrieving data
    }
  })
}

deletePost(otherUserID, postDate) {
  return new Promise(function(resolve, reject) {
    Alert.alert(
      'Post Options',
      "Are you sure you would like to delete this post?",
      [
        {text: 'Delete', onPress: () => {
          var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts")
          postsRef.child(postDate).remove()
          resolve()
        }},
        {text: 'Cancel', onPress: () => resolve(), style: 'cancel'},
      ],
      { cancelable: true }
    )
  })
}

showOptionsAlert() {
  return new Promise(function(resolve, reject) {
    Alert.alert(
      'Post Options',
      "What would you like to do with this post?",
      [
        {text: 'Delete', onPress: () => resolve('delete')},
        {text: 'Cancel', onPress: () => resolve('cancel'), style: 'cancel'},
      ],
      { cancelable: true }
    )
  })
}

optionsPressed(UserID, date) {
  this.showOptionsAlert().then((result) => {
    if (result == "delete") {
      this.deletePost(UserID, date).then(()=> {
        this.tryLoadFeed()
      })
    }
  })
}

showOpacity(num) {
  //this._opacity.setOpacityTo(num,10)
}

  render() {
    if (this.state.loaded == true) {
      return (
      <View style={{backgroundColor:"white", opacity:1, height: actions.height, width:actions.width}}>
        <Text>Loading...</Text>
      </View>
    )
    } else {
      const {navigate} = this.props.navigation;
      return(
        <View style={{flex:1, position:'absolute'}}>
          <Animated.View style={{position: 'absolute',top: -44, height:25, width:25, left: 325, transform: [{translateX: this.editXValue}]}}>
            <TouchableHighlight
            onPress={this.accountLeft.bind(this)}
            style={{height: 50, width: 50,}}
            underlayColor="#f1f1f1">
            <Animated.Image
              style={{height: 25, width: 25 ,position: 'absolute', top: 0, left: 0}}  source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/EditIcon.png')}/>
          </TouchableHighlight>
        </Animated.View>
            <Image
              style={{resizeMode: 'cover', width: frame.width, height: (frame.height / 3) }}  blurRadius={2} source={{uri: this.state.backgroundSource}}/>
            <View style={{position: 'absolute', width:frame.width, height: (frame.height / 3), flexDirection: "column", justifyContent:"center", alignItems: 'center'}}>
            <Image
            style={{paddingTop:76, resizeMode: 'cover', height: 76, width: 71}}
            source={{uri: this.state.avatarSource}}/>
            <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}}>{this.state.name}</Text>
            <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}}>{this.state.profDesc}</Text>
            </View>
            <TouchableOpacity ref={component => this._opacity = component}
              style={{position: 'absolute', top:5, width: frame.width, height:60, justifyContent:"center", alignItems: 'center', backgroundColor:"grey", opacity:0}}
              onPress={() => {this.closeList()}}>
              <Text style={{fontSize: 20, color:"white"}}>Close</Text>
            </TouchableOpacity>
            <Animated.View style={{flex:1, transform: [{translateY: this.listYValue}]}}>
              <ListView
                onScroll={() => {this.showList()}}
                enableEmptySections={true}
                style={{backgroundColor:'white', paddingLeft: 10, paddingRight: 10,  width: frame.width}}
                contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
                dataSource={this.state.dataSource}
                renderRow={(rowData, sec, i) =>
                <View style={{alignSelf: 'flex-start', width:(frame.width / 2) - 20}}>
                  <Text style={{fontSize: 25}}> {rowData.TITLE}</Text>
                  <TouchableHighlight
                    onPress={() => {this.showPosts(), this.listView.scrollTo({ x:frame.width * i, y:0, animated:false })}}>
                      <Image
                        style={{resizeMode: 'cover', width: frame.width / 2, height: frame.height / 6}} source={{uri: rowData.URI}}/>
                  </TouchableHighlight>
                  <Text style={{fontSize: 15}}> {rowData.DESC !== null ? rowData.DESC.slice(0,45) : "Loading" }...</Text>
                </View>
                }
                renderFooter={() => <View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
                  <Text style={{height: frame.height}}>                           </Text>
                  <Text style={{fontSize: 20}}>Nothing more to see here...</Text>
                </View>}
              />
            </Animated.View>

            <Animated.View style={{flexGrow:1, position:'absolute', backgroundColor:'white', transform: [{translateX: this.postXValue}]}}>
              <TouchableHighlight
              onPress={this.closePosts.bind(this)}
              style={{height: 50, width: 50, position: 'absolute',top: -42, left: 325}}
              underlayColor="#f1f1f1">
              <Animated.Image
                style={{resizeMode: 'cover', height: 25, width: 15, position: 'absolute', top: 0, left: 0}}  source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/BackIcon.png')}/>
            </TouchableHighlight>
              <ListView ref={component => this.listView = component}
                enableEmptySections={true}
                style={{position: 'absolute', top: 0, left: 0, height: frame.height, width:frame.width}}
                contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
                horizontal={true}
                dataSource={this.state.dataSource}
                renderRow={(rowData, s, i) =>
                <View style={{width:actions.width, backgroundColor:'white'}}>
                  <PostComponent USERID={rowData.USERID} TITLE={rowData.TITLE} LIKES={rowData.LIKES} DESC={rowData.DESC} DATE={rowData.DATE} URI={rowData.URI} navigate={navigate}/>
                </View>}
              />
            </Animated.View>

            <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, width: frame.width, height: frame.height, flex:1, position: 'absolute', top: -2,  backgroundColor: "white", transform: [{translateX: this.profileValue}]}}>
              <Text style={{position: 'absolute', top: 10, left: 100, fontSize: 25}}>Edit your profile</Text>
                <Image
                  style={{resizeMode: 'cover', width: frame.width, height: (frame.height / 3) }} blurRadius={2} source={{uri: this.state.backgroundSource}}/>
                <View style={{position: 'absolute', width:frame.width, height: (frame.height / 3), flexDirection: "column", justifyContent:"center", alignItems: 'center'}}>
                <Image
                style={{paddingTop:76, resizeMode: 'cover', height: 76, width: 71}}
                source={{uri: this.state.avatarSource}}/>
                  <TextInput
                  style={{justifyContent:"center", alignItems: 'center', paddingTop: 25, paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)', height:50, width: frame.width}}
                  placeholder={' Enter your name'}
                  value={this.state.name}
                  onChange={(event) => this.setState({name: event.nativeEvent.text})}
                  ref={component => this._titleInput = component}
                  />
                  <TextInput
                  style={{justifyContent:"center", alignItems: 'center', paddingTop: 5, paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)', height:50, width: frame.width}}
                  placeholder={' Enter a profile description'}
                  value={this.state.profDesc}
                  onChange={(event) => this.setState({profDesc: event.nativeEvent.text})}
                  ref={component => this._descInput = component}
                  />
                </View>
                <TouchableHighlight onPress={() => this.choosePicture("Profile")} style={{justifyContent:"center", alignItems: 'center', paddingTop:10}} underlayColor="#f1f1f1">
                      <Text style={{fontSize: 20}}>Change Profile Picture</Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => this.choosePicture("Background")} style={{justifyContent:"center", alignItems: 'center', paddingTop:15}} underlayColor="#f1f1f1">
                      <Text style={{fontSize: 20}}>Change Background Picture</Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => {this.saveProfile()}} style={{justifyContent:"center", alignItems: 'center',paddingTop:15}} underlayColor="#f1f1f1">
                  <Text style={{fontSize: 20}}>Save</Text>
                </TouchableHighlight>
            </Animated.View>

          </View>
      )
    }
  }

  tryLoadFeed() {
    this.getAccountInfo().then((result) => {
      if (result == true) {
        this.downloadProfileImage().then((urls) => {
          this.setState({avatarSource:urls[0]})
          this.setState({backgroundSource:urls[1]})
          this.getUserPosts().then(() => {
            actions.getAccountPostList().then((list) => {
              this.updateListView(list)
              this.setState({name: actions.name})
              this.setState({profDesc: actions.profDesc})
              this.setState({loaded: false})
              this.showOpacity(0)
              try {
               AsyncStorage.setItem('@profileCache:key', urls[0]);
              } catch (error) {
                // Error saving data
              }
              try {
               AsyncStorage.setItem('@backgroundCache:key', urls[1]);
              } catch (error) {
                // Error saving data
              }
              try {
               AsyncStorage.setItem('@postsCache:key', JSON.stringify(list));
              } catch (error) {
                // Error saving data
              }
              try {
               AsyncStorage.setItem('@nameCache:key', actions.name);
              } catch (error) {
                // Error saving data
              }
              try {
               AsyncStorage.setItem('@descCache:key', actions.profDesc);
              } catch (error) {
                // Error saving data
              }
              //this.tryLoadFeed()
            })
          })
        })
      } else {
        alert('Failed to load account')
      }
    })
  }

loadCachedData() {
  this.setState({loaded: false})
  try {
    AsyncStorage.getItem('@profileCache:key').then((url) => {
      if (url !== null) {
        this.setState({avatarSource:url})
      }
    })
  } catch (error) {
    // Error saving data
  }
  try {
    AsyncStorage.getItem('@backgroundCache:key').then((url) => {
      if (url !== null) {
        this.setState({backgroundSource:url})
      }
    })
  } catch (error) {
    // Error saving data
  }
  try {
    AsyncStorage.getItem('@postsCache:key').then((list) => {
      if (list !== null) {
        this.updateListView(JSON.parse(list))
        actions.userPosts = JSON.parse(list)
      }
    })
  } catch (error) {
    // Error saving data
  }
  try {
    AsyncStorage.getItem('@nameCache:key').then((name) => {
      if (name !== null) {
        this.setState({name: name})
      }
    })
  } catch (error) {
    // Error saving data
  }
  try {
    AsyncStorage.getItem('@descCache:key').then((profDesc) => {
      if (profDesc !== null) {
        this.setState({profDesc: profDesc})
      }
    })
  } catch (error) {
    // Error saving data
  }
  this.showOpacity(0)
}

    componentWillMount() {
      alert("mounted")
      this.loadCachedData()
      this.tryLoadFeed()
      try {
        AsyncStorage.getItem('@userID:key').then((UserID) => {
          var postTitleRef = firebaseApp.database().ref("UserID/" + UserID)
          postTitleRef.on('child_changed', (titleSnapshot) => {
            //this.tryLoadFeed()
          })
        })

      } catch (error) {

      }
    };

  showList () {
    this.showOpacity(0.5)
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
    this.showOpacity(0)
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
            toValue: -1000,
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
