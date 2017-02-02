import actions from "EP/Actions"
import firebase from 'EP/firebaseConfig'
import dismissKeyboard from 'dismissKeyboard'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions
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
    otherUserID: "",
    otherName: "",
    otherProfDesc: "",
    following: "Follow",
  }
  this.otherAccountValue = new Animated.Value(500)
  this.otherAccountXValue = new Animated.Value(100)
}

searchForUser (searchQuery) {
  actions.foundUsers = []
  this.setState({resultsOpacity:1})
  this.searchUsers(searchQuery).then(() => {
    this.getResults()
  })
  dismissKeyboard()
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()}, 1000)
    })
}

searchUsers(searchQuery) {
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
              actions.searchFunction(childSnapshot.key, newSnapshot.val())
            }
          })
      })
    })
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve()}, 1000)
      })
}

getResults() {
  this.setState({dataSource: this.state.dataSource.cloneWithRows(actions.foundUsers)})
  this.setState({resultsOpacity:0})
}

prepAccountInfo(otherUserID) {
  try {
    AsyncStorage.getItem('@userID:key').then((value) => {
     var UserID = value;
     actions.following = false
       return new Promise(function(resolve, reject) {
         var userRef = firebaseApp.database().ref("UserID/" + otherUserID + "/Name")
         userRef.once('value', (Snapshot) => {
           actions.otherName = Snapshot.val()
         })
         var userProfRef = firebaseApp.database().ref("UserID/" + otherUserID + "/ProfDesc")
         userProfRef.once('value', (Snapshot) => {
           actions.otherProfDesc = Snapshot.val()
         })
         var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
         followRef.once("value")
           .then(function(snapshot) {
             if (snapshot.val() !== null) {
               snapshot.forEach(function(childSnapshot) {
                 if (childSnapshot.key !== UserID) {
                   actions.following = true
                 } else {
                   actions.following = false
                 }
               })
             } else {
               actions.following = false
             }
         })
         setTimeout(function() {
           resolve()}, 1000)
         }).then(() => {
           this.setState({otherName: actions.otherName})
           this.setState({otherProfDesc: actions.otherProfDesc})
           if (actions.following == true) {
             this.setState({following: "Following"})
           } else {
             this.setState({following: "Follow?"})
           }
         })
       })
     } catch (error) {
        // Error retrieving data
        actions.badLogin()
     }

}

showAccountInfo(otherUserID) {
  this.setState({following: "Loading"})
  this.setState({otherName: actions.otherName})
  this.setState({otherProfDesc: actions.otherProfDesc})
  this.showOtherAccount()
  this.prepAccountInfo(otherUserID)
}

followUser(otherUserID) {
  try {
    AsyncStorage.getItem('@userID:key').then((value) => {
     var UserID = value;
      var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
      followRef.once("value")
        .then(function(snapshot) {
          if (snapshot.val() !== null) {
            snapshot.forEach(function(childSnapshot) {
              if (childSnapshot.key !== UserID) {
                followRef.child(UserID).update( {
                  User: UserID
                });
                var userRef = firebaseApp.database().ref("UserID/"+ UserID + "/following")
                userRef.child(otherUserID).update( {
                  User: otherUserID
                });
              }
            })
          } else {
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
     actions.badLogin()
  }
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()}, 1000)
    })
  this.setState({following: "Following"})
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
            dataSource={this.state.dataSource}
            renderRow={(rowData) =>
            <TouchableHighlight style={{height:40, width:325, borderColor: "black", borderWidth:1, justifyContent: "center"}} onPress={() => this.showAccountInfo(rowData.USERID)}>
              <Text  style={{fontSize: 25}}> {rowData.NAME}</Text>
            </TouchableHighlight>}
          />

        <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: -2,  backgroundColor: "white", flex:1, backgroundColor: '#FFFFFF', transform: [{translateX: this.otherAccountValue}] }}>
              <Image
                style={{position: 'absolute', top: 25, left: 25, height: 50, width: 50}} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/Avatar.png')}/>
              <Text style={{position: 'absolute', top: 25, left: 100, fontSize: 20}}>NAME: {this.state.otherName}</Text>
              <Text style={{position: 'absolute', top: 80, left: 30, fontSize: 20}}>{this.state.otherProfDesc}</Text>
              <TouchableHighlight onPress={() => this.followUser(actions.otherUserID)} style={{position: 'absolute', top: 200, left: 130}} underlayColor="#f1f1f1">
                <Text style={{fontSize: 20}}>Following: {this.state.following}</Text>
              </TouchableHighlight>
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
          duration: 550,
          easing: Easing.linear
        }
      ),
      Animated.timing(
        this.otherAccountXValue,
        {
          toValue: 0,
          duration: 550,
          easing: Easing.linear
        }
      )
    ]).start()
  }

  closeOtherAccount() {
    Animated.parallel([
      Animated.timing(
        this.editXValue,
        {
          toValue: 100,
          duration: 400,
          easing: Easing.linear
        }
      ),
      Animated.timing(
        this.crossXValue,
        {
          toValue: 100,
          duration: 550,
          easing: Easing.linear
        }
      ),
      Animated.timing(
        this.otherAccountXValue,
        {
          toValue: 100,
          duration: 550,
          easing: Easing.linear
        }
      ),
      Animated.timing(
        this.otherAccountValue,
        {
          toValue: -500,
          duration: 400,
          easing: Easing.linear
        }
      ),
    ]).start()
  }


}
