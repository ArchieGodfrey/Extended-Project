import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');
var ImagePicker = require('react-native-image-picker');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const frame = Dimensions.get('window');

class ImageContainer extends Component {
    constructor (props) {
        super(props);
        this.state = {
           backgroundSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/greyBackground.png",
           avatarSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/blackBackground.png", 
        }
    }

    componentDidMount() {
        functions.getFromAsyncStorage("@profileCache:key").then((value) => {
            if (value === null) {
                functions.getFromAsyncStorage("@userID:key").then((ID) => {
                    functions.downloadProfileImages(ID).then((urls) => {
                    this.setState({avatarSource:urls[0]})
                    this.setState({backgroundSource:urls[1]})
                })
            })
            } else {
               this.setState({avatarSource:value}) 
            }
        })
        functions.getFromAsyncStorage("@backgroundCache:key").then((value) => {
            if (value !== null) {
                this.setState({backgroundSource:value})
            }
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
                    <AccountDetails/>
                </View>
                
            </View>
        )
    }
}

class PostPreview extends Component {
    constructor (props) {
    super(props);
    this.state = {
      imageSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/greyBackground.png", 
    }
  }

    componentWillMount() {
        const {TITLE,DESC,USERID,DATE} = this.props;
        functions.getPostPhoto(this.props.USERID,this.props.DATE).then((URI) => {
            this.setState({imageSource:URI})
        }) 
    } 

    render() {
        return (
            <View style={{alignSelf: 'flex-start', width:(frame.width / 2.2)}}>
                <Text style={{fontSize: 25}}> {this.props.TITLE}</Text>
                <TouchableHighlight onPress={() => {this.showPosts(), 
                    this.listView.scrollTo({ x:frame.width * i, y:0, animated:false })}}>
                    <Image
                        style={{resizeMode: 'cover', width: frame.width / 2, height: frame.height / 6}} 
                        source={{uri: this.state.imageSource}}/>
                </TouchableHighlight>
                <Text style={{fontSize: 15}}> {this.props.DESC !== null ? this.props.DESC.slice(0,45) : "Loading" }...</Text>
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
        }
    }

    componentWillMount() { 
        functions.getFromAsyncStorage("@userID:key").then((ID) => {
            functions.getAllUserPosts(ID).then((UserPosts) => { 
                this.setState({USERID:ID})
                this.setState({dataSource: this.state.dataSource.cloneWithRows(UserPosts)})
            })
        })
        
    } 

    render() {
        return(
            <ListView
                enableEmptySections={true}
                showsVerticalScrollIndicator={false}
                style={{backgroundColor:'white'}}
                contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
                dataSource={this.state.dataSource}
                renderRow={(rowData, sec, i) =>
                <View style={{alignSelf: 'flex-start', width:(frame.width / 2) - 20}}>
                    <PostPreview TITLE={rowData.TITLE} DESC={rowData.DESC} 
                        USERID={this.state.USERID} DATE={rowData.DATE}/>
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
            nameRef.once('value', (nameSnapshot) => {
                this.setState({name: nameSnapshot.val()});
            });
            var descRef = firebaseApp.database().ref("UserID/"+ ID + "/ProfDesc")
            descRef.once('value', (descSnapshot) => {
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

class postDetails extends Component {
    //Complete Post Component First
}

export default class AccountContents extends Component {
    render() {
        return(
            <View style={{flex:1,justifyContent:'center'}}>
                <ImageContainer />
                <AccountPosts />
            </View>
        )
    }
}