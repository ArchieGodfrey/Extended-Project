import actions from "EP/Actions"
import firebase from 'EP/firebaseConfig'
import LikeComponent from "EP/likeComponent"
import dismissKeyboard from 'dismissKeyboard'
import OtherAccountComponent from "EP/otherUserAccount"
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
    key:0,
    showAccount:0,
  }
  this.otherAccountValue = new Animated.Value(-500)
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
  this.setState({otherUser: otherUserID})
  this.setState({showAccount:1})
  this.showOtherAccount()
  this.setState({ key: Math.random() })
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

        <Animated.View key={this.state.key} style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: -2,  backgroundColor: "white", flex:1, backgroundColor: '#FFFFFF', transform: [{translateX: this.otherAccountValue}] }}>
          <TouchableHighlight
            onPress={this.closeOtherAccount.bind(this)}
            style={{position: 'absolute',top: -42, height: 50, width: 50, left: 325}}
            underlayColor="#f1f1f1">
          <Animated.Image
            style={{height: 25, width: 15, position: 'absolute', top: 0, left: 0}}  source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/BackIcon.png')}/>
        </TouchableHighlight>
            <OtherAccountComponent value={this.state.otherUser} visibility={this.state.showAccount}/>
          </Animated.View>

        </View>
      )}
    }
    componentWillMount() {
      this.setState({loaded:false})
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
