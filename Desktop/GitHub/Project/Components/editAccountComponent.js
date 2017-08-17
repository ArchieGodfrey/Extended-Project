
import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import RNFetchBlob from 'react-native-fetch-blob'
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import { NavigationActions } from 'react-navigation'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ScrollView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');
var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")

const frame = Dimensions.get('window');
const backAction = NavigationActions.back({})

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const AccountRequirements = {
  ProfileURI:"",BackgroundURI:"",NameValid:false,Name:"",
  DescValid:false,Desc:""
}

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
                    if (ID !== null) {
                        functions.downloadProfileImages(ID).then((urls) => {
                            this.setState({avatarSource:urls[0]})
                            this.setState({backgroundSource:urls[1]})
                            functions.setItemAsyncStorage("@profileCache:key",urls[0])
                            functions.setItemAsyncStorage("@backgroundCache:key",urls[1])
                        })
                    }
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
          <TouchableHighlight underlayColor="#f1f1f1" onPress={() => {functions.chooseImage(frame.height / 3,frame.width).then((image) => {
            this.setState({backgroundSource:image}), AccountRequirements.BackgroundURI = image})}}>
            <View style={{flex:0.5,alignItems:'center',justifyContent:'center'}}>
                <Image
                  style={{position: 'absolute', top:0, left:0, right:0,resizeMode: 'cover', width: frame.width, height: (frame.height / 3) }}  
                  blurRadius={2} 
                  source={{uri: this.state.backgroundSource}}/>
                  <TouchableHighlight underlayColor="#f1f1f1" onPress={() => {functions.chooseImage((frame.width / 4),(frame.width / 4)).then((image) => {
                this.setState({avatarSource:image}), AccountRequirements.ProfileURI = image})}}>
                  <Image 
                    style={{marginTop:(frame.height / 24), alignSelf:'center',
                    resizeMode: 'cover', height: (frame.width / 4), 
                    width: (frame.width / 4)}}
                    source={{uri: this.state.avatarSource}}/>
                  </TouchableHighlight>
              </View> 
          </TouchableHighlight>
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
              if (nameSnapshot.val() !== null) {
                AccountRequirements.NameValid = true
                this.setState({name: nameSnapshot.val()});
              }
            });
            var descRef = firebaseApp.database().ref("UserID/"+ ID + "/ProfDesc")
            descRef.once('value', (descSnapshot) => {
              if (descSnapshot.val() !== null) {
                AccountRequirements.DescValid = true
                this.setState({desc: descSnapshot.val()});
              }
            });
        })
    }

    checkName(name) {
      this.setState({name: name.replace(/\r?\n|\r/g,"")})
      temp = this.state.name.replace(/\s/g,'')
      if (temp.length > 0) {
        AccountRequirements.NameValid = true
        AccountRequirements.Name = this.state.name
      } else {
        AccountRequirements.NameValid = false
      }
   }

   checkDesc(desc) {
      this.setState({desc: desc.replace(/\r?\n|\r/g,"")})
      temp = this.state.desc.replace(/\s/g,'')
      if (temp.length > 0) {
        AccountRequirements.DescValid = true
        AccountRequirements.Desc = this.state.desc
      } else {
        AccountRequirements.DescValid = false
      }
   }

    render() {
        return(
            <View style={{backgroundColor:'transparent',alignItems:'center'}}>
              <AutoGrowingTextInput style={{fontSize:20,color:'white',width:(frame.width / 1.5)}}
              placeholder={"Name"}
              maxHeight={frame.height / 20}
              minHeight={frame.height / 20}
              maxLength={20}
              value={this.state.name}
              onEndEditing={(event) => this.checkName(event.nativeEvent.text)}
              onChange={(event) => this.checkName(event.nativeEvent.text)}/>
              <AutoGrowingTextInput style={{fontSize:20,color:'white',width:(frame.width / 1.5)}}
              placeholder={"Description"}
              maxHeight={((frame.height / 20) * 2)}
              minHeight={frame.height / 20}
              maxLength={36}
              value={this.state.desc}
              onChange={(event) => this.checkDesc(event.nativeEvent.text)}
              onEndEditing={(event) => this.checkDesc(event.nativeEvent.text)}/>
            </View>
        )
    }
}

class EditDetails extends Component {
  render() {
    const {dispatch} = this.props;
    return(
      <View style={{paddingTop:(frame.height / 10)}}>
      <TouchableHighlight underlayColor="#f1f1f1" style={{borderColor:'grey',borderWidth:0.5, height:(frame.height / 20)}}
      onPress={() => {checkChanges().then((result) => {
        if (result == true) {this.props.dispatch(backAction)}})}}>
        <Text style={{fontSize:20,paddingBottom:(frame.height / 40)}}>Save Changes</Text>
      </TouchableHighlight> 
      </View>
    )
  }
}

export default class AccountContents extends Component {
    render() {
        return(
            <ScrollView keyboardShouldPersistTaps="never" scrollEnabled={false} 
              style={{flex:1,backgroundColor:"white"}}>
                <ImageContainer />
                <AccountDetails />
                <EditDetails dispatch={this.props.navigation.dispatch}/>
            </ScrollView>
        )
    }
}

function checkChanges() {
  return new Promise(function(resolve, reject) {
    if (AccountRequirements.NameValid == true) {
        var name = AccountRequirements.Name
        var desc = AccountRequirements.Desc
        functions.getFromAsyncStorage("@userID:key").then((UserID) => {
          var accountRef = firebaseApp.database().ref("UserID/"+ UserID)
          if (name !== "") {
            accountRef.update( {
              Name: name,
            });
          }
          if (desc !== "") {
            accountRef.update( {
              ProfDesc: desc
            });
          } 
          if (AccountRequirements.ProfileURI !== "") {
            uploadImage(UserID,'Profile',AccountRequirements.ProfileURI)
            functions.setItemAsyncStorage("@profileCache:key",AccountRequirements.ProfileURI)
          }
          if (AccountRequirements.BackgroundURI !== "") {
            uploadImage(UserID,'Background',AccountRequirements.BackgroundURI)
            functions.setItemAsyncStorage("@backgroundCache:key",AccountRequirements.BackgroundURI)
          }
          clearTimeout(timeOut)
          resolve(true)
        })
      } else {
        alert("You need a name")
      }
     var timeOut = setTimeout(function() {
      resolve(null)}, 10000)
  })
}

function uploadImage(userID, loc, uri, mime = 'application/octet-stream') {
   return new Promise((resolve, reject) => {
     const uploadUri =  Platform.OS === 'ios' ? uri.replace('file://', '') : uri
     let uploadBlob = null
     const imageRef = firebaseApp.storage().ref('Users/' + userID).child(loc)

     fs.readFile(uploadUri, 'base64')
       .then((data) => {
         return Blob.build(data, { type: `${mime};BASE64` })
       })
       .then((blob) => {
         uploadBlob = blob
         return imageRef.put(blob, { contentType: mime })
       })
       .then(() => {
         uploadBlob.close()
         return imageRef.getDownloadURL()
       })
       .then((url) => {
         resolve(url)
       })
       .catch((error) => {
         reject(error)
     })
   })
  }