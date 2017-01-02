import actions from "ExtendedProject/Actions"
import PostContents from 'ExtendedProject/postContents'
import dismissKeyboard from 'dismissKeyboard'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,Navigator,ListView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions
} from 'react-native';
var moment = require('moment');
import * as firebase from 'firebase';
// Initialize Firebase
var config = {
   apiKey: "AIzaSyAuC_xqXKk99bTeaCluuoJhqNfJFQNlv1E",
   authDomain: "epproject-a2ea7.firebaseapp.com",
   databaseURL: "https://epproject-a2ea7.firebaseio.com",
   storageBucket: "epproject-a2ea7.appspot.com",
   messagingSenderId: "638364827583"
};
firebase.initializeApp(config);

const FirebaseURL = 'https://epproject-a2ea7.firebaseio.com';
const window = Dimensions.get('window');

class ExtendedProject extends Component {
  constructor (props) {
    super(props);
    this.database = firebase.database();
    //this.firebase = new Firebase(FirebaseURL);
    this.state = {
    modalVisible: false,
    textEntered: false,
    otherUserID: "",
    otherUsername: "",
    otherName: "",
    otherPassword: "",
    UserID: "",
    Username: "",
    name: "",
    password: "",
    postTitle: "",
    postDesc: "",
    postImage: "",
    postDate: "",
    postLikes: 0,
    liked: false,
    }
    this.clearText = this.clearText.bind(this);
    this.postIndex = 0
    this.newPostValue = new Animated.Value(500)
    this.previousValue = new Animated.Value(500)
    this.spinValue = new Animated.Value(0)
    this.crossValue = new Animated.Value(0)
    this.moveYValue = new Animated.Value(-210)
    this.feedValue = new Animated.Value(0)
    this.accountValue = new Animated.Value(-500)
    otherAccountValue = new Animated.Value(-500)
    this.settingsValue = new Animated.Value(-500)
  }

  clearText() {
   this._titleInput.setNativeProps({text: ''});
   this._descInput.setNativeProps({text: ''});
   dismissKeyboard();
 }

