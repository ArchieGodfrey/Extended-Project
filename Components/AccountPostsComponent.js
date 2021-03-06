import functions from "/Users/archiegodfrey/Desktop/GitHub/Project/Functions"
import PostComponent from "/Users/archiegodfrey/Desktop/GitHub/Project/Components/postComponent"
import { NavigationActions } from 'react-navigation'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView,RefreshControl, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
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
      refreshing: false,
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

  _onRefresh() {
        const {TYPE} = this.props.navigation.state.params;
        this.setState({refreshing: true});
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
          functions.getAllUserPosts(USERID).then((MostRecentPosts) => {
            this.setState({dataSource: this.state.dataSource.cloneWithRows(MostRecentPosts)})
            this.setState({refreshing: false});
          }) 
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
        refreshControl={
          <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
          />}
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