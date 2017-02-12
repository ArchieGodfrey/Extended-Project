import actions from "EP/Actions"
import FeedComponent from 'EP/feedComponent'
import AccountComponent from 'EP/accountComponent'
import SearchComponent from 'EP/searchComponent'
import dismissKeyboard from 'dismissKeyboard'
import firebase from 'EP/firebaseConfig'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions,NetInfo
} from 'react-native';
var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const FirebaseURL = 'https://epproject-a2ea7.firebaseio.com';
const window = Dimensions.get('window');

class ExtendedProject extends Component {
  constructor (props) {
    super(props);
    this.state = {
    modalVisible: false,
    textEntered: false,
    otherUserID: "",
    otherName: "",
    otherProfDesc: "",
    UserID: "",
    Username: " ",
    name: "",
    profDesc: "",
    password: " ",
    postTitle: "Loading",
    postDesc: "Loading",
    postImage: "",
    postDate: "Loading",
    postLikes: 0,
    liked: false,
    following: "Follow",
    loaded: false
    }
    this.tapYValue = new Animated.Value(800)
    this.previousValue = new Animated.Value(500)
    this.spinValue = new Animated.Value(0)
    this.crossXValue = new Animated.Value(0)
    this.editXValue = new Animated.Value(100)
    this.moveYValue = new Animated.Value(-210)
    this.feedValue = new Animated.Value(0)
    this.accountValue = new Animated.Value(500)
    this.otherAccountXValue = new Animated.Value(100)
    this.settingsValue = new Animated.Value(-500)
    this.searchValue = new Animated.Value(-500)
  }