  tryLogin() {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
        this.setState({UserID: value});
      });
      AsyncStorage.getItem('@name:key').then((value) => {
        this.setState({name: value});
      });
      AsyncStorage.getItem('@username:key').then((value) => {
       this.setState({Username: value});
       if (this.state.Username !== null){
         // We have data!!
         actions.goodLogin()
         AsyncStorage.getItem('@password:key').then((value) => {
          this.setState({password: value});
          //alert(this.state.UserID)
          actions.setUserInfo(this.state.Username, this.state.password,this.state.UserID)
          firebase.auth().signInWithEmailAndPassword(this.state.Username, this.state.password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            this.logOut()
          });
        });
        } else {
         this.logOut()
        }
      });
     } catch (error) {
       // Error retrieving data
       this.logOut()
     }

  this.setState({Username: actions.Username});
  this.setState({UserID: actions.UserID});
  this.setState({password: actions.password});
  this.setState({modalVisible: actions.visible})
  }
  createUser () {
    let {
        Username, password, name
      } = this.state;
      firebase.auth().createUserWithEmailAndPassword(Username, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage)
      });
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          var user = firebase.auth().currentUser;
          var userRef = firebase.database().ref("UserID/" + user.uid)
          userRef.set( {
            User: user.uid,
            Name: name,
            Email: Username
          });
          try {
           AsyncStorage.setItem('@userID:key', user.uid);
          } catch (error) {
            // Error saving data
            alert('error saving username')
          }
          try {
           AsyncStorage.setItem('@name:key', name);
          } catch (error) {
            // Error saving data
            alert('error saving username')
          }
          try {
           AsyncStorage.setItem('@username:key', Username);
          } catch (error) {
            // Error saving data
            alert('error saving username')
          }
          try {
           AsyncStorage.setItem('@password:key', password);
          } catch (error) {
            // Error saving data
            alert('error saving password')
          }
        }
      })

      this.moveRight()
  }
  login () {
    let {
        Username, password
      } = this.state;

    firebase.auth().signInWithEmailAndPassword(Username, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    });

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var user = firebase.auth().currentUser;
        try {
         AsyncStorage.setItem('@userID:key', user.uid);
        } catch (error) {
          // Error saving data
          alert('error saving username')
        }
        try {
         AsyncStorage.setItem('@username:key', Username);
        } catch (error) {
          // Error saving data
          alert('error saving username')
        }
        try {
         AsyncStorage.setItem('@password:key', password);
        } catch (error) {
          // Error saving data
          alert('error saving password')
        }
      } else {
        // No user is signed in.
      }
    });
    try {
    AsyncStorage.getItem('@userID:key').then((value) => {
             this.setState({UserID: value});
             });;
    AsyncStorage.getItem('@userID:key').then((value) => {
             this.setState({Username: value});
        });;
    AsyncStorage.getItem('@password:key').then((value) => {
             this.setState({password: value});
             });;
    if (this.state.Username !== ""){
      // We have data!!
      actions.goodLogin()
      firebase.auth().signInWithEmailAndPassword(this.state.Username, this.state.password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        this.logOut()
        alert('There was a problem logging in')
      });
    }
  } catch (error) {
    // Error retrieving data
    alert("error")
    this.logOut()
  }
    this.setState({modalVisible: actions.visible})
  }

  logOut() {
    var user = firebase.auth().currentUser;
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      AsyncStorage.setItem('@userID:key', "");
      AsyncStorage.setItem('@name:key', "");
      AsyncStorage.setItem('@username:key', "");
      AsyncStorage.setItem('@password:key', "");
    }, function(error) {
      // An error happened.
      alert('There was a problem signing out');
    });
    this.setState({modalVisible: true})
  }

  newPost () {
    var timeKey = moment().format('MMDDYYYYhmmss')
    var postTitle = this.state.postTitle
    var postDesc = this.state.postDesc
    var newPostKey = firebase.database().ref("UserID/"+ this.state.UserID).child('posts').push().key;
    var postsRef = firebase.database().ref("UserID/"+ this.state.UserID + "/posts")
    postsRef.child(timeKey).update( {
      title: postTitle,
      desc: postDesc
    });
    this.clearText()
    this.rotateCross()
  }

  previousPost() {
    var postIndex = this.postIndex
    this.postIndex = this.postIndex + 1
    actions.postList.map(function(item, i) {
      if (i == postIndex) {
        actions.UserID = item.USERID
        actions.postTitle = item.TITLE
        actions.postDate = item.DATE
        actions.postDesc = item.DESC
        actions.postLikes = item.LIKES
      }
    })
    this.setState({postTitle: actions.postTitle})
    this.setState({otherUserID: actions.UserID})
    this.setState({postDate: moment(actions.date, "MMDDYYYYhmmss").format('MMMM Do, h:mm')})
    this.setState({postDesc: actions.postDesc})
    this.setState({postLikes: actions.postLikes})
    }

  nextPost () {
    var postIndex = this.postIndex
    this.postIndex = this.postIndex - 1
    actions.postList.map(function(item, i) {
      if (i == postIndex) {
        actions.UserID = item.USERID
        actions.postTitle = item.TITLE
        actions.postDate = item.DATE
        actions.postDesc = item.DESC
        actions.postLikes = item.LIKES
      }
    })
    this.setState({postTitle: actions.postTitle})
    this.setState({postDate: moment(actions.date, "MMDDYYYYhmmss").format('MMMM Do, h:mm')})
    this.setState({postDesc: actions.postDesc})
    this.setState({postLikes: actions.postLikes})
  }

  getPosts () {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       this.setState({UserID: value});
       if (this.state.UserID !== "") {
         var query = firebase.database().ref("UserID/" + this.state.UserID + "/following").orderByKey();
         query.once("value")
           .then(function(snapshot) {
             snapshot.forEach(function(childSnapshot) {
               // key will be "ada" the first time and "alan" the second time
               var key = childSnapshot.key;
               // childData will be the actual contents of the child
               var followedUserID = childSnapshot.val();
               var newRef = firebase.database().ref("UserID/" + childSnapshot.val() + "/posts")
               newRef.once("value")
                 .then(function(newSnapshot) {
                   newSnapshot.forEach(function(newChildSnapshot) {
                     actions.date = newChildSnapshot.key;
                     var postTitleRef = firebase.database().ref("UserID/" + childSnapshot.val() + "/posts/" + newChildSnapshot.key + "/title")
                     postTitleRef.on('value', (titleSnapshot) => {
                       actions.postTitle = titleSnapshot.val()
                     })
                     var postDescRef = firebase.database().ref("UserID/" + childSnapshot.val() + "/posts/" + newChildSnapshot.key + "/desc")
                     postDescRef.on('value', (descSnapshot) => {
                       actions.postDesc = descSnapshot.val()
                     })
                     var postLikesRef = firebase.database().ref("UserID/" + childSnapshot.val() + "/posts/" + newChildSnapshot.key + "/likes")
                     postLikesRef.on('value', (likesSnapshot) => {
                       actions.postLikes = likesSnapshot.val()
                       actions.loadPost(actions.postTitle,actions.postDesc,actions.date,actions.postLikes,childSnapshot.key)
                     })
                   })
                 })
               })
             });
           } else {
             alert("There was a problem getting posts")
             this.logOut()
             this.setState(modalVisible: actions.visible)
           }
         });;
    } catch (error) {
      // Error retrieving data
      alert("There was a problem getting posts")
      this.logOut()
      this.setState(modalVisible: actions.visible)
    }
  }

  editProfile() {
    
  }

  likePost() {
    let {
      otherUserID,postDate,UserID
    } = this.state
    var likesRef = firebase.database().ref("UserID/"+ otherUserID + "/posts/" + moment(postDate, "MMMM Do, h:mm").format('MMDDYYYYhmmss') + "/likedBy/")
    likesRef.once("value")
      .then(function(snapshot) {
        if (snapshot.val() !== null) {
          snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.key !== UserID) {
              alert("liked")
              var postsRef = firebase.database().ref("UserID/"+ otherUserID + "/posts/" + moment(postDate, "MMMM Do, h:mm").format('MMDDYYYYhmmss'))
              postsRef.child("likes").on('value', (likesSnapshot) => {
                actions.postLikes = likesSnapshot.val()
                actions.postLikes = actions.postLikes + 1
              })
              postsRef.update( {
                likes: actions.postLikes,
              });
              postsRef.child('likedBy/' + UserID).update({
                User: UserID
              })
            }
          })
        } else {
          actions.postLikes = 1
          var postsRef = firebase.database().ref("UserID/"+ otherUserID + "/posts/" + moment(postDate, "MMMM Do, h:mm").format('MMDDYYYYhmmss'))
          postsRef.update( {
            likes: 1
          });
          postsRef.child('likedBy/' + UserID).update({
            User: UserID
          })
        }
    })
    this.setState({postLikes: actions.postLikes})
  }

  render() {
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg','90deg']
  })
    const cross = this.crossValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg','45deg']
  })
    return (

<View>
  <Modal
      animationType={"slide"} transparent={false} visible={this.state.modalVisible}>
      <View>
        <Text style={{position: 'absolute', top: 25, left: 130, fontSize: 50}}>Login</Text>
        <TextInput
        style={{position: 'absolute', top: 150, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
        placeholder={' Enter email address'}
        onChange={(event) => this.setState({Username: event.nativeEvent.text})}
        autoCapitalize={'none'}
        />
        <TextInput
          style={{position: 'absolute', top: 200, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
          placeholder={' Enter password'}
          secureTextEntry={true}
          onChange={(event) => this.setState({password: event.nativeEvent.text})}
          />
        <TouchableHighlight onPress={this.login.bind(this)} style={{position: 'absolute', top: 260, left: 100}} underlayColor="#f1f1f1">
          <Text style={{fontSize: 20}}>Login</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this.moveLeft.bind(this)} style={{position: 'absolute', top: 300, left: 100}} underlayColor="#f1f1f1">
          <Text style={{fontSize: 20}}>Create Account</Text>
        </TouchableHighlight>
      </View>


      <Animated.View style={{flex:1,backgroundColor:"white", opacity:1, transform: [{translateX: this.previousValue}]}}>
        <Text style={{position: 'absolute', top: 25, left: 50, fontSize: 50}}>Create Account</Text>
          <TextInput
          style={{position: 'absolute', top: 150, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
          placeholder={' Enter your name'}
          onChange={(event) => this.setState({name: event.nativeEvent.text})}
          />
        <TextInput
        style={{position: 'absolute', top: 200, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
        placeholder={' Enter email address'}
        onChange={(event) => this.setState({Username: event.nativeEvent.text})}
        autoCapitalize={'none'}
        />
        <TextInput
          style={{position: 'absolute', top: 250, left: 100, height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
          placeholder={' Enter password'}
          secureTextEntry={true}
          onChange={(event) => this.setState({password: event.nativeEvent.text})}
          />
        <TouchableHighlight onPress={this.createUser.bind(this)} style={{position: 'absolute', top: 310, left: 100}} underlayColor="#f1f1f1">
          <Text style={{fontSize: 20}}>Create Account</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this.moveRight.bind(this)} style={{position: 'absolute', top: 350, left: 100}} underlayColor="#f1f1f1">
          <Text style={{fontSize: 20}}>Back</Text>
        </TouchableHighlight>
      </Animated.View>
    </Modal>

      <View style={styles.navBar}>
        <TouchableHighlight
          onPress={this.menuFunc.bind(this)}
          style={{width: 40,height: 30 }}
          underlayColor="#f1f1f1">
          <Animated.Image
           style={{position: 'absolute',top: 8, height:25, width:25,left: 2,transform: [{rotate: spin}]}}
        source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/MenuIcon.png')}/>
        </TouchableHighlight>
        <Text style={styles.titleStyle}>
            Tell-Tale
        </Text>
        <TouchableHighlight
          onPress={this.rotateCross.bind(this)}
          style={{width: 40,height: 30 }}
          underlayColor="#f1f1f1"
          style={{position: 'absolute',top: 28, height:25, width:25, left: 325}}>
          <Animated.Image
           style={{position: 'absolute',top: 0, height:25, width:25, left: 0, transform: [{rotate: cross}]}}
        source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/PlusIcon.png')}/>
        </TouchableHighlight>
      </View>


      <TouchableHighlight
        onPress={this.accountFunc.bind(this)} style={{padding: 10 }} underlayColor="#f1f1f1">
        <Animated.Text style={styles.row}> Account </Animated.Text>
      </TouchableHighlight>

      <TouchableHighlight
        onPress={this.feedFunc.bind(this)} style={{padding: 10 }} underlayColor="#f1f1f1">
        <Animated.Text style={styles.row}> Home </Animated.Text>
      </TouchableHighlight>

      <TouchableHighlight
        onPress={this.settingsFunc.bind(this)} style={{padding: 10 }} underlayColor="#f1f1f1">
        <Animated.Text style={styles.row}> Settings </Animated.Text>
      </TouchableHighlight>


      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, transform: [{ translateY: this.moveYValue}, {translateX: this.feedValue}] }}>
        <View style={styles.Imagecontainer}>
          <Image
            style={styles.postImage} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/luggageCase.jpg')}/>
        </View>
        <View style={styles.userContainer}>
          <Image
            style={styles.profileIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/Avatar2.png')}/>
          <Text style={styles.userName}>{this.state.postTitle}</Text>
            <Image
              style={styles.ClockIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/ClockIcon.png')}/>
            <Text style={styles.dateStyle}>{this.state.postDate}</Text>
            <Image
              style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/LikeIcon.png')}/>
            <Text style={styles.likeNumber}>{this.state.postLikes}</Text>
          <Text style={styles.postDesc}>{this.state.postDesc}</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableHighlight onPress={this.likePost.bind(this)} underlayColor="#f1f1f1">
            <Image
              style={styles.LikeButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/LikeButton.png')}/>
          </TouchableHighlight>
          <Image
            style={styles.CommentButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/CommentIcon.png')}/>
          <Image
            style={styles.OptionsButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/OptionsIcon.png')}/>
        </View>
        <TouchableHighlight onPress={this.previousPost.bind(this)} style={{position: 'absolute', top: 535, right: 50,padding:25}} underlayColor="#f1f1f1">
          <Text style={{fontSize: 20}}>Previous</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this.nextPost.bind(this)} style={{position: 'absolute', top: 535, left: 50,padding:25}} underlayColor="#f1f1f1">
          <Text style={{fontSize: 20}}>Next</Text>
        </TouchableHighlight>
        <Image
          style={styles.PageTurn} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/PageTurn.png')}/>
      </Animated.View>

      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 275,  backgroundColor: "white",transform: [{ translateY: this.moveYValue}, {translateX: this.previousValue}]}}>
        <Text style={{position: 'absolute', top: 10, left: 100, fontSize: 25}}>Create a new post</Text>
        <TextInput
        style={{position: 'absolute', top: 50, left: 40, height: 40, width: 300, borderColor: 'gray', borderWidth: 1}}
        placeholder={' Enter Post Title'}
        onChange={(event) => this.setState({postTitle: event.nativeEvent.text})}
        ref={component => this._titleInput = component}
        />
        <TextInput
        style={{position: 'absolute', top: 95, left: 40, height: 80, width: 300, borderColor: 'gray', borderWidth: 1}}
        placeholder={' Enter Post description'}
        multiline={true}
        onChange={(event) => this.setState({postDesc: event.nativeEvent.text})}
        ref={component => this._descInput = component}
        />
      <TouchableHighlight onPress={this.newPost.bind(this)} style={{position: 'absolute', top: 155, left: 130, padding:25}} underlayColor="#f1f1f1">
          <Text style={{fontSize: 20}}>Upload</Text>
        </TouchableHighlight>
      </Animated.View>


      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 275,  backgroundColor: "white", flex:1, backgroundColor: '#FFFFFF', transform: [{ translateY: this.moveYValue}, {translateX: this.accountValue}] }}>
          <Image
            style={{position: 'absolute', top: 25, left: 25, height: 56, width: 51}} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/Avatar2.png')}/>
          <Text style={{position: 'absolute', top: 25, left: 100, fontSize: 20}}>NAME: {this.state.name}</Text>
          <Text style={{position: 'absolute', top: 60, left: 100, fontSize: 20}}>EMAIL: {this.state.Username}</Text>
          <Text style={{position: 'absolute', top: 100, left: 25, fontSize: 20}}>User profile info would go here</Text>
          <TouchableHighlight onPress={this.editProfile.bind(this)} style={{transform: [{ translateY: this.moveYValue}, {translateX: this.accountValue}]}} underlayColor="#f1f1f1">
            <Image
              style={styles.PageTurn} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/EditIcon.png')}/>
          </TouchableHighlight>
      </Animated.View>


      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 275,  backgroundColor: "white", flex:1, flexDirection: 'column', backgroundColor: '#FFFFFF', transform: [{ translateY: this.moveYValue}, {translateX: this.settingsValue}] }}>
          <Text style={{position: 'absolute', top: 25, left: 130, fontSize: 20}}>Settings</Text>
          <TouchableHighlight onPress={this.logOut.bind(this)} style={{position: 'absolute', top: 75, left: 130}} underlayColor="#f1f1f1">
            <Text style={{fontSize: 20}}>Log Out</Text>
          </TouchableHighlight>
      </Animated.View>

      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 275,  backgroundColor: "white", flex:1, backgroundColor: '#FFFFFF', transform: [{ translateY: this.moveYValue}, {translateX: this.otherAccountValue}] }}>
          <Image
            style={{position: 'absolute', top: 25, left: 25, height: 56, width: 51}} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/Avatar2.png')}/>
          <Text style={{position: 'absolute', top: 25, left: 100, fontSize: 20}}>NAME: {this.state.name}</Text>
          <Text style={{position: 'absolute', top: 60, left: 100, fontSize: 20}}>EMAIL: {this.state.Username}</Text>
          <TouchableHighlight onPress={this.logOut.bind(this)} style={{position: 'absolute', top: 200, left: 130}} underlayColor="#f1f1f1">
            <Text style={{fontSize: 20}}>Log Out</Text>
          </TouchableHighlight>
      </Animated.View>
    </View>
  )};

  componentWillMount () {
    this.tryLogin()
  }
  componentDidMount () {
    this.getPosts()
  }

rotateCross () {
  if (actions.crossSpun == false) {
    actions.alternateSpin(0)
    Animated.parallel([
      Animated.timing(
        this.crossValue,
        {
          toValue: 1,
          duration: 550,
          easing: Easing.linear
        }),
      Animated.timing(
        this.previousValue,
        {
          toValue: 0,
          duration: 550,
          easing: Easing.linear
        }),
      Animated.timing(
        this.feedValue,
        {
          toValue: -500,
          duration: 550,
          easing: Easing.linear
        })
    ]).start()
  } else {
    actions.alternateSpin(0)
    Animated.parallel([
      Animated.timing(
        this.crossValue,
        {
          toValue: 0,
          duration: 550,
          easing: Easing.linear
        }),
      Animated.timing(
        this.previousValue,
        {
          toValue: 500,
          duration: 550,
          easing: Easing.linear
        }),
      Animated.timing(
        this.feedValue,
        {
          toValue: 0,
          duration: 550,
          easing: Easing.linear
        })
    ]).start()
  }
}

moveLeft () {
  //alert("Left")
  Animated.parallel([
    Animated.timing(
      this.previousValue,
      {
        toValue: 0,
        duration: 550,
        easing: Easing.linear
      }),
    Animated.timing(
      this.feedValue,
      {
        toValue: -500,
        duration: 550,
        easing: Easing.linear
      })
  ]).start()
};
moveRight () {
  Animated.sequence([
    Animated.timing(
      this.previousValue,
      {
        toValue: 500,
        duration: 550,
        easing: Easing.linear
      }
    )
  ]).start()
};
menuFunc () {
  if (actions.spun == false) {
    actions.alternateSpin(1)
    Animated.sequence([
      Animated.timing(
        this.spinValue,
        {
          toValue: 1,
          duration: 400,
          easing: Easing.linear
        }
      ),
      Animated.timing(
        this.moveYValue,
        {
          toValue: 200,
          duration: 550,
          easing: Easing.linear
        }
      )
    ]).start()
  } else {
    actions.alternateSpin(1)
    Animated.sequence([
      Animated.timing(
        this.spinValue,
        {
          toValue: 0,
          duration: 400,
          easing: Easing.linear
        }
      ),
      Animated.timing(
        this.moveYValue,
        {
          toValue: -210,
          duration: 550,
          easing: Easing.linear
        }
      )
    ]).start()
  }

};
accountFunc () {
  Animated.parallel([
    Animated.timing(
      this.feedValue,
      {
        toValue: 500,
        duration: 500,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.settingsValue,
      {
        toValue: -500,
        duration: 500,
        easing: Easing.linear
      }
    ),
      Animated.timing(
        this.accountValue,
        {
          toValue: 0,
          duration: 500,
          easing: Easing.linear
        }
      )
  ]).start()
  this.menuFunc()
};
feedFunc () {
  Animated.parallel([
    Animated.timing(
      this.accountValue,
      {
        toValue: -500,
        duration: 500,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.settingsValue,
      {
        toValue: -500,
        duration: 500,
        easing: Easing.linear
      }
    ),
      Animated.timing(
        this.feedValue,
        {
          toValue: 0,
          duration: 500,
          easing: Easing.linear
        }
      )
  ]).start()
  this.menuFunc()
};
settingsFunc () {
  Animated.parallel([
    Animated.timing(
      this.feedValue,
      {
        toValue: 500,
        duration: 500,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.accountValue,
      {
        toValue: -500,
        duration: 500,
        easing: Easing.linear
      }
    ),
      Animated.timing(
        this.settingsValue,
        {
          toValue: 0,
          duration: 500,
          easing: Easing.linear
        }
      )
  ]).start()
  this.menuFunc()
};
};

const styles = StyleSheet.create({
  row: {
    fontSize:20,
    alignItems: 'center',
    padding: 25,
    height: 50,
  },
  navBar: {
    flexDirection: 'column',
    padding: 20,
    borderBottomColor: "black",
    borderBottomWidth: 2,
  },
  titleStyle: {
    position: 'absolute',
    top: 20,
    left: 125,
    color: 'black',
    fontSize: 36,
  },
  Imagecontainer: {
    padding:175,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  postImage: {
    resizeMode: 'cover'
  },
  userContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  ClockIcon: {
    position: 'absolute',
    top: 40,
    left: 69,
  },
  dateStyle: {
    position: 'absolute',
    top: 40,
    left: 92,
    color: 'grey',
    fontSize: 18,
  },
  profileIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  LikeIcon: {
    position: 'absolute',
    top: 25,
    left: 280,
  },
  likeNumber: {
    position: 'absolute',
    top: 25,
    left: 320,
    color: 'black',
    fontSize: 24,
  },
  userName: {
    position: 'absolute',
    top: 15,
    left: 69,
    color: 'black',
    fontSize: 20,
  },
  postDesc: {
    position: 'absolute',
    top: 75,
    left: 30,
    color: 'black',
    fontSize: 15,
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
  },
  LikeButton: {
    position: 'absolute',
    top: 150,
    left: 5,
  },
  CommentButton: {
    position: 'absolute',
    top: 150,
    left: 110,
  },
  OptionsButton: {
    position: 'absolute',
    top: 150,
    left: 304,
  },
  PageTurn: {
    position: 'absolute',
    top: 623,
  },
});

AppRegistry.registerComponent('ExtendedProject', () => ExtendedProject);
