import actions from "EP/Actions"
import FeedComponent from 'EP/feedComponent'
import AccountComponent from 'EP/accountComponent'
import SearchComponent from 'EP/searchComponent'
import dismissKeyboard from 'dismissKeyboard'
import firebase from 'EP/firebaseConfig'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,Navigator,ListView, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions,AsyncFunction,NetInfo
} from 'react-native';
var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const FirebaseURL = 'https://epproject-a2ea7.firebaseio.com';
const window = Dimensions.get('window');

class ExtendedProject extends Component {
  constructor (props) {
    super(props);
    this.database = firebaseApp.database();
    //this.firebaseApp = new firebaseApp(firebaseAppURL);
    this.state = {
    modalVisible: false,
    textEntered: false,
    otherUserID: "",
    otherName: "",
    otherProfDesc: "",
    UserID: "",
    Username: "",
    name: "",
    profDesc: "",
    password: "",
    postTitle: "Loading",
    postDesc: "Loading",
    postImage: "",
    postDate: "Loading",
    postLikes: 0,
    liked: false,
    following: "Follow",
    loaded: false
    }
    this.clearText = this.clearText.bind(this);
    this.tapYValue = new Animated.Value(800)
    this.newPostValue = new Animated.Value(500)
    this.previousValue = new Animated.Value(500)
    this.profileValue = new Animated.Value(500)
    this.spinValue = new Animated.Value(0)
    this.crossValue = new Animated.Value(0)
    this.crossXValue = new Animated.Value(0)
    this.editXValue = new Animated.Value(100)
    this.moveYValue = new Animated.Value(-210)
    this.feedValue = new Animated.Value(0)
    this.accountValue = new Animated.Value(-500)
    this.otherAccountValue = new Animated.Value(-500)
    this.otherAccountXValue = new Animated.Value(100)
    this.settingsValue = new Animated.Value(-500)
    this.searchValue = new Animated.Value(500)
  }

  clearText() {
   this._titleInput.setNativeProps({text: ''});
   this._descInput.setNativeProps({text: ''});
   dismissKeyboard();
 }

  async tryLogin() {
    function loggingIn() {
      try {
        AsyncStorage.getItem('@userID:key').then((value) => {
          actions.UserID = value
        });
      } catch (error) {
        // Error retrieving data
        actions.badLogin()
      }

      try {
        AsyncStorage.getItem('@name:key').then((value) => {
          actions.name = value;
        });
      } catch (error) {
        // Error retrieving data
        actions.badLogin()
      }
      try {
        AsyncStorage.getItem('@profDesc:key').then((value) => {
          actions.profDesc = value;
        });
      } catch (error) {
        // Error retrieving data
        actions.badLogin()
      }
      try {
        AsyncStorage.getItem('@username:key').then((value) => {
        actions.Username = value
         var Username = value;
         if (Username !== null){
           // We have data!
           actions.goodLogin()
           actions.login = true
           AsyncStorage.getItem('@password:key').then((word) => {
            actions.password = word
            var password = word
            firebaseApp.auth().signInWithEmailAndPassword(Username, password).catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              actions.badLogin()
            })
            })
          } else {
           actions.badLogin()
          }
        })
       } catch (error) {
         // Error retrieving data
         actions.badLogin()
       }
    }

     return new Promise(function(resolve, reject) {
       setTimeout(function() {
         resolve(loggingIn())}, 1000)
       })
  }

  setUserInfo() {
    this.setState({Username: actions.Username});
    this.setState({UserID: actions.UserID});
    this.setState({password: actions.password});
    this.setState({name: actions.name});
    this.setState({profDesc: actions.profDesc})
    this.setState({modalVisible: actions.visible})
  }

  createUser () {
    let {
        Username, password, name
      } = this.state;
      firebaseApp.auth().createUserWithEmailAndPassword(Username, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage)
      });
      firebaseApp.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          var user = firebaseApp.auth().currentUser;
          var userRef = firebaseApp.database().ref("UserID/" + user.uid)
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

    firebaseApp.auth().signInWithEmailAndPassword(Username, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    });

    firebaseApp.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        //alert("logged")
        var user = firebaseApp.auth().currentUser;
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
    AsyncStorage.getItem('@profDesc:key').then((value) => {
              this.setState({profDesc: value});
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
      firebaseApp.auth().signInWithEmailAndPassword(this.state.Username, this.state.password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        this.logOut()
        alert('There was a problem logging in')
      });
      this.readyToLogin()
    }
  } catch (error) {
    // Error retrieving data
    alert("error")
    this.logOut()
  }
    this.setState({modalVisible: actions.visible})
  }

  logOut() {
    var user = firebaseApp.auth().currentUser;
    firebaseApp.auth().signOut().then(function() {
      // Sign-out successful.
      try {
       AsyncStorage.setItem('@userID:key', "");
      } catch (error) {
        // Error saving data
        alert('error saving username')
      }
      try {
       AsyncStorage.setItem('@name:key', "");
      } catch (error) {
        // Error saving data
        alert('error saving username')
      }
      try {
       AsyncStorage.setItem('@profDesc:key', "");
      } catch (error) {
        // Error saving data
        alert('error saving username')
      }
      try {
       AsyncStorage.setItem('@username:key', "");
      } catch (error) {
        // Error saving data
        alert('error saving username')
      }
      try {
       AsyncStorage.setItem('@password:key', "");
      } catch (error) {
        // Error saving data
        alert('error saving username')
      }
    }, function(error) {
      // An error happened.
      alert('There was a problem signing out');
    });
    this.setState({modalVisible: true})
    this.setState({loaded: false})
  }

  newPost () {
    var timeKey = moment().format('MMDDYYYYhmmss')
    var postTitle = this.state.postTitle
    var postDesc = this.state.postDesc
    try {
    AsyncStorage.getItem('@userID:key').then((value) => {
             this.setState({UserID: value});
             var postsRef = firebaseApp.database().ref("UserID/"+ this.state.UserID + "/posts")
             postsRef.child(timeKey).update( {
               title: postTitle,
               desc: postDesc
             });
             this.clearText()
             this.rotateCross()
             });;
  } catch(error) {
    this.signOut()
  }


  }

  saveProfile() {
    var name = this.state.name
    var profDesc = this.state.profDesc
    var postsRef = firebaseApp.database().ref("UserID/"+ this.state.UserID)
    postsRef.update( {
      Name: name,
      ProfDesc: profDesc
    });
    AsyncStorage.setItem('@name:key', name);
    AsyncStorage.setItem('@profDesc:key', profDesc);
    this.clearText()
    this.accountLeft()
  }