  async tryLogin() {
    return new Promise(function(resolve, reject) {
      try {
        AsyncStorage.getItem('@userID:key').then((value) => {
          actions.UserID = value
        });
      } catch (error) {
        // Error retrieving data
        resolve(false)
      }
      try {
        AsyncStorage.getItem('@name:key').then((value) => {
          actions.name = value;
        });
      } catch (error) {
        // Error retrieving data
        resolve(false)
      }
      try {
        AsyncStorage.getItem('@profDesc:key').then((value) => {
          actions.profDesc = value;
        });
      } catch (error) {
        // Error retrieving data
        resolve(false)
      }
      try {
        AsyncStorage.getItem('@username:key').then((value) => {
        actions.Username = value
        //alert(value)
         var Username = value;
         if (Username !== null){
           // We have data!
           AsyncStorage.getItem('@password:key').then((word) => {
            actions.password = word
            var password = word
            firebaseApp.auth().signInWithEmailAndPassword(Username, password).catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              resolve(false)
            })
            .then(() => {
              resolve(true)
            })
            })
          } else {
           resolve(false)
          }
        })
       } catch (error) {
         // Error retrieving data
         resolve(false)
       }

       setTimeout(function() {
         resolve(false)}, 10000)
       })

       alert('loggin in')
  }

  setUserInfo() {
    this.setState({Username: actions.Username});
    this.setState({UserID: actions.UserID});
    this.setState({password: actions.password});
    this.setState({name: actions.name});
    this.setState({profDesc: actions.profDesc})
  }

  async createUser () {
    let {
        Username, password, name
      } = this.state;
    return new Promise(function(resolve, reject) {
      if (name.length >= 1) {
        if (password.length > 5) {
          firebaseApp.auth().createUserWithEmailAndPassword(Username, password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(errorMessage)
          resolve(false)
          })
          .then(() => {
            var user = firebaseApp.auth().currentUser;
            var userRef = firebaseApp.database().ref("UserID/" + user.uid)
            userRef.update( {
              User: user.uid,
              Name: name,
              Email: Username
            });
            try {
             AsyncStorage.setItem('@userID:key', user.uid);
            } catch (error) {
              // Error saving data
              alert('error saving username')
              resolve(false)
            }
            try {
             AsyncStorage.setItem('@name:key', name);
            } catch (error) {
              // Error saving data
              alert('error saving username')
              resolve(false)
            }
            try {
             AsyncStorage.setItem('@username:key', Username);
            } catch (error) {
              // Error saving data
              alert('error saving username')
              resolve(false)
            }
            try {
             AsyncStorage.setItem('@password:key', password);
            } catch (error) {
              // Error saving data
              alert('error saving password')
              resolve(false)
            }
            resolve(true)
          })
        } else {
          alert('Password must be longer than 5 characters')
          resolve(false)
        }
      } else {
        alert('Please enter your name')
        resolve(false)
      }
    })
  }

  async login () {
    let {
        Username, password
      } = this.state;
    var loggedIn = true
    firebaseApp.auth().signInWithEmailAndPassword(Username, password).catch(function(error) {
      // Handle Errors here.
      loggedIn = false
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    }).then(() => {
      if (loggedIn == true) {
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
         AsyncStorage.setItem('@password:key', password)
        } catch (error) {
          // Error saving data
          alert('error saving password')
        }
        try {
          AsyncStorage.getItem('@username:key').then((value) => {
         })
        } catch (error) {
          // Error saving data
          alert('error saving username')
        }
        this.readyToLogin()
        this.setState({modalVisible:false})
      }
    })

    firebaseApp.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
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
         AsyncStorage.setItem('@password:key', password)
        } catch (error) {
          // Error saving data
          alert('error saving password')
        }
      } else {
        // No user is signed in.
      }
    })
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
    this.setState({loaded: false})
    this.setState({modalVisible: true})
  }



  render() {
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg','90deg']
  })


  if (this.state.loaded == false) {
    return (
    <View style={{flex:1}}>
      <Text style={{fontSize:20, flex:1, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>Loading...</Text>
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
              <TouchableHighlight onPress={() => {this.createUser().then((result) => {if (result == true) {this.moveRight()}})}} style={{position: 'absolute', top: 310, left: 100}} underlayColor="#f1f1f1">
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
      <View style={styles.navBar}>
        <TouchableHighlight
          onPress={this.menuFunc.bind(this)}
          style={{height: 50, width: 50}}
          underlayColor="#f1f1f1">
          <Animated.Image
           style={{position: 'absolute',top: 8, height:25, width:25,left: 2,transform: [{rotate: spin}]}}
        source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/MenuIcon.png')}/>
        </TouchableHighlight>
        <Text style={styles.titleStyle}>
            Tell-Tale
        </Text>
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


      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 280,  backgroundColor: "white", flex:1, transform: [{translateY: this.moveYValue}, {translateX: this.feedValue}] }}>
        <FeedComponent />
      </Animated.View>


      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 280,  backgroundColor: "white", flex:1, backgroundColor: '#FFFFFF', transform: [{ translateY: this.moveYValue}, {translateX: this.accountValue}] }}>
        <AccountComponent />
      </Animated.View>

      <Animated.View style={{borderTopColor: "black", borderTopWidth: 2, height: window.height, width:window.width, position: 'absolute', top: 280,  backgroundColor: "white", flex:1, transform: [{ translateY: this.moveYValue}, {translateX: this.searchValue}]}}>
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
  this.tryLogin().then((value) => {
    if (value == true) {
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
    actions.height = window.height;
    NetInfo.addEventListener(
        'change',
        this._handleConnectionInfoChange
    );
    NetInfo.fetch().done((connectionInfo) => {
      if (connectionInfo !== 'none') {
        NetInfo.removeEventListener(
            'change',
            this._handleConnectionInfoChange
        );
        this.readyToLogin()
      } else {
        alert('Please connect to the internet')
      }
    });

  }

  _handleConnectionInfoChange = (connectionInfo) => {
    if (connectionInfo !== 'none') {
      NetInfo.removeEventListener(
          'change',
          this._handleConnectionInfoChange
      );
      this.readyToLogin()
    } else {
      alert('Please connect to the internet')
    }
  };

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
  actions.isLoading = false
  this.newPostFunc()
  Animated.parallel([
    Animated.timing(
      this.accountValue,
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
        toValue: 500,
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
