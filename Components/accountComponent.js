import functions from "/Users/archiegodfrey/Desktop/GitHub/Project/Functions"
import ImagePicker from 'react-native-image-crop-picker';
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView,ScrollView,RefreshControl, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');


var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const frame = Dimensions.get('window');

class ImageContainer extends Component {
    constructor (props) {
        super(props);
        this.state = {
           backgroundSource:"/Users/archiegodfrey/Desktop/GitHub/Project/Images/greyBackground.png",
           avatarSource:"/Users/archiegodfrey/Desktop/GitHub/Project/Images/blackBackground.png",
           refreshing: false, 
        }
    }

    _onRefresh() {
        this.setState({refreshing: true});
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            if (ID !== null) {
                var updateRef = firebaseApp.database().ref("UserID/"+ ID)
                updateRef.on("value", (snapshot) => {
                    functions.downloadProfileImages(ID).then((urls) => {
                        this.setState({avatarSource:urls[0]})
                        this.setState({backgroundSource:urls[1]})
                        this.setState({refreshing: false});
                    })
                })
            }
        })
    }

    componentDidMount() {
        const {navigate} = this.props;
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            if (ID !== null) {
                var updateRef = firebaseApp.database().ref("UserID/"+ ID)
                updateRef.on("value", (snapshot) => {
                    functions.downloadProfileImages(ID).then((urls) => {
                        this.setState({avatarSource:urls[0]})
                        this.setState({backgroundSource:urls[1]})
                    })
                })
            }
        })
    }

    render() {
        return(
            <View style={{flex:0.5}}>
                <ScrollView contentContainerStyle={{alignItems:'center',justifyContent:'center'}}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh.bind(this)}
                    />}>
                    <Image
                    style={{position: 'absolute', top:0, left:0, right:0,resizeMode: 'cover', width: frame.width, height: (frame.height / 3) }}  
                    blurRadius={2} 
                    source={{uri: this.state.backgroundSource}}/>
                    <View style={{alignItems:'center',justifyContent:'center'}}>
                        <TouchableHighlight underlayColor="#f1f1f1" onPress={() => {this.props.navigate('EditAccount')}}>
                        <Image 
                            style={{resizeMode: 'cover',marginTop:(frame.height / 24), height: (frame.width / 4), width: (frame.width / 4)}}
                            source={{uri: this.state.avatarSource}}/>
                        </TouchableHighlight>
                        <AccountDetails/>
                    </View> 
                </ScrollView>
            </View>
        )
    }
}

class PostPreview extends Component {
    constructor (props) {
    super(props);
    this.state = {
      imageSource:"/Users/archiegodfrey/Desktop/GitHub/Project/Images/greyBackground.png", 
    }
  }

    componentWillMount() {
        const {TITLE,DESC,USERID,DATE} = this.props;
        functions.getPostPhoto(this.props.USERID,this.props.DATE).then((URI) => {
            this.setState({imageSource:URI})
        }) 
    } 

    componentWillReceiveProps(nextProps) {
        functions.getPostPhoto(nextProps.USERID,nextProps.DATE).then((URI) => {
            if (this.state.imageSource !== URI) {
                this.setState({imageSource:URI})
            }
        }) 
    }

    render() {
        if (this.state.imageSource == null) {
            return (
                <TouchableHighlight underlayColor="#f1f1f1" onPress={() => {if (this.props.DATE !== null) {this.props.navigate("AccountPosts", { USERID:  this.props.USERID })}}}  >
                <View style={{alignSelf: 'flex-start', width:(frame.width / 2.04),borderColor:'grey',
                    borderBottomWidth:1}}>
                    <Text style={{fontSize: 25}}>{this.props.TITLE.slice(0,17)}...</Text>
                    <Text style={{fontSize: 15}}>{this.props.DESC.slice(0,50)}...</Text>
                </View>
                </TouchableHighlight>
            )
        } else {
            return (
                <TouchableHighlight underlayColor="#f1f1f1" onPress={() => {if (this.props.DATE !== null) {this.props.navigate("AccountPosts", { USERID:  this.props.USERID })}}} >
                <View style={{alignSelf: 'flex-start', width:(frame.width / 2.04)}}>
                    <Image 
                        style={{resizeMode: 'cover', height: frame.height / 6}} 
                        source={{uri: this.state.imageSource}}/>
                </View>
                </TouchableHighlight>
            )
        }
    }
}

class AnalyticsBar extends Component {
    constructor (props) {
        super(props);
        this.state = {
            followers:"",
            following:"",
        }
    }

