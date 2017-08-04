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
const MessageRequirements = {
    MessageValid:false,Message:"",
}

class CommentTemplate extends Component {
    constructor (props) {
        super(props);
        this.state = {
           imageSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/blackBackground.png", 
           name:"",
        }
    }

    componentWillMount() { 
        const {navigate,USERID,DESC,DATE} = this.props;
        functions.getProfilePicture(this.props.USERID).then((image) => {
            this.setState({imageSource:image})
        })
    }

    componentWillReceiveProps(nextProps) {
        functions.getProfilePicture(nextProps.USERID).then((URI) => {
        if (this.state.imageSource !== URI) {
            this.setState({imageSource:URI})
        }
        })
  }
    
    render() {
        if (this.props.USERID !== "null") {
            return(
            <View style={{flexDirection:"row",alignItems:'center',marginTop:(frame.height / 80)}} >
                <TouchableHighlight underlayColor="#f1f1f1" onPress={() => 
                    {this.props.navigate('UserDetail', { USERID:  this.props.USERID })}}>
                    <Image 
                        style={{resizeMode: 'cover', height: (frame.width / 6), width: (frame.width / 6)}}
                        source={{uri: this.state.imageSource}}/>
                </TouchableHighlight>
                <View style={{width:frame.width / 1.25,flexDirection:"column",flexWrap: 'wrap', paddingLeft:(frame.width / 80),
                  paddingRight:(frame.width / 80)}}>
                  <Text style={{fontSize:18}} >{this.props.DESC}</Text>
                  <Text style={{paddingLeft:(frame.width / 80),
                    fontSize:16,color:'grey'}}>{moment(this.props.DATE, "YYYYMMDDHHmmss").fromNow()}</Text>
                </View>
            </View>
        )
        } else {
            return(
                <Text style={{fontSize:24,paddingLeft:(frame.height / 80)}} >No comments</Text>
            )
        }
    }
}

class HeaderTemplate extends Component {
    constructor (props) {
        super(props);
        this.state = {
           imageSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/blackBackground.png", 
           name:"",
        }
    }

    componentWillMount() { 
        const {navigate,USERID,TITLE,DATE} = this.props;
        functions.getProfilePicture(this.props.USERID).then((image) => {
            this.setState({imageSource:image})
        })
    }

    componentWillReceiveProps(nextProps) {
        functions.getProfilePicture(nextProps.USERID).then((URI) => {
        if (this.state.imageSource !== URI) {
            this.setState({imageSource:URI})
        }
        })
  }
    
    render() {
        return(
          <View style={{flexDirection:'row', flexWrap: 'wrap',margin:(frame.width / 40)}} >
            <TouchableHighlight underlayColor="#F1F1F1"  onPress={() => {this.props.navigate('UserDetail', { USERID:  this.props.USERID })}}>
              <Image style={{resizeMode: 'cover', height: (frame.height / 10), 
                width: (frame.width / 6)}} source={{uri: this.state.imageSource}} />
            </TouchableHighlight>
            <View style={{flexDirection:'column',marginTop:(frame.height / 80),marginLeft:(frame.height / 80)
              ,marginBottom:(frame.height / 160)}}> 
              <Text style={{fontSize:22}}>{this.props.TITLE}</Text>
              <Text style={{fontSize:16,color:'grey'}}>
                {moment(this.props.DATE, "YYYYMMDDHHmmss").format('MMMM Do YYYY, HH:mm')}
              </Text>
            </View>
          </View>
        )
    }
}

