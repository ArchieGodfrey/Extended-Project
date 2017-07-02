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

const UserPosts = [];

class ImageContainer extends Component {
    constructor (props) {
        super(props);
        this.state = {
           backgroundSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/greyBackground.png",
           avatarSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/blackBackground.png", 
        }
    }

    componentDidMount() {
        getFromAsyncStorage("@profileCache:key").then((value) => {
            if (value === null) {
                downloadProfileImages().then((urls) => {
                this.setState({avatarSource:urls[0]})
                this.setState({backgroundSource:urls[1]})
            })
            } else {
               this.setState({avatarSource:value}) 
            }
        })
        getFromAsyncStorage("@backgroundCache:key").then((value) => {
            this.setState({backgroundSource:value})
        })
    }

    render() {
        return(
            <View style={{flex:1,alignItems:'center'}}>
                <Image
                style={{resizeMode: 'cover', width: frame.width, height: (frame.height / 3) }}  
                blurRadius={2} 
                source={{uri: this.state.backgroundSource}}/>
            <Image
                style={{position:'absolute', left: (frame.width / 2.5), top: (frame.height / 8.5), resizeMode: 'cover', height: (frame.width / 5), width: (frame.width / 5)}}
                source={{uri: this.state.avatarSource}}/>
            </View>
        )
    }
}

class AccountPosts extends Component {
    constructor (props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
        }
    }

    componentWillMount() {
        getUserPosts().then(() => {
            alert(UserPosts)
            this.setState({dataSource: this.state.dataSource.cloneWithRows(UserPosts)})
        })
    } 

    render() {
        return(
            <ListView
                enableEmptySections={true}
                style={{flex:1,backgroundColor:'white',width: frame.width}}
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
        )
    }
}

export default class AccountContents extends Component {
 render() {
     return(
         <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
             <ImageContainer />
             <AccountPosts />
         </View>
     )
 }
}

async function sortAccountPosts(title,desc,date,likes,userID,uri) {
    var copy = false;
    UserPosts.map(function(item, i) {
      if (item.DATE === date) {
        copy = true;
      }
    })
    if (copy == false) {
      UserPosts.push({TITLE: title, DESC: desc, DATE: date, LIKES: likes, USERID: userID,URI: uri})
    }
  }

function getUserPosts() {
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
                    query.once("value").then(function(snapshot) {
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
                                resolve(sortAccountPosts(postTitle,postDesc,childSnapshot.key,postLikes,UserID,url))
                                clearTimeout(timeOut)
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
        resolve(null)}, 10000)
    })
}

function getFromAsyncStorage(key) {
    return new Promise(function(resolve, reject) {
        try {
            AsyncStorage.getItem(key.toString()).then((value) => {
                clearTimeout(timeOut)
                resolve(value) 
            })
        } catch (error) {
            // Error getting data
            alert('No data')
            clearTimeout(timeOut)
            resolve(null)
        }
    let timeOut = setTimeout(function() {
        resolve(null)}
        , 10000)
    })
}

function downloadProfileImages() {
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