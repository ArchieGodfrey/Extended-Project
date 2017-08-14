import functions from "/Users/archiegodfrey/Desktop/GitHub/Project/Functions.js"
import dismissKeyboard from 'dismissKeyboard'
import RNFetchBlob from 'react-native-fetch-blob'
import ImagePicker from 'react-native-image-crop-picker';

import { NavigationActions } from 'react-navigation'
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import React, { Component } from 'react';
import {
  Alert,Text,View,Animated,Easing,Modal,Image,ListView, ScrollView,TouchableHighlight,TouchableWithoutFeedback,Platform, TextInput,AsyncStorage,Dimensions,KeyboardAvoidingView
} from 'react-native';

var moment = require('moment');
var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const frame = Dimensions.get('window');
const backAction = NavigationActions.back({})

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const PostRequirements = {
  PictureValid:false,PictureURI:"",TitleValid:false,Title:"",
  DescValid:false,Desc:"",Day:"",Month:"",Year:"",Time:""
}

  
 class ImageContainer extends Component {
  constructor (props) {
     super(props);
     this.state = {
       imageSource:"null", 
     }
   }

   chooseImage() {
     ImagePicker.openPicker({
       width:(frame.width),
       height:(frame.height / 2),
       compressImageQuality:1,
     }).then(image => {
       alert(image.mime)
       PostRequirements.PictureValid = true
       PostRequirements.PictureURI = image.path
       this.setState({imageSource: image.path})
     });
   }
  
    render() {
      if (this.state.imageSource !== "null") {
        return(
         <TouchableHighlight onPress={() => this.chooseImage()} underlayColor="#f1f1f1">
           <Image 
             style={{resizeMode: 'cover', height: (frame.height / 2), width: (frame.width)}}
             source={{uri: this.state.imageSource}}/>
         </TouchableHighlight>
      )
      } else {
        return(
        <View style={{marginTop:(frame.height / 40), marginBottom:(frame.height / 40),
          alignItems:'center', borderColor:'grey',borderBottomWidth:1,}}>
         <TouchableHighlight onPress={() => this.chooseImage()} underlayColor="#f1f1f1">
            <Text style={{fontSize:20,marginBottom:(frame.height / 40)}}>Add an Image</Text>
          </TouchableHighlight>
        </View>
      )
      }
    }
  }
  
 class PostDetails extends Component {
   constructor (props) {
     super(props);
     this.state = {
       avatarSource:"/Users/archiegodfrey/Desktop/GitHub/Project/Images/greyBackground.png",
       title:"", 
     }
   }
 
   componentWillMount() {
     functions.getFromAsyncStorage("@userID:key").then((UserID) => {
       functions.getProfilePicture(UserID).then((URI) => {
         this.setState({avatarSource:URI})
       })
     })
   }

   checkTitle(title) {
     this.setState({title: title.replace(/\r?\n|\r/g,"")})
     temp = this.state.title.replace(/\s/g,'')
     if (temp.length > 0) {
      PostRequirements.TitleValid = true
      PostRequirements.Title = this.state.title
     } else {
       PostRequirements.TitleValid = false
     }
   }
 
   render() {
     return(
       <View style={{flexDirection:'row',marginLeft:(frame.width / 40),marginTop:(frame.width / 40)}} >
           <Image style={{resizeMode: 'cover', height: (frame.height / 10), 
              width: (frame.width / 6)}} source={{uri: this.state.avatarSource}} />
          <View style={{flexDirection:'column',marginTop:(frame.height / 80),marginLeft:(frame.height / 80)
            ,marginBottom:(frame.height / 160)}}> 
           <AutoGrowingTextInput style={{fontSize:22, height:(frame.height / 20)}} 
             placeholder={'Title'}
              maxHeight={frame.height / 10}
              minHeight={frame.height / 20}
              maxLength={40}
              value={this.state.title}
              onEndEditing={(event) => this.checkTitle(event.nativeEvent.text)}
              onChange={(event) => this.checkTitle(event.nativeEvent.text)}
              />
            <View style={{alignSelf:'flex-end',flexDirection:'row', marginTop: (frame.height / 80), 
              marginBottom: (frame.height / 40), marginRight:(frame.width / 10)}} >
              <Text style={{fontSize:16,color:'grey'}}>
               {moment().calendar()}
             </Text>
           </View>
         </View>
       </View>
     )
   }
  }
  
  class DescriptionContainer extends Component {
    constructor (props) {
     super(props);
     this.state = {
       desc:""
     }
   }
    checkDesc(desc) {
      this.setState({desc: desc.replace(/\r?\n|\r/g,"")})
      temp = this.state.desc.replace(/\s/g,'')
      if (temp.length > 0) {
        PostRequirements.DescValid = true
        PostRequirements.Desc = this.state.desc
      } else {
        PostRequirements.DescValid = false
      }
   }

    render() {
      return(
        <View style={{borderColor:'grey',borderBottomWidth:1,
        marginTop: (frame.height / 80), marginLeft:(frame.width / 10), marginRight:(frame.width / 10)}} >
         <AutoGrowingTextInput style={{fontSize:20, height:(frame.height / 20)}}
            placeholder={'Description'}
            maxHeight={frame.height / 5}
            minHeight={frame.height / 20}
            maxLength={325}
            value={this.state.desc}
            onChange={(event) => this.checkDesc(event.nativeEvent.text)}
            onEndEditing={(event) => this.checkDesc(event.nativeEvent.text)}
            />
        </View>
        
     )
   }
 }
        
  class Footer extends Component {
    constructor (props) {
      super(props);
      this.state = {
        day:"",
        month:"",
        year:"",
        time:"",
      }
    }

    checkDay(day) {
      this.setState({day: day})
      PostRequirements.Day = day
    }

    checkMonth(month) {
      this.setState({month: month})
      PostRequirements.Month = month
    }
  
   checkYear(year) {
     this.setState({year: year})
     PostRequirements.Year = year
     if (year.length === 4) {
       if (year < moment().format('YYYY')) {
         this.setState({year: ""})
         alert('Must expire in the future!') 
       } 
     }  
   } 
 
   checkTime(time) {
     this.setState({time: time})
     temp = time.replace(':','')
     PostRequirements.Time = temp
     if ((temp.length > 1) && (temp.length < 3)) {
       this.setState({time: temp.concat(':')})
     }   
  }
 
    render() {
      const {dispatch} = this.props;
      return(
       <View style={{alignSelf:'center', marginTop: (frame.height / 80),flexDirection:'column'}}>
         <Text style={{fontSize:12}}>Expiration Date</Text>
         <View style={{alignSelf:'center',flexDirection:'row'}}>
           <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 10), marginLeft:(frame.width / 40)}}
              placeholder={moment().format('DD')}
              keyboardType={"number-pad"}
              value={this.state.day}
              onChange={(event) => this.checkDay(event.nativeEvent.text)}
              maxLength={2}/>
           <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 10), marginLeft:(frame.width / 40)}}
              placeholder={moment().format('MM')}
              keyboardType={"number-pad"}
              value={this.state.month}
              onChange={(event) => this.checkMonth(event.nativeEvent.text)}
              maxLength={2}/>
           <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 6), marginLeft:(frame.width / 40)}}
              placeholder={moment().format('YYYY')}
              keyboardType={"number-pad"}
              value={this.state.year}
              onChange={(event) => this.checkYear(event.nativeEvent.text)}
              maxLength={4}/>
           <TextInput style={{fontSize:20, height:(frame.height / 20), width:(frame.width / 6), marginLeft:(frame.width / 40)}}
              placeholder={moment().format('HH:mm')}
              keyboardType={"number-pad"}
              value={this.state.time}
              onChange={(event) => this.checkTime(event.nativeEvent.text)}
              maxLength={5}/>
         </View>
         <TouchableHighlight underlayColor="#f1f1f1" onPress={() => {newPost().then((result) => 
           {if (result == true) {this.props.dispatch(backAction)}})}} 
           style={{alignSelf:'center',paddingTop:(frame.height / 40)}}>
           <Text style={{fontSize:20}}>Upload Post</Text>
         </TouchableHighlight>
        </View>
      )
    }
  }
  
  class NewPostTemplate extends Component {
    render() {
      const {dispatch} = this.props;
      return(
        <KeyboardAvoidingView  behavior='padding'>
          <ImageContainer />
          <PostDetails />
          <DescriptionContainer />    
          <Footer dispatch={this.props.dispatch}/>  
        </KeyboardAvoidingView>
      )
    } 
 }

 export default class NewPostContainer extends Component {
   render() {
      return(
          <ScrollView keyboardShouldPersistTaps="never">
            <NewPostTemplate dispatch={this.props.navigation.dispatch}/>
          </ScrollView>  
      )
   }
 }