class CommentContainer extends Component {
    constructor (props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            refreshing: false,
        }
    }

    componentWillMount() { 
        const {navigate,USERID,DATE,TITLE} = this.props;
        functions.getPostComments(USERID,DATE).then((Comments) => { 
            this.setState({dataSource: this.state.dataSource.cloneWithRows(Comments)})
        }) 
        var updateRef = firebaseApp.database().ref("UserID/"+ this.props.USERID +  "/posts/" + this.props.DATE + "/comments")
        updateRef.on("value", (snapshot) => {
            functions.getPostComments(USERID,DATE).then((Comments) => { 
                this.setState({dataSource: this.state.dataSource.cloneWithRows(Comments)})
            }) 
        })       
    }
    componentWillUnmount() { 
      var updateRef = firebaseApp.database().ref("UserID/"+ this.props.USERID +  "/posts/" + this.props.DATE + "/comments")
      updateRef.off()
    }

    _onRefresh() {
        const {navigate,USERID,DATE} = this.props;
        this.setState({refreshing: true});
        functions.getPostComments(USERID,DATE).then((Comments) => { 
            this.setState({dataSource: this.state.dataSource.cloneWithRows(Comments)})
             this.setState({refreshing: false});
        })
    }

    render() {
        return(
          <ListView
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          style={{flex:1}}
          contentContainerStyle={{flexDirection: 'column'}}
          keyboardShouldPersistTaps="never"
          dataSource={this.state.dataSource}
          refreshControl={
          <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
          />}
          renderHeader={() => <View><HeaderTemplate USERID={this.props.USERID} TITLE={this.props.TITLE} 
            DATE={this.props.DATE} navigate={this.props.navigate}/>
            <Composer USERID={this.props.USERID} DATE={this.props.DATE}/></View>}
          renderRow={(rowData, sec, i) =>
          <View style={{marginBottom:(frame.width / 160), marginLeft:(frame.width / 160)}}>
              <CommentTemplate USERID={rowData.USERID} DESC={rowData.DESC} 
                DATE={rowData.DATE} navigate={this.props.navigate}/>
          </View>
          }
        />
        )
    }
}

class Composer extends Component {
  constructor (props) {
     super(props);
     this.state = {
       message:"", 
     }
   }

   clearText() {
     this.setState({message:""})
     MessageRequirements.MessageValid = false
     dismissKeyboard()
   }

  checkMessage(message) {
     this.setState({message: message.replace(/\r?\n|\r/g,"")})
     temp = this.state.message.replace(/\s/g,'')
     if (temp.length > 0) {
      MessageRequirements.MessageValid = true
      MessageRequirements.Message = this.state.message
     } else {
       MessageRequirements.MessageValid = false
     }
   }

  render() {
    return(
      <KeyboardAvoidingView style={{backgroundColor:'white',borderColor:'grey',borderTopWidth:0.5
        ,borderBottomWidth:0.5,flexDirection:'row',alignItems:'center'}} behavior='padding' >
        <TouchableHighlight underlayColor="#F1F1F1"  onPress={() => {addComment(this.props.USERID,this.props.DATE),this.clearText()}}>
          <Image 
              style={{marginLeft:(frame.width / 40),resizeMode: 'center', height: (frame.width / 12), width: (frame.width / 12)}}
              source={require("/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/PlusIcon.png")}/>
        </TouchableHighlight>
            <AutoGrowingTextInput style={{width:frame.width / 1.25,marginLeft:(frame.width / 40), fontSize:22, height:(frame.height / 20)}} 
             placeholder={'Add a comment...'}
              maxHeight={frame.height / 10}
              minHeight={frame.height / 18}
              maxLength={100}
              value={this.state.message}
              onEndEditing={(event) => this.checkMessage(event.nativeEvent.text)}
              onChange={(event) => this.checkMessage(event.nativeEvent.text)}
              />
      </KeyboardAvoidingView>
    )
  }
}

export default class CommentSection extends Component {
  render() {
    const {USERID,DATE,TITLE} = this.props.navigation.state.params
    const {navigate} = this.props.navigation.navigate;
    return(
      <View keyboardShouldPersistTaps="never" style={{flex:1,backgroundColor:'white'}} >
        <CommentContainer USERID={this.props.navigation.state.params.USERID} TITLE={this.props.navigation.state.params.TITLE}
          DATE={this.props.navigation.state.params.DATE} navigate={this.props.navigation.navigate}/>
      </View>
    )
  }
}

function addComment(UserID,Date) {
  if (MessageRequirements.MessageValid == true) {
    var timeKey = moment().format('YYYYMMDDHHmmss')
    var commentQuery = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + Date + "/comments")
    functions.getFromAsyncStorage("@userID:key").then((USERID) => {
      commentQuery.child(timeKey).set({
        userID: USERID,
        desc: MessageRequirements.Message,
      })
    })
  } 
}

