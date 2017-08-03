import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import PostComponent from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/postComponent"
import { NavigationActions } from 'react-navigation'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage");

const backAction = NavigationActions.back({})
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
    const {USERID} = this.props.navigation.state.params;
    functions.getFromAsyncStorage("@userID:key").then((ID) => {
      functions.getAllUserPosts(USERID).then((MostRecentPosts) => {
        this.setState({dataSource: this.state.dataSource.cloneWithRows(MostRecentPosts)})
      }) 
      var updateRef = firebaseApp.database().ref("UserID/"+ ID + "/posts")
      updateRef.on("child_removed", (snapshot) => {
        this.props.navigation.dispatch(backAction)
      })
    })
  }

  componentWillUnmount() {
    functions.getFromAsyncStorage("@userID:key").then((ID) => {
      var updateRef = firebaseApp.database().ref("UserID/"+ ID + "/posts")
      updateRef.off()
    })
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
      />     
    )
  }
}