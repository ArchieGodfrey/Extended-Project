import functions from "/Users/archiegodfrey/Desktop/GitHub/Project/Functions"
import {NavigationActions} from 'react-navigation';
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import dismissKeyboard from 'dismissKeyboard'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView,ScrollView,RefreshControl,TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform,KeyboardAvoidingView
} from 'react-native';

var moment = require('moment');
var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const backAction = NavigationActions.back({})
const frame = Dimensions.get('window');

class ReportOption extends Component {
    render() {
        const {OFFENDER,POSTTITLE,POSTDATE,POSTDESC,MESSAGE,dispatch} = this.props
        return(
           <TouchableHighlight underlayColor="#f1f1f1" style={{height:(frame.height / 16),borderColor:'grey'
                ,borderBottomWidth:0.5,justifyContent:'center'}} onPress={() => {
                    functions.reportForm(this.props.OPTION,moment().format('YYYYMMDDHHmmss'),this.props.OFFENDER,
                        this.props.POSTDATE,this.props.POSTTITLE,this.props.POSTDESC,this.props.MESSAGE),
                            alert("Report sent for review"),this.props.dispatch(backAction)}}>
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
                    MESSAGE={this.props.MESSAGE} dispatch={this.props.dispatch}/>
                <ReportOption OPTION={"Nudity or pornography"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE} dispatch={this.props.dispatch}/>
                <ReportOption OPTION={"Violence or harm"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE} dispatch={this.props.dispatch}/>
                <ReportOption OPTION={"Hate speech or symbols"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE} dispatch={this.props.dispatch}/>
                <ReportOption OPTION={"Intellectual property violation"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE} dispatch={this.props.dispatch}/>
                <ReportOption OPTION={"I just don't like it"} OFFENDER={this.props.OFFENDER} 
                    POSTDATE={this.props.POSTDATE} POSTTITLE={this.props.POSTTITLE} POSTDESC={this.props.POSTDESC}
                    MESSAGE={this.props.MESSAGE} dispatch={this.props.dispatch}/>
          </View>
        )
    }
}

export default class ReportPage extends Component {
  render() {
      const {OFFENDER,POSTTITLE,POSTDATE,POSTDESC,MESSAGE} = this.props.navigation.state.params;
      const {dispatch} = this.props.navigation
    return(
      <View keyboardShouldPersistTaps="never" style={{flex:1,backgroundColor:'white'}} >
        <ReportContainer OFFENDER={this.props.navigation.state.params.OFFENDER} POSTTITLE={this.props.navigation.state.params.POSTTITLE}
          POSTDATE={this.props.navigation.state.params.POSTDATE} POSTDESC={this.props.navigation.state.params.POSTDESC}
          MESSAGE={this.props.navigation.state.params.MESSAGE} dispatch={this.props.navigation.dispatch}/>
      </View>
    )
  }
}