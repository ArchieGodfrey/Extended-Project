import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import { NavigationActions } from 'react-navigation'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView,RefreshControl, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');
var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const frame = Dimensions.get('window');
const resetAction = NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({ routeName: 'SignIn' }),
    ],
    key: null
});
const navigateAction = NavigationActions.navigate({

  routeName: 'EditAccount',

  params: {},

  action: NavigationActions.navigate({ routeName: 'EditAccount'})
})

class OptionsContainer extends Component {
    render() {
        const {dispatch} = this.props;
        return(
            <View style={{alignItems:'center'}}>
                <TouchableHighlight style={{paddingBottom:(frame.height / 20),borderColor:'grey',borderBottomWidth:0.5}}
                    underlayColor="#f1f1f1" onPress={() => 
                    {this.props.dispatch(navigateAction)}}>
                    <Text style={{fontSize:20}}>Edit Account</Text>
                </TouchableHighlight>
                <TouchableHighlight style={{paddingBottom:(frame.height / 20),borderColor:'grey',borderBottomWidth:0.5}}
                    underlayColor="#f1f1f1" onPress={() => 
                    {logOut().then(() => {this.props.dispatch(resetAction)})}}>
                    <Text style={{fontSize:20}}>Log Out</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

class RequestContainer extends Component {
    constructor (props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            refreshing: false,
        }
    }

    componentWillMount() { 
        const {navigate} = this.props;
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            functions.getRequestList(ID).then((Requests) => { 
                this.setState({dataSource: this.state.dataSource.cloneWithRows(Requests)})
            }) 
            var updateRef = firebaseApp.database().ref("UserID/"+ ID + "/requests")
            updateRef.on("value", (snapshot) => {
                functions.getRequestList(ID).then((Requests) => { 
                    this.setState({dataSource: this.state.dataSource.cloneWithRows(Requests)})
                }) 
            })       
        })
    }

    _onRefresh() {
        this.setState({refreshing: true});
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            functions.getRequestList(ID).then((Requests) => { 
                this.setState({dataSource: this.state.dataSource.cloneWithRows(Requests)})
                this.setState({refreshing: false});
            })        
        })
    }

    render() {
        return(
            <View style={{backgroundColor:'white'
                ,borderColor:'grey',borderBottomWidth:0.5}}>
                <Text style={{fontSize:28}}>Requests:</Text>
                <ListView
                enableEmptySections={true}
                showsVerticalScrollIndicator={false}
                style={{backgroundColor:'white'}}
                contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
                dataSource={this.state.dataSource}
                refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh.bind(this)}
                />}
                renderRow={(rowData, sec, i) =>
                <View style={{marginBottom:(frame.width / 160), marginLeft:(frame.width / 160)}}>
                    <RequestTemplate USERID={rowData.USERID} navigate={this.props.navigate}/>
                </View>
                }
              />
            </View>
            
        )
    }
}

class RequestTemplate extends Component {
    constructor (props) {
        super(props);
        this.state = {
           imageSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/blackBackground.png", 
           name:"",
        }
    }

    componentWillMount() { 
        const {navigate,USERID} = this.props;
        functions.getDisplayName(this.props.USERID).then((result) => {
            this.setState({name:result})
        })
        functions.getProfilePicture(this.props.USERID).then((image) => {
            this.setState({imageSource:image})
        })
    }

    componentWillReceiveProps(nextProps) {
        functions.getDisplayName(nextProps.USERID).then((result) => {
            if (this.state.name !== result) {
                this.setState({name:result})
            }
        })
        functions.getProfilePicture(nextProps.USERID).then((URI) => {
        if (this.state.imageSource !== URI) {
            this.setState({imageSource:URI})
        }
        })
  }
    
    render() {
        if (this.props.USERID !== "null") {
            return(
            <View style={{flexDirection:"row",alignItems:'center',width:(frame.width)}} >
                <TouchableHighlight underlayColor="#f1f1f1" onPress={() => 
                    {this.props.navigate('UserDetail', { USERID:  this.props.USERID })}}>
                    <Image 
                        style={{resizeMode: 'cover', height: (frame.width / 8), width: (frame.width / 8)}}
                        source={{uri: this.state.imageSource}}/>
                </TouchableHighlight>
                <Text style={{fontSize:24,paddingLeft:(frame.height / 80)}} >{this.state.name}</Text>
                <TouchableHighlight underlayColor="#f1f1f1" onPress={() => functions.getFromAsyncStorage("@userID:key").then(
                    (ID) => {acceptRequest(ID,this.props.USERID)})}>
                    <Image 
                        style={{resizeMode: 'center', height: (frame.width / 10), width: (frame.width / 10)}}
                        source={require("/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/CheckedActive.png")}/>
                </TouchableHighlight>
                <TouchableHighlight underlayColor="#f1f1f1" onPress={() => functions.getFromAsyncStorage("@userID:key").then(
                    (ID) => {declineRequest(ID,this.props.USERID)})}>
                <Image 
                    style={{marginLeft:(frame.width / 40),resizeMode: 'center', 
                        height: (frame.width / 10), width: (frame.width / 10)}}
                    source={require("/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/Off.png")}/>
                </TouchableHighlight>
            </View>
        )
        } else {
            return(
                <Text style={{fontSize:24,paddingLeft:(frame.height / 80)}} >No requests</Text>
            )
        }
    }
}

export default class SettingsContents extends Component {
    render() {
        return(
            <View style={{flex:1,backgroundColor:'white'}}>
                <RequestContainer navigate={this.props.navigation.navigate}/>
                <OptionsContainer dispatch={this.props.navigation.dispatch}/>
            </View>
        )
    }
}

function logOut() {
    return new Promise(function(resolve, reject) {
        firebaseApp.auth().signOut()
        AsyncStorage.clear()
        resolve(true)
    })
}

function acceptRequest(followed,follower) {
    functions.followUser(followed,follower)
}

function declineRequest(followed,follower) {
    functions.declineRequest(followed,follower)
}