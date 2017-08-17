import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView,ScrollView,RefreshControl, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');


var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const frame = Dimensions.get('window');

class OtherAccountImageContainer extends Component {
    constructor (props) {
        super(props);
        this.state = {
           backgroundSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/greyBackground.png",
           avatarSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/blackBackground.png", 
        }
    }

    componentDidMount() {
        const {navigate,USERID} = this.props;
        var updateRef = firebaseApp.database().ref("UserID/"+ this.props.USERID)
        updateRef.once("value", (snapshot) => {
            functions.downloadProfileImages(this.props.USERID).then((urls) => {
                this.setState({avatarSource:urls[0]})
                this.setState({backgroundSource:urls[1]})
            })
        })
    }

    render() {
        return(
            
            <View style={{flex:0.5,alignItems:'center',justifyContent:'center'}}>
                <Image
                style={{position: 'absolute', top:0, left:0, right:0,resizeMode: 'cover', width: frame.width, height: (frame.height / 3) }}  
                blurRadius={2} 
                source={{uri: this.state.backgroundSource}}/>
                <View style={{alignItems:'center'}}>
                    <Image 
                    style={{resizeMode: 'cover', height: (frame.width / 4), width: (frame.width / 4)}}
                    source={{uri: this.state.avatarSource}}/>
                    <AccountDetails USERID={this.props.USERID}/>
                </View>
                
            </View>
        )
    }
}

class PostPreview extends Component {
    constructor (props) {
    super(props);
    this.state = {
      imageSource:null, 
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
            followed:"",
            userID:""
        }
    }

    componentWillMount() { 
        const {USERID} = this.props;
        var followingRef = firebaseApp.database().ref("UserID/"+ this.props.USERID + "/following")
        followingRef.on('value', (followingSnapshot) => {
            this.setState({following: followingSnapshot.numChildren()});
        });
        var followRef = firebaseApp.database().ref("UserID/"+ this.props.USERID + "/followers")
        followRef.on('value', (followSnapshot) => {
            this.setState({followers: followSnapshot.numChildren()});
        });
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            this.setState({userID:ID})
            functions.getFollowStatus(this.props.USERID,ID).then((result) => {
                this.setState({followed:result})
            })
        })
    }

    componentWillUnmount() { 
        var followRef = firebaseApp.database().ref("UserID/"+ this.props.USERID + "/followers")
        followRef.off()
        var followingRef = firebaseApp.database().ref("UserID/"+ this.props.USERID + "/following")
        followingRef.off()
    }

    render() {
        return(
            <View style={{flex:0.1,flexDirection:'row',justifyContent:'center',alignItems:'center',
                borderColor:'grey',borderTopWidth:0.5,borderBottomWidth:0.5,backgroundColor:'white'}} >
                <View style={{borderColor:'grey',borderLeftWidth:0.5,borderRightWidth:0.5,}} >
                    <Text style={{fontSize:24}}> {this.state.following} </Text>
                </View>
                <TouchableHighlight onPress={() => {functions.updateFollowStatus(this.props.USERID,this.state.userID).then((result) => 
                    {this.setState({followed:result})})}}>
                    <Text style={{fontSize:20}}> {this.state.followed} </Text>
                </TouchableHighlight>
                <View style={{borderColor:'grey',borderLeftWidth:0.5,borderRightWidth:0.5,paddingLeft:(frame.width / 80)}} >
                    <Text style={{fontSize:24}}> {this.state.followers} </Text>
                </View>
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
            refreshing: false,
        }
    }

    componentWillMount() { 
        const {navigate,USERID,FOLLOWED} = this.props;
            functions.getAllUserPosts(this.props.USERID).then((UserPosts) => { 
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserPosts)})
            }) 
            var updateRef = firebaseApp.database().ref("UserID/"+ this.props.USERID + "/posts")
            updateRef.on("child_removed", (snapshot) => {
                functions.getAllUserPosts(this.props.USERID).then((UserPosts) => { 
                    this.setState({dataSource: this.state.dataSource.cloneWithRows(UserPosts)})
                }) 
            })       
    }

    _onRefresh() {
        this.setState({refreshing: true});
            functions.getAllUserPosts(this.props.USERID).then((UserPosts) => { 
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserPosts)})
                this.setState({refreshing: false});
            })        
    }

    render() {
        if (this.props.FOLLOWED == "Followed") {
            return(
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
                    <PostPreview TITLE={rowData.TITLE} DESC={rowData.DESC} 
                        USERID={this.props.USERID} DATE={rowData.DATE}
                        navigate={this.props.navigate}/>
                </View>
                }
                renderFooter={() => <View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
                  <Text style={{height: frame.height}}>                           </Text>
                  <Text style={{fontSize: 20}}>Nothing more to see here...</Text>
                </View>}
              />
        )
        } else {
            return(
                <View style={{height:(frame.height / 1.75),justifyContent:'center',alignItems:'center',
                flexDirection:'column'}} >
                    <Image 
                    style={{resizeMode: 'cover'}} 
                    source={require("/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/UserIcon.png")}/>
                    <Text style={{fontSize:20}} >You must follow the user to see their posts</Text>
                </View>
            )
        }
        
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
        const {USERID} = this.props;
        var nameRef = firebaseApp.database().ref("UserID/"+ this.props.USERID + "/Name")
        nameRef.on('value', (nameSnapshot) => {
            this.setState({name: nameSnapshot.val()});
        });
        var descRef = firebaseApp.database().ref("UserID/"+ this.props.USERID + "/ProfDesc")
        descRef.on('value', (descSnapshot) => {
            this.setState({desc: descSnapshot.val()});
        });
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
    constructor (props) {
        super(props);
        this.state = {
            followed:"Request",
        }
    }

    componentWillMount() { 
        const { USERID } = this.props.navigation.state.params;
        const {navigate} = this.props;
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            functions.getFollowStatus(this.props.navigation.state.params.USERID,ID).then((result) => {
                this.setState({followed:result})
            })
        })
    }

    render() {
        return(
            <View style={{flex:1,justifyContent:'center'}}>
                <OtherAccountImageContainer USERID={this.props.navigation.state.params.USERID} 
                    navigate={this.props.navigation.navigate}/>
                <AnalyticsBar USERID={this.props.navigation.state.params.USERID} />
                <AccountPosts FOLLOWED={this.state.followed}
                    USERID={this.props.navigation.state.params.USERID} 
                    navigate={this.props.navigation.navigate}/>
            </View>
        )
    }
}
