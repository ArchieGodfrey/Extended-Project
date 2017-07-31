import actions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Actions"
import firebase from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/firebaseConfig'
import LikeComponent from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/likeComponent"
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
  }

  render() {
    if (this.state.loaded == false) {
      return (
      <View style={{backgroundColor:"white", opacity:1, height: window.height, width:window.width}}>
        <Text>Loading...</Text>
      </View>
    )
    } else {
      return(
        <View style={{flex:1, position:'absolute'}}>
          <ListView
            enableEmptySections={true}
            style={{backgroundColor:'white', paddingLeft: 10, paddingRight: 10,  width: window.width}}
            contentContainerStyle={{flexDirection: 'column', flexWrap: 'wrap'}}
            dataSource={this.state.dataSource}
            renderRow={(rowData, sec, i) =>
            <View style={{alignSelf: 'flex-start', width:(window.width / 2) - 20}}>
              <Image
                style={{resizeMode: 'cover', width: 50, height: 50}} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/luggageCase.jpg')}/>
              <Text style={{fontSize: 15}}> {rowData.MESSAGE}</Text>
            </View>
            } />
        </View>
}
