import actions from "EP/Actions"
import firebase from 'EP/firebaseConfig'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const window = Dimensions.get('window');

export default class AccountContents extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
    Username: "Loading",
    name: "Loading",
    profDesc: "Loading",
    dataSource: ds.cloneWithRows([]),
  }
  this.listYValue = new Animated.Value(200)
}

getAccountInfo() {
  function getAccount() {
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
         });
      });
    } catch(error) {
      alert(error)
    }
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve()}, 1000)
      })
  }

  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(getAccount())}, 1000)
    })
}

getUserPosts() {
  return new Promise(function(resolve, reject) {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var UserID = value
       if (UserID !== null) {
         var query = firebaseApp.database().ref("UserID/" + UserID + "/posts").orderByKey();
         query.once("value")
           .then(function(snapshot) {
             snapshot.forEach(function(childSnapshot) {
               var postTitleRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + childSnapshot.key + "/title")
               postTitleRef.once('value', (titleSnapshot) => {
                 var postDescRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + childSnapshot.key + "/desc")
                 postDescRef.once('value', (descSnapshot) => {
                   var postDateRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + childSnapshot.key + "/date")
                   postDateRef.once('value', (dateSnapshot) => {
                    actions.loadAccountPosts(titleSnapshot.val(), descSnapshot.val(), dateSnapshot.val())
                   })
                 })
               })

           })
         })
       }
     })
    } catch (error) {
      // Error retrieving data
      alert("There was a problem getting posts")
    }
    setTimeout(function() {
      resolve()}, 1000)
    })
}

updateListView() {
  this.setState({dataSource: this.state.dataSource.cloneWithRows(actions.userPosts)})
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
        <View style={{flex:1}}>
            <Image
              style={{resizeMode: 'cover', width: window.width, height: (window.height / 3) }} blurRadius={2} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/Bitmap.png')}/>
            <View style={{position: 'absolute', width:window.width, height: (window.height / 3), flexDirection: "column", justifyContent:"center", alignItems: 'center'}}>
            <Image
            style={{resizeMode: 'cover', height: 76, width: 71}}
            source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/Avatar.png')}/>
            <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}}>{this.state.name}</Text>
            <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}}>{this.state.profDesc}</Text>
            </View>
            <Animated.View style={{flexGrow:1, transform: [{translateY: this.listYValue}]}}>
              <ListView
                onScroll={() => {this.showList()}}
                enableEmptySections={true}
                style={{backgroundColor:'white', paddingLeft: 10, paddingRight: 10,  width: window.width}}
                contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
                dataSource={this.state.dataSource}
                renderRow={(rowData) =>
                <View style={{alignSelf: 'flex-start', width:(window.width / 2) - 20}}>
                  <Text style={{fontSize: 25}}> {rowData.TITLE}</Text>
                    <Image
                      style={{resizeMode: 'cover', width: window.width / 2, height: window.height / 6}} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/luggageCase.jpg')}/>
                    <Text style={{fontSize: 15}}> {rowData.DESC.slice(0,45)}...</Text>
                </View>}
                renderFooter={() => <View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
                  <Text style={{fontSize: 20}}>Nothing more to see here...</Text>
                  <Text style={{height: 100}}>                           </Text>
                </View>}
              />
              <TouchableOpacity
                style={{position: 'relative', top:-(window.height), width: window.width, height:70}}
                onPress={() => {this.closeList()}}>
              </TouchableOpacity>
            </Animated.View>

        </View>
      )}
    }
    componentWillMount() {
      actions.userPosts = []
      this.closeList()
      this.getAccountInfo().then(() => {
        this.getUserPosts().then(() => {
          this.updateListView()
          this.setState({name: actions.name})
          this.setState({profDesc: actions.profDesc})
          this.setState({Username: actions.Username})
          this.setState({loaded: false})
        })

      })
    };
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
}