function newPost () {
  return new Promise((resolve, reject) => {
  if (checkRequirements() == true) {
    var timeKey = moment().format('YYYYMMDDHHmmss')
    var expirationDate = (PostRequirements.Year +
      PostRequirements.Month + PostRequirements.Day + PostRequirements.Time)
    var title = PostRequirements.Title
    var desc = PostRequirements.Desc
    functions.getFromAsyncStorage("@userID:key").then((UserID) => {
      var postsRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts")
      postsRef.child(timeKey).update({
        title: title,
        desc: desc,
        expiration: expirationDate,
      });
      if (PostRequirements.PictureURI !== "") {
        uploadImage(UserID, timeKey, PostRequirements.PictureURI)
      }
      PostRequirements = {
        PictureValid:false,PictureURI:"",TitleValid:false,Title:"",
        DescValid:false,Desc:"",Day:"",Month:"",Year:"",Time:""
      }
      clearTimeout(timeOut)
      resolve(true)
    })  
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

function checkRequirements() {
  if (PostRequirements.TitleValid == true) {
    if (PostRequirements.PictureValid == true) {//Desc not needed
      if ((PostRequirements.Day == "") && (PostRequirements.Month == "") 
        && (PostRequirements.Year == "") && (PostRequirements.Time == "")) {//No expiration date given
          PostRequirements.Day = "NEVER"
          return true
      } else {
        if (checkAllDates() == true) {
          return true
        } else {
          alert("There's something wrong with the expiration date")
          return false
        }
      }
    } else if (PostRequirements.DescValid == true) {//Picture not needed
      if ((PostRequirements.Day == "") && (PostRequirements.Month == "") 
        && (PostRequirements.Year == "") && (PostRequirements.Time == "")) {//No expiration date given
          PostRequirements.Day = "NEVER"
          return true
      } else {
        if (checkAllDates() == true) {
          return true
        } else {
          alert("There's something wrong with the expiration date")
          return false
        }
      }
    } else {
      alert('Must have a picture or a description at least')
    }
  } else {
    alert('Missing a title')
  }
}

function checkAllDates() {
  if (PostRequirements.Year !== "") {
    if (PostRequirements.Month !== "") {
      if (PostRequirements.Day !== "") {
        if (PostRequirements.Time !== "") {//if there
          if (checkGroupDate() == "FUTURE") {//In the future
            if (moment(PostRequirements.Time, "HHmm",true).isValid() == true) {
              return true//Valid time
            }
          } else if (checkGroupDate() == "CURRENT") {//Today
            if (PostRequirements.Time > moment().format("HHmm")) {//Check it's a future time
              if (moment(PostRequirements.Time, "HHmm",true).isValid() == true) {
                return true//Valid time
              }
            } else {
              return false//Invalid time
            }
          }   
        }
      }
    }
  }
}

function checkGroupDate() {
  if (checkDate(PostRequirements.Year,'YYYY') == "FUTURE") {//in a future year
    if (checkDate(PostRequirements.Month,'MM') !== "INVALID") {
      if (checkDate(PostRequirements.Day,'DD') !== "INVALID") {
        return "FUTURE"
      }
    }
  } else if (checkDate(PostRequirements.Year,'YYYY') == "CURRENT") {//if this year
    if (checkDate(PostRequirements.Month,'MM') == "FUTURE") {//in a future month
      if (checkDate(PostRequirements.Day,'DD') !== "INVALID") {
        return "FUTURE"
      }
    } else if (checkDate(PostRequirements.Month,'MM') == "CURRENT") {//if this month
      if (checkDate(PostRequirements.Day,'DD') == "FUTURE") {//on a future day
        return "FUTURE" 
      } else if (checkDate(PostRequirements.Day,'DD') == "CURRENT") {//today
        return "CURRENT"
      }
    }
  }
} 

function checkDate(data,format) {
  if (moment(data, format,true).isValid() == true) {
    if (data < moment().format(format)) { //If earlier 
      return "PAST"
    } else 
    if (data == moment().format(format)) {//If current
      return "CURRENT"
    } else 
    if (data > moment().format(format)) {//If future
      return 'FUTURE'
    }
  } else {
    return 'INVALID'
  }
}

