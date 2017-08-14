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

class ListItem extends Component {
    constructor (props) {
        super(props);
        this.state = {
           imageSource:"/Users/archiegodfrey/Desktop/GitHub/Project/Images/blackBackground.png", 
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

  optionsPressed() {
    functions.getFromAsyncStorage("@userID:key").then((ID) => {
      if (ID !== this.props.USERID) {
        functions.checkIfUserBlocked(ID,this.props.USERID).then((blocked) => {
            if (blocked == false) {
                Alert.alert(
                    'Post Options',
                    "Are you sure you want to block this user?",
                    [
                        {text: 'Block', onPress: () => {
                        functions.blockUser(ID,this.props.USERID)
                        }},
                        {text: 'Cancel', style: 'cancel'},
                    ],
                        { cancelable: true }
                    ) 
            } else {
                Alert.alert(
                    'Post Options',
                    "Are you sure you want to unblock this user?",
                    [
                        {text: 'Unblock', onPress: () => {
                        functions.unblockUser(ID,this.props.USERID)
                        }},
                        {text: 'Cancel', style: 'cancel'},
                    ],
                        { cancelable: true }
                    ) 
            }
        })
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
                <View style={{position:'absolute',right:(frame.width/40),flexDirection:'row'}}>
                    <TouchableHighlight underlayColor="#f1f1f1" onPress={() => this.optionsPressed()}>
                        <Image style={{resizeMode: 'contain',resizeMode:'center',marginTop:(frame.height / 80)}} 
                        source={require('/Users/archiegodfrey/Desktop/GitHub/Project/Images/MenuIcon.png')}/>
                    </TouchableHighlight>
                </View>
            </View>
        )
        } else {
            return(
                <Text style={{fontSize:24,paddingLeft:(frame.height / 80)}} >No users on this list</Text>
            )
        }
    }
}

export default class ListContainer extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      refreshing: false,
    }
  }

  componentDidMount() {
    const {TYPE} = this.props.navigation.state.params;
    functions.getFromAsyncStorage("@userID:key").then((ID) => {
        if (TYPE == "Blocked Users") {
            functions.getList(ID,"blocked").then((UserList) => {
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserList)})
            }) 
            var updateRef = firebaseApp.database().ref("UserID/"+ ID + "/blocked")
            updateRef.on("child_changed", (snapshot) => {
                functions.getList(ID,"blocked").then((UserList) => {
                    this.setState({dataSource: this.state.dataSource.cloneWithRows(UserList)})
                }) 
            })
        } else if (TYPE == "Users you follow") {
            functions.getList(ID,"following").then((UserList) => {
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserList)})
            }) 
            var updateRef = firebaseApp.database().ref("UserID/"+ ID + "/following")
            updateRef.on("child_changed", (snapshot) => {
                functions.getList(ID,"following").then((UserList) => {
                    this.setState({dataSource: this.state.dataSource.cloneWithRows(UserList)})
                }) 
            })
        } else if (TYPE == "Users who follow you") {
            functions.getList(ID,"followers").then((UserList) => {
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserList)})
            }) 
            var updateRef = firebaseApp.database().ref("UserID/"+ ID + "/followers")
            updateRef.on("child_changed", (snapshot) => {
                functions.getList(ID,"followers").then((UserList) => {
                    this.setState({dataSource: this.state.dataSource.cloneWithRows(UserList)})
                }) 
            })
        }
    })
  }

  componentWillUnmount() {
    functions.getFromAsyncStorage("@userID:key").then((ID) => {
      var updateRef = firebaseApp.database().ref("UserID/"+ ID + "/posts")
      updateRef.off()
      var followersRef = firebaseApp.database().ref("UserID/"+ ID + "/followers")
      followersRef.off()
      var followingRef = firebaseApp.database().ref("UserID/"+ ID + "/following")
      followingRef.off()
      var blockRef = firebaseApp.database().ref("UserID/"+ ID + "/blocked")
      blockRef.off()
    })
  }

  _onRefresh() {
        const {TYPE} = this.props.navigation.state.params;
        this.setState({refreshing: true});
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
        if (TYPE == "Blocked Users") {
            functions.getList(ID,"blocked").then((UserList) => {
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserList)})
                this.setState({refreshing: false});
            }) 
        } else if (TYPE == "Users you follow") {
            functions.getList(ID,"following").then((UserList) => {
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserList)})
                this.setState({refreshing: false});
            }) 
        } else if (TYPE == "Users who follow you") {
            functions.getList(ID,"followers").then((UserList) => {
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserList)})
                this.setState({refreshing: false});
            }) 
        }
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
          <ListItem USERID={rowData.USERID}
          navigate={this.props.navigation.navigate}/>
        </View>
        }
      />     
    )
  }
}