    componentWillMount() { 
        const {navigate} = this.props;
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            var followingRef = firebaseApp.database().ref("UserID/"+ ID + "/following")
            followingRef.on('value', (followingSnapshot) => {
                this.setState({following: followingSnapshot.numChildren()});
            });
            var followRef = firebaseApp.database().ref("UserID/"+ ID + "/followers")
            followRef.on('value', (followSnapshot) => {
                this.setState({followers: followSnapshot.numChildren()});
            });
        })
    }

    render() {
        return(
            <View style={{flex:0.1,flexDirection:'row',justifyContent:'center',alignItems:'center',
                borderColor:'grey',borderTopWidth:0.5,borderBottomWidth:0.5,backgroundColor:'white'}} >
                <TouchableHighlight underlayColor="#f1f1f1" onPress={() => this.props.navigate("UserList", {TYPE:"Users you follow"})} 
                    style={{borderColor:'grey',borderLeftWidth:0.5,borderRightWidth:0.5,}} >
                    <Text style={{fontSize:24}}> {this.state.following} </Text>
                </TouchableHighlight>
                <Image 
                    style={{resizeMode: 'contain',height:(frame.height / 24),width:(frame.width / 24)}} 
                    source={require("/Users/archiegodfrey/Desktop/GitHub/Project/Images/FriendsIcon.png")}/>
                <TouchableHighlight underlayColor="#f1f1f1" onPress={() => this.props.navigate("UserList", {TYPE:"Users who follow you"})} 
                    style={{borderColor:'grey',borderLeftWidth:0.5,borderRightWidth:0.5}} >
                    <Text style={{fontSize:24}}> {this.state.followers} </Text>
                </TouchableHighlight>
            </View>
        )
    }
}

class AccountPosts extends Component {
    constructor (props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            USERID:"",
            refreshing: false,
        }
    }

    componentWillMount() { 
        const {navigate} = this.props;
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            functions.getAllUserPosts(ID).then((UserPosts) => { 
                this.setState({USERID:ID})
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserPosts)})
            }) 
            var updateRef = firebaseApp.database().ref("UserID/"+ ID + "/posts")
            updateRef.on("child_removed", (snapshot) => {
                functions.getAllUserPosts(ID).then((UserPosts) => { 
                    this.setState({USERID:ID})
                    this.setState({dataSource: this.state.dataSource.cloneWithRows(UserPosts)})
                }) 
            })       
        })
    }

    _onRefresh() {
        this.setState({refreshing: true});
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            functions.getAllUserPosts(ID).then((UserPosts) => { 
                this.setState({USERID:ID})
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserPosts)})
                this.setState({refreshing: false});
            })        
        })
    }

    render() {
        return(
            <ListView
                enableEmptySections={true}
                showsVerticalScrollIndicator={false}
                style={{flex:0.4,backgroundColor:'white'}}
                contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
                dataSource={this.state.dataSource}
                refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh.bind(this)}
                />}
                renderRow={(rowData, sec, i) =>
                <View style={{marginBottom:(frame.width / 160), marginLeft:(frame.width / 160)}}>
                    <PostPreview TITLE={rowData.TITLE} DESC={rowData.DESC} 
                        USERID={this.state.USERID} DATE={rowData.DATE}
                        navigate={this.props.navigate}/>
                </View>
                }
                renderFooter={() => <View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
                  <Text style={{height: frame.height}}>                           </Text>
                  <Text style={{fontSize: 20}}>Nothing more to see here...</Text>
                </View>}
              />
        )
    }
}

class AccountDetails extends Component {
    constructor (props) {
        super(props);
        this.state = {
            name:"",
            desc:"",
        }
    }

    componentWillMount() {
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            var nameRef = firebaseApp.database().ref("UserID/"+ ID + "/Name")
            nameRef.on('value', (nameSnapshot) => {
                this.setState({name: nameSnapshot.val()});
            });
            var descRef = firebaseApp.database().ref("UserID/"+ ID + "/ProfDesc")
            descRef.on('value', (descSnapshot) => {
                this.setState({desc: descSnapshot.val()});
            });
        })
    }

    render() {
        return(
            <View style={{backgroundColor:'transparent',alignItems:'center'}}>
                <Text style={{fontSize:20,color:'white'}} >{this.state.name}</Text>
                <Text style={{fontSize:20,color:'white'}} >{this.state.desc}</Text>
            </View>
        )
    }
}

export default class AccountContents extends Component {
    render() {
        const {navigate} = this.props;
        return(
            <View style={{flex:1,justifyContent:'center'}}>
                <ImageContainer navigate={this.props.navigation.navigate}/>
                <AnalyticsBar navigate={this.props.navigation.navigate}/>
                <AccountPosts navigate={this.props.navigation.navigate}/>
            </View>
        )
    }
}

