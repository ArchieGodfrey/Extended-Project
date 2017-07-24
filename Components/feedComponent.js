import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import PostComponent from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/postComponent"
import React, { Component } from 'react';
import { StackNavigator  } from 'react-navigation';
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
    functions.getFromAsyncStorage("@userID:key").then((UserID) => {
      functions.getTimeline(UserID,8).then((MostRecentPosts) => {
          this.setState({dataSource: this.state.dataSource.cloneWithRows(MostRecentPosts)})
      }) 
    })
  }

  render() {
    return(
        <ListView
        enableEmptySections={true}
        style={{flex:1}}
        contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
        horizontal={false}
        dataSource={this.state.dataSource}
        renderRow={(rowData, s, i) =>
        <View style={{width:frame.width, height:frame.height}} >
          <PostComponent USERID={rowData.USERID} TITLE={rowData.TITLE} 
          LIKES={rowData.LIKES} DESC={rowData.DESC} DATE={rowData.DATE} navigate={this.props.navigation.navigate}/>
        </View>
        }
      />
    )
  }
}