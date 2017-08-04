import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions"
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage");

const frame = Dimensions.get('window');

class ImageContainer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      imageSource:null,
      lastPress:0, 
    }
  }

  onPhotoPress(USERID,DATE) {
    var delta = new Date().getTime() - this.state.lastPress;

    if  (delta < 200) {
      // double tap happend
      likePost(USERID,DATE)
    }

    this.setState({
      lastPress: new Date().getTime()
    })
  }

  componentWillMount() {
    const { USERID,DATE } = this.props;
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
    if (this.state.imageSource !== null) {
      return(
        <TouchableHighlight underlayColor="#F1F1F1" 
          onPress={() => this.onPhotoPress(this.props.USERID,this.props.DATE)}>
          <Image 
            style={{resizeMode: 'cover', height: (frame.height / 2), width: (frame.width)}}
            source={{uri: this.state.imageSource}}/>
        </TouchableHighlight>
    )
    } else {
      return(
      <View style={{marginBottom:(frame.height / 40),borderColor:'grey',borderBottomWidth:1,}}></View>
    )
    }
    
  }
}

class PostDetails extends Component {
  constructor (props) {
    super(props);
    this.state = {
      avatarSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/greyBackground.png", 
    }
  }

  componentWillMount() {
    const { USERID,DATE,TITLE,LIKES  } = this.props;
    functions.getProfilePicture(this.props.USERID).then((URI) => {
      this.setState({avatarSource:URI})
    })
  }

  componentWillReceiveProps(nextProps) {
    functions.getProfilePicture(nextProps.USERID).then((URI) => {
      if (this.state.avatarSource !== URI) {
        this.setState({avatarSource:URI})
      }
    })
  }

  transition(location) {
    this.props.navigate('UserDetail', { USERID:  this.props.USERID })
  }

  postOptionsPressed() {
    functions.getFromAsyncStorage("@userID:key").then((ID) => {
      if (ID == this.props.USERID) {
        Alert.alert(
          'Post Options',
          "Are you sure you would like to delete this post?",
          [
            {text: 'Delete', onPress: () => {
              var postsRef = firebaseApp.database().ref("UserID/"+ ID + "/posts")
              postsRef.child(this.props.DATE).remove()
            }},
            {text: 'Cancel', style: 'cancel'},
          ],
            { cancelable: true }
        ) 
      } else {
        Alert.alert(
        'Post Options',
        "Whats wrong with this post?",
        [
          {text: 'Report', onPress: () => {
            /*
            var postsRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/posts")
            postsRef.child(postDate).remove()
            resolve()*/
          }},
          {text: 'Cancel', style: 'cancel'},
        ],
        { cancelable: true }
      )
      }
    })
  }

  render() {
    return(
      <View style={{flexDirection:'row', flexWrap: 'wrap',marginLeft:(frame.width / 40),marginTop:(frame.width / 40), paddingRight:(frame.width / 40)}} >
        <TouchableHighlight underlayColor="#F1F1F1"  onPress={() => {if (this.props.DATE !== null) {this.transition("UserDetail")}}}>
          <Image style={{resizeMode: 'cover', height: (frame.height / 10), 
            width: (frame.width / 6)}} source={{uri: this.state.avatarSource}} />
        </TouchableHighlight>
        
        <View style={{flexDirection:'column',marginTop:(frame.height / 80),marginLeft:(frame.height / 80)
          ,marginBottom:(frame.height / 160)}}> 
          <Text style={{fontSize:22,width:(frame.width / 2)}}>
            {this.props.TITLE}
          </Text>
          <View style={{alignSelf:'flex-end',flexDirection:'row', marginTop: (frame.height / 80), 
            marginBottom: (frame.height / 40), marginRight:(frame.width / 10)}} >
            <Text style={{fontSize:16,color:'grey'}}>
              {moment(this.props.DATE, "YYYYMMDDHHmmss").format('MMMM Do YYYY, HH:mm')}
            </Text>
          </View>
        </View>
        <View style={{flexDirection:"column", alignItems:'center',paddingLeft:(frame.height / 40)}}>
          <LikeComponent USERID={this.props.USERID} DATE={this.props.DATE} />
           <TouchableHighlight underlayColor="#F1F1F1"  onPress={() => this.postOptionsPressed()}>
            <Image style={{resizeMode: 'contain', height: (frame.height / 24), 
              width: (frame.width / 6),marginTop:(frame.height / 80)}} 
              source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/OptionsIcon.png')} />
          </TouchableHighlight>
        </View>
      </View>
      
    )
  }
}

class DescriptionContainer extends Component {
  constructor (props) {
    super(props);
  }

  componentWillMount() {
    const { USERID,DESC } = this.props;
  }

  render() {
    return(
      <View style={{borderColor:'grey',borderBottomWidth:1,
      marginTop: (frame.height / 80), marginLeft:(frame.width / 10), marginRight:(frame.width / 10)}} >
        <Text style={{fontSize:20,marginBottom: (frame.height / 40)}}>
          {this.props.DESC}
        </Text>
      </View>
      
    )
  }
}

