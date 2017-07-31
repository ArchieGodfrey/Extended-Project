import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import PostComponent from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/postComponent"
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage");

const frame = Dimensions.get('window');

export default class Timeline extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
    }
  }

  componentDidMount() {
    const {navigate} = this.props.navigation;
    /*tryLoadCache().then((OldPosts) => { //Works but SLOW
      this.setState({dataSource: this.state.dataSource.cloneWithRows(OldPosts)})
    })*/
    functions.getFromAsyncStorage("@userID:key").then((UserID) => {
      if (UserID !== null) {
        functions.getTimeline(UserID,8).then((MostRecentPosts) => {
          this.setState({dataSource: this.state.dataSource.cloneWithRows(MostRecentPosts)})
          saveCache(MostRecentPosts)
      }) 
      } else { //Not Logged In
        this.props.navigation.navigate('SignIn')
      } 
    })
  }

  transition(location) {
    this.props.navigation.navigate(location)
}

  render() {
    return(
        <ListView
        enableEmptySections={true}
        showsVerticalScrollIndicator={false}
        style={{flex:1}}
        contentContainerStyle={{flexDirection: 'column'}}
        horizontal={false}
        dataSource={this.state.dataSource}
        renderRow={(rowData, s, i) =>
        <View >
          <PostComponent USERID={rowData.USERID} TITLE={rowData.TITLE} 
          LIKES={rowData.LIKES} DESC={rowData.DESC} DATE={rowData.DATE} 
          navigate={this.props.navigation.navigate}/>
        </View>
        }
        renderHeader={() => <View style={{backgroundColor:'white', marginTop:(frame.height / 20), 
        marginBottom:(frame.height / 20),  alignSelf: 'center'}}>
        <TouchableHighlight onPress={() => {this.transition("NewPost") }}>
          <Text style={{fontSize: 20}}>New Post</Text>
        </TouchableHighlight>
          
        </View>}
      />     
    )
  }
}

function saveCache(Posts) {
  try {
    AsyncStorage.setItem('@feedCache:key', JSON.stringify(Posts));
  } catch (error) {
    // Error saving feed cache
  }
}

function tryLoadCache() {
  return new Promise(function(resolve, reject) {
    try {
      AsyncStorage.getItem('@feedCache:key').then((list) => {
        if (list != null) {
          clearTimeout(timeOut)
          resolve(JSON.parse(list))
        } else {
          clearTimeout(timeOut)
          resolve(null)
        }
      })
    } catch (error) {
      // Error saving data
    }
    var timeOut = setTimeout(function() {
    resolve(null)}, 10000)
  })
}