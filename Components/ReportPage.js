import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import dismissKeyboard from 'dismissKeyboard'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView,ScrollView,RefreshControl,TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform,KeyboardAvoidingView
} from 'react-native';

var moment = require('moment');
var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const frame = Dimensions.get('window');

class ReportOption extends Component {
    render() {
        const {OFFENDER,POSTTITLE,POSTDATE,POSTDESC,MESSAGE} = this.props
        return(
           <TouchableHighlight underlayColor="#f1f1f1" style={{height:(frame.height / 16),borderColor:'grey'
                ,borderBottomWidth:0.5,justifyContent:'center'}} onPress={() => {
                    functions.reportForm(this.props.OPTION,moment().format('YYYYMMDDHHmmss'),this.props.OFFENDER,
                        this.props.POSTDATE,this.props.POSTTITLE,this.props.POSTDESC,this.props.MESSAGE)}}>
                <View style={{alignItems:'center',flexDirection:'row'}}>
                    <Text style={{fontSize:20,marginLeft:(frame.width / 80),
                        fontWeight:'bold'}} >{this.props.OPTION}</Text>
                    <Text style={{fontSize:20,marginLeft:(frame.width / 80),position:'absolute',
                    right:(frame.width/40)}}>Report</Text>
                </View>
            </TouchableHighlight> 
        )
    }
}

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
          <View style={{flex:1}}>
              <Text style={{fontSize:22,marginTop:(frame.height / 80),marginBottom:(frame.height / 80),
                    borderColor:'grey',borderBottomWidth:0.5,marginLeft:(frame.width / 80)}} >Choose a reason for reporting this post</Text>
                <ReportOption OPTION={"Harrassment or bullying"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE}/>
                <ReportOption OPTION={"Nudity or pornography"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE}/>
                <ReportOption OPTION={"Violence or harm"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE}/>
                <ReportOption OPTION={"Hate speech or symbols"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE}/>
                <ReportOption OPTION={"Intellectual property violation"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE}/>
                <ReportOption OPTION={"I just don't like it"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE}/>
          </View>
        )
    }
}

export default class ReportPage extends Component {
  render() {
      const {OFFENDER,POSTTITLE,POSTDATE,POSTDESC,MESSAGE} = this.props.navigation.state.params;
      const {navigate} = this.props.navigation.navigate
    return(
      <View keyboardShouldPersistTaps="never" style={{flex:1,backgroundColor:'white'}} >
        <ReportContainer OFFENDER={this.props.navigation.state.params.OFFENDER} POSTTITLE={this.props.navigation.state.params.POSTTITLE}
          POSTDATE={this.props.navigation.state.params.POSTDATE} POSTDESC={this.props.navigation.state.params.POSTDESC}
          MESSAGE={this.props.navigation.state.params.MESSAGE} navigate={this.props.navigation.navigate}/>
      </View>
    )
  }
}