showAccountInfo(otherUserID) {
  let {
    UserID
  } = this.state
  actions.following = false
  var userRef = firebaseApp.database().ref("UserID/" + otherUserID + "/Name")
  userRef.once('value', (Snapshot) => {
    this.setState({otherName: Snapshot.val()})
  })
  var userProfRef = firebaseApp.database().ref("UserID/" + otherUserID + "/ProfDesc")
  userProfRef.once('value', (Snapshot) => {
    this.setState({otherProfDesc: Snapshot.val()})
  })
  var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
  followRef.once("value")
    .then(function(snapshot) {
      if (snapshot.val() !== null) {
        snapshot.forEach(function(childSnapshot) {
          if (childSnapshot.key !== UserID) {
            actions.following = false
          } else {
            actions.following = true
          }
        })
      } else {
        actions.following = false
      }
  })
  if (actions.following == true) {
    this.setState({following: "Following"})
  } else {
    this.setState({following: "Follow?"})
  }
  this.showOtherAccount()
}

followUser(otherUserID) {
  let {
    UserID
  } = this.state
  var followRef = firebaseApp.database().ref("UserID/"+ otherUserID + "/followers")
  followRef.once("value")
    .then(function(snapshot) {
      if (snapshot.val() !== null) {
        snapshot.forEach(function(childSnapshot) {
          if (childSnapshot.key !== UserID) {
            followRef.child(UserID).update( {
              User: UserID
            });
            var userRef = firebaseApp.database().ref("UserID/"+ UserID + "/following")
            userRef.child(otherUserID).update( {
              User: otherUserID
            });
          }
        })
      } else {
        followRef.child(UserID).update( {
          User: UserID
        });
        var userRef = firebaseApp.database().ref("UserID/"+ UserID + "/following")
        userRef.child(otherUserID).update( {
          User: otherUserID
        });
      }
  })
  this.setState({following: "Following"})
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

  if (this.state.loaded == false) {
    return (
    <View style={{flex:1}}>
      <Text style={{fontSize:20, flex:1, flexDirection:'column', alignItems:'center'}}>Loading...</Text>
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
    </View>
  )
  } else {
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
        source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/MenuIcon.png')}/>
        </TouchableHighlight>
        <Text style={styles.titleStyle}>
            Tell-Tale
        </Text>
        <TouchableHighlight
          onPress={this.rotateCross.bind(this)}
          style={{width: 40,height: 30, position: 'absolute',top: 28, height:25, width:25, left: 325 }}
          underlayColor="#f1f1f1">
          <Animated.Image
           style={{position: 'absolute',top: 0, height:25, width:25, left: 0, transform: [ {translateX: this.crossXValue}, {rotate: cross}]}}
        source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/PlusIcon.png')}/>
        </TouchableHighlight>
        <Animated.View style={{position: 'absolute', top: 28, left: 325, transform: [{translateX: this.editXValue}]}}>
          <TouchableHighlight
          onPress={this.accountLeft.bind(this)}
          style={{width: 40,height: 30}}
          underlayColor="#f1f1f1">
          <Animated.Image
            style={{height: 25, width: 25 ,position: 'absolute', top: 0, left: 0}}  source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/EditIcon.png')}/>
        </TouchableHighlight>
      </Animated.View>
      <Animated.View style={{position: 'absolute', top: 28, left: 325, transform: [{translateX: this.otherAccountXValue}]}}>
        <TouchableHighlight
        onPress={this.closeOtherAccount.bind(this)}
        style={{width: 40,height: 30}}
        underlayColor="#f1f1f1">
        <Animated.Image
          style={{height: 25, width: 28 ,position: 'absolute', top: 0, left: 0}}  source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/BackIcon.png')}/>
      </TouchableHighlight>
    </Animated.View>
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
        onPress={this.followFunc.bind(this)} style={{padding: 10 }} underlayColor="#f1f1f1">
        <Animated.Text style={styles.row}> Follow </Animated.Text>
      </TouchableHighlight>

      <TouchableHighlight
        onPress={this.settingsFunc.bind(this)} style={{padding: 10 }} underlayColor="#f1f1f1">
        <Animated.Text style={styles.row}> Settings </Animated.Text>
      </TouchableHighlight>


      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, position: 'absolute', top: 280, transform: [{translateY: this.moveYValue}, {translateX: this.feedValue}] }}>
        <FeedComponent />
      </Animated.View>

      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 280,  backgroundColor: "white",transform: [{ translateY: this.moveYValue}, {translateX: this.previousValue}]}}>
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


      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 280,  backgroundColor: "white", flex:1, backgroundColor: '#FFFFFF', transform: [{ translateY: this.moveYValue}, {translateX: this.accountValue}] }}>
        <AccountComponent />
      </Animated.View>

      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 280,  backgroundColor: "white",transform: [{ translateY: this.moveYValue}, {translateX: this.profileValue}]}}>
        <Text style={{position: 'absolute', top: 10, left: 100, fontSize: 25}}>Edit your profile</Text>
        <TextInput
        style={{position: 'absolute', top: 50, left: 40, height: 40, width: 300, borderColor: 'gray', borderWidth: 1}}
        placeholder={' Enter your name'}
        value={this.state.name}
        onChange={(event) => this.setState({name: event.nativeEvent.text})}
        ref={component => this._titleInput = component}
        />
        <TextInput
        style={{position: 'absolute', top: 95, left: 40, height: 80, width: 300, borderColor: 'gray', borderWidth: 1}}
        placeholder={' Enter a description'}
        multiline={true}
        value={this.state.profDesc}
        onChange={(event) => this.setState({profDesc: event.nativeEvent.text})}
        ref={component => this._descInput = component}
        />
      <TouchableHighlight onPress={this.saveProfile.bind(this)} style={{position: 'absolute', top: 155, left: 130, padding:25}} underlayColor="#f1f1f1">
          <Text style={{fontSize: 20}}>Save</Text>
        </TouchableHighlight>
      </Animated.View>

      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 280,  backgroundColor: "white",transform: [{ translateY: this.moveYValue}, {translateX: this.searchValue}]}}>
        <SearchComponent />
      </Animated.View>


      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 275,  backgroundColor: "white", flex:1, flexDirection: 'column', backgroundColor: '#FFFFFF', transform: [{ translateY: this.moveYValue}, {translateX: this.settingsValue}] }}>
          <Text style={{position: 'absolute', top: 25, left: 130, fontSize: 20}}>Settings</Text>
          <TouchableHighlight onPress={this.logOut.bind(this)} style={{position: 'absolute', top: 75, left: 130}} underlayColor="#f1f1f1">
            <Text style={{fontSize: 20}}>Log Out</Text>
          </TouchableHighlight>
      </Animated.View>

      <Animated.View style={{height: (window.height / 2), width:window.width, position: 'absolute', top: 275, flex:1, transform: [{ translateY: (this.tapYValue)}] }}>
        <TouchableHighlight onPress={() => this.menuFunc()} style={{position: 'absolute', top: 0, left: 0, height: (window.height / 3), width:window.width, opacity: 0.5}} underlayColor="#867979">
          <Text style={{position: 'absolute', top: 0, left: 160, fontSize: 30, color:'black'}}>^ ^ ^</Text>
        </TouchableHighlight>
      </Animated.View>
    </View>
  )}
};

readyToLogin() {
  this.tryLogin().then(() => {
    //alert(value)
    if (actions.login = true) {
      this.setState({loaded: true})
      this.setState({modalVisible: false})
      this.setUserInfo()
    } else {
      this.logOut()
    }
  })
}

  componentWillMount () {
    actions.width = window.width;
    actions.height = window.height
    NetInfo.fetch().done((reach) => {
      if (reach !== 'none') {
        this.readyToLogin()
      } else {
        alert('Please connect to the internet')
      }
    });

  }
  componentDidMount () {

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

showOtherAccount() {
  Animated.sequence([
    Animated.timing(
      this.otherAccountValue,
      {
        toValue: 0,
        duration: 550,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.otherAccountXValue,
      {
        toValue: 0,
        duration: 550,
        easing: Easing.linear
      }
    )
  ]).start()
}

moveLeft () {
  Animated.parallel([
    Animated.timing(
      this.previousValue,
      {
        toValue: 0,
        duration: 550,
        easing: Easing.linear
      })
  ]).start()
};

accountLeft () {
  if (actions.pressed == false) {
    actions.alternateSpin(2)
    Animated.parallel([
      Animated.timing(
        this.profileValue,
        {
          toValue: 0,
          duration: 550,
          easing: Easing.linear
        })
    ]).start()
  } else {
    actions.alternateSpin(2)
    Animated.parallel([
      Animated.timing(
        this.profileValue,
        {
          toValue: 500,
          duration: 550,
          easing: Easing.linear
        })
      ]).start()
  }
}
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

editFunc () {
  Animated.parallel([
    Animated.timing(
      this.crossXValue,
      {
        toValue: 100,
        duration: 400,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.otherAccountXValue,
      {
        toValue: 100,
        duration: 550,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.editXValue,
      {
        toValue: 0,
        duration: 550,
        easing: Easing.linear
      }
    )
  ]).start()
}

newPostFunc () {
  Animated.parallel([
    Animated.timing(
      this.editXValue,
      {
        toValue: 100,
        duration: 400,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.otherAccountXValue,
      {
        toValue: 100,
        duration: 550,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.crossXValue,
      {
        toValue: 0,
        duration: 550,
        easing: Easing.linear
      }
    )
  ]).start()
}

closeOtherAccount() {
  Animated.parallel([
    Animated.timing(
      this.editXValue,
      {
        toValue: 100,
        duration: 400,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.crossXValue,
      {
        toValue: 100,
        duration: 550,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.otherAccountXValue,
      {
        toValue: 100,
        duration: 550,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.otherAccountValue,
      {
        toValue: -500,
        duration: 400,
        easing: Easing.linear
      }
    ),
  ]).start()
}

settingFunc () {
  Animated.parallel([
    Animated.timing(
      this.editXValue,
      {
        toValue: 100,
        duration: 400,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.crossXValue,
      {
        toValue: 100,
        duration: 550,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.otherAccountXValue,
      {
        toValue: 100,
        duration: 550,
        easing: Easing.linear
      }
    )
  ]).start()
}

menuFunc () {
  if (actions.crossSpun == true) {
    this.rotateCross()
  }
  if (actions.pressed == true) {
    this.accountLeft()
  }
  this.showHighlight()
  if (actions.spun == false) {
    actions.alternateSpin(1)
    Animated.parallel([
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
    Animated.parallel([
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
  this.editFunc()
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
      this.searchValue,
      {
        toValue: 500,
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
  this.newPostFunc()
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
      this.searchValue,
      {
        toValue: 500,
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

showHighlight () {
  if (actions.highlight == false) {
    actions.alternateSpin(3)
    Animated.timing(
      this.tapYValue,
      {
        toValue: 180,
        duration: 500,
        easing: Easing.linear
      }
    ).start()
  } else {
    actions.alternateSpin(3)
    Animated.timing(
      this.tapYValue,
      {
        toValue: 400,
        duration: 500,
        easing: Easing.linear
      }
    ).start()
  }

};

followFunc () {
  this.settingFunc()
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
        toValue: -500,
        duration: 500,
        easing: Easing.linear
      }
    ),
    Animated.timing(
      this.searchValue,
      {
        toValue: 0,
        duration: 500,
        easing: Easing.linear
      }
    ),
  ]).start()
  this.menuFunc()
};

settingsFunc () {
  this.settingFunc()
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

AppRegistry.registerComponent('EP', () => ExtendedProject);