class Footer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      expirationDate:null, 
    }
  }

  componentWillMount() {
    const { USERID,DATE } = this.props;
    functions.getExpiration(USERID,DATE).then((data) => {
      if (data !== "NEVER") {
        this.setState({expirationDate:data})
      }
    })
  }

  render() {
    if (this.state.expirationDate !== null) {
      return(
      <View style={{marginTop: (frame.height / 40), alignSelf:'center',flexDirection:'row'}}>
        <Text style={{paddingRight:(frame.width / 20),fontSize:18,color:'black'}}>2 Comments</Text>
        <View style={{flexDirection:'row',marginBottom: (frame.height / 40)}} >
        <Image
          style={{resizeMode: 'cover', height: (frame.height / 34), width:(frame.width / 18)}} 
          source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/ClockIcon.png')}/>
        <Text style={{paddingLeft:(frame.width / 80),fontSize:16,color:'grey'}}>
          {moment(this.state.expirationDate, "YYYYMMDDHHmm").format('MMMM Do YYYY, HH:mm')}
        </Text>
        </View>
      </View>
    )
    } else {
      return(
      <View style={{marginTop: (frame.height / 40), alignSelf:'center',flexDirection:'row'}}>
        <Text style={{paddingRight:(frame.width / 20),fontSize:18,color:'black'}}>2 Comments</Text>
      </View>
    )
    }
    
  }
}

class LikeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      likeCount:"", 
    }
    this.likeValue = new Animated.Value(0)
  }

    updateImage(USERID,DATE) {
    checkIfLiked(USERID,DATE ).then((value) => {
      if (value == true) {
        Animated.timing(
          this.likeValue,
          {
            toValue: 1,
            duration: 250,
            easing: Easing.linear
          }).start()
      } else if (value == false) {
        Animated.timing(
          this.likeValue,
          {
            toValue: 0,
            duration: 350,
            easing: Easing.linear
          }).start()
      }
    })
  }

  componentWillMount() {
    const { USERID,DATE  } = this.props;
    this.updateImage(this.props.USERID,this.props.DATE)
    var likesRef = firebaseApp.database().ref("UserID/"+ this.props.USERID + "/posts/" + this.props.DATE).child("likedBy")
    likesRef.on("value", (snapshot) => {
      if (snapshot.numChildren() !== 0) {
        this.setState({likeCount: snapshot.numChildren()})
      } else {
        this.setState({likeCount: ""})
      }
      this.updateImage(this.props.USERID,this.props.DATE)
    })
  }

  componentWillUnmount() {
    var likesRef = firebaseApp.database().ref("UserID/"+ this.props.USERID + "/posts/" + this.props.DATE).child("likedBy")
    likesRef.off()
  }

  render() {
    return (
      <TouchableHighlight underlayColor="#F1F1F1"  
        onPress={() => likePost(this.props.USERID,this.props.DATE)}> 
        <View style={{alignItems:'center'}}>
          <Animated.Image style={{opacity: this.likeValue,
            resizeMode: 'contain', height: (frame.height / 20), width: (frame.width / 6)}}
            source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/LikedIcon.png')}/>
          <Animated.Image style={{opacity: 1 / this.likeValue, position:'absolute',
            resizeMode: 'contain', height: (frame.height / 20), width: (frame.width / 6)}}
            source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/LikeIcon.png')}/>
          <Text style={{fontSize:18,paddingTop:(frame.height / 160)}}>{this.state.likeCount}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}



export default class PostTemplate extends Component {
  componentWillMount() {
    const { USERID,DATE,TITLE,DESC,LIKES,navigate} = this.props;
    
  }

  render() {
    return(
      <View style={{flex:1,backgroundColor:'white', paddingBottom:(frame.height / 40)}}>
        <ImageContainer USERID={this.props.USERID} DATE={this.props.DATE}/>
        <PostDetails navigate={this.props.navigate}
          USERID={this.props.USERID} DATE={this.props.DATE} TITLE={this.props.TITLE} />
        <DescriptionContainer DESC={this.props.DESC}/>    
        <Footer USERID={this.props.USERID} DATE={this.props.DATE}/>  
      </View>
    )
  }
}

async function checkIfLiked(UserID, postDate) {
  return new Promise(function(resolve, reject) {
    var liked = false;
    var increment = 0;
    functions.getFromAsyncStorage("@userID:key").then((ID) => {
      var checkRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts/" + postDate + "/title")
      checkRef.once("value")
      .then(function(snapshotCheck) {
        if (snapshotCheck.val() !== null) {
          var likesRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts/" + postDate + "/likedBy/")
          likesRef.once("value")
          .then(function(snapshot) {
            if (snapshot.val() !== null) {
              snapshot.forEach(function(childSnapshot) {
              if (childSnapshot.key == ID) {
                liked = true
              }
              increment = increment + 1;
              if (increment == snapshot.numChildren()) {
                clearTimeout(timeOut)
                resolve(liked)
              }
            })
            } else {
              clearTimeout(timeOut)
              resolve(false)
            }
          })
        } else {
          clearTimeout(timeOut)
          resolve(null)
        }
      })
      var timeOut = setTimeout(function() {
      resolve(null)}, 10000)
    })
    })
  }

function likePost(UserID, postDate) {
  var likesRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts/" + postDate + "/likedBy")
  checkIfLiked(UserID, postDate).then((result) => {
    if (result == false) {
      functions.getFromAsyncStorage("@userID:key").then((ID) => {
        likesRef.child(ID).set({
          user: ID,
        });
      })
    } else {
      functions.getFromAsyncStorage("@userID:key").then((ID) => {
        likesRef.child(ID).remove()
      })
    }
  })
}
