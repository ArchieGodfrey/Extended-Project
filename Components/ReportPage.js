import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import dismissKeyboard from 'dismissKeyboard'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView,ScrollView,RefreshControl, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform,KeyboardAvoidingView
} from 'react-native';

var moment = require('moment');
var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const frame = Dimensions.get('window');

class ReportContainer extends Component {
    constructor (props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            refreshing: false,
        }
    }

    render() {
        return(
          <View>
              <Text>Report Page</Text>
          </View>
        )
    }
}

export default class ReportPage extends Component {
  render() {
    const {USERID,DATE,TITLE} = this.props.navigation.state.params
    const {navigate} = this.props.navigation.navigate;
    return(
      <View keyboardShouldPersistTaps="never" style={{flex:1,backgroundColor:'white'}} >
        <ReportContainer USERID={this.props.navigation.state.params.USERID} TITLE={this.props.navigation.state.params.TITLE}
          DATE={this.props.navigation.state.params.DATE} navigate={this.props.navigation.navigate}/>
      </View>
    )
  }
}