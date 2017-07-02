import actions from "EPRouter/Actions"
import Interactable from 'react-native-interactable';
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions,NetInfo
} from 'react-native';


import { StackNavigator, NavigationActions  } from 'react-navigation';

import Feed from 'EPRouter/Components/feedComponent'
import UserDetail from 'EPRouter/Components/otherUserAccount'
import Account from 'EPRouter/Components/accountComponent'
import Search from 'EPRouter/Components/searchComponent'
import NewPost from 'EPRouter/Components/newPostComponent'

const FeedStack = StackNavigator({
  Feed: {
    screen: Feed,
    navigationOptions: {
      title: 'Feed',
      header: ({state, setParams}) => ({backTitle: null, tintColor:'black'})
    },
  },
  UserDetail: {
    screen: UserDetail,
    navigationOptions: {
      /*title: ({state}) => `${state.params.USERID}`,*/
      header: ({state}) => ({backTitle: null, tintColor:'black'})

    },
  },
  Account: {
    screen: Account,
    navigationOptions: {
      title: 'Account',
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  },
  Search: {
    screen: Search,
    navigationOptions: {
      title: 'Search',
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  },
  NewPost: {
    screen: NewPost,
    navigationOptions: {
      title: 'Create a post',
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  },
});

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height
}

export default class EPRouter extends Component {
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
    this._deltaX = new Animated.Value(-(Screen.width));
    this._opacity = new Animated.Value(-(Screen.width));
    this.previousValue = new Animated.Value(500)
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

  downloadImage(otherUserID) {
    return new Promise(function(resolve, reject) {
      firebaseApp.storage().ref('Users/' + otherUserID).child('Background').getDownloadURL().then(function(url2) {
        resolve(url2)
      }).catch((error) =>  {
        firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
          resolve(url2)
        })
      })
    })
  }

  transitionToAccount() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Account'})
      ]
    })
    this.navigator.dispatch(resetAction)
    this.toggleMenu()
  }

  transitionToFeed() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Feed'})
      ]
    })
    this.navigator.dispatch(resetAction)
    this.toggleMenu()
  }

  transitionToSearch() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Search'})
      ]
    })
    this.navigator.dispatch(resetAction)
    this.toggleMenu()
  }


  render() {
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
        <View style={{flex:1}}>
          <Animated.View style={[styles.panelContainer, {
            backgroundColor: 'white',
            opacity: this._opacity.interpolate({
              inputRange: [-(Screen.width), 0],
              outputRange: [1, 0],
              extrapolateRight: 'clamp'
            })
          }]} >
            <FeedStack ref={nav => { this.navigator = nav; }}/>
              <TouchableHighlight style={{height: 40, width: 40, position:'absolute', left:Screen.width - (Screen.width / 7), top: 20, justifyContent:'center'}} onPress={() => this.toggleMenu()} underlayColor="#f1f1f1">
                  <Image style={{height: 20, width: 20}}source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EPRouter/Images/MenuIcon.png')}/>
              </TouchableHighlight>
          </Animated.View>

        <Animated.View style={{width:Screen.width, height:Screen.height, transform: [{translateX: this._deltaX}], backgroundColor:'white', opacity: this._deltaX.interpolate({
          inputRange: [-(Screen.width), 0],
          outputRange: [0, 1],
          extrapolateRight: 'clamp'
        }), flex:1, flexDirection:'column', alignItems:'flex-start'}}>
        <Image
          style={{position:'absolute', top: 20, resizeMode: 'cover', width: Screen.width, height: (Screen.height / 3) }} source={{uri:this.state.backgroundSource}}/>
        <TouchableHighlight style={{position:'absolute', top: (Screen.height / 6) * 2, width:Screen.width, height:Screen.height / 6,backgroundColor:'white',justifyContent:'center'}} onPress={() => this.transitionToAccount()} underlayColor="#111111">
              <Text style={{fontSize:20, color:'black'}}> Account</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{position:'absolute', top: (Screen.height / 6) * 3, width:Screen.width, height:Screen.height / 6,backgroundColor:'white',justifyContent:'center'}} onPress={() => this.transitionToFeed()} underlayColor="#111111">
              <Text style={{fontSize:20, color:'black'}}> Feed</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{position:'absolute', top: (Screen.height / 6) * 4, width:Screen.width, height:Screen.height / 6,backgroundColor:'white',justifyContent:'center'}} onPress={() => this.transitionToSearch()} underlayColor="#111111">
              <Text style={{fontSize:20, color:'black'}}> Search</Text>
          </TouchableHighlight>
        </Animated.View>
      </View>
      );
    }
  }

  readyToLogin() {
    this.tryLogin().then((value) => {
      if (value == true) {
        this.downloadImage(actions.UserID).then((url) => {
          this.setState({backgroundSource:url})
          this.setState({loaded: true})
          this.setState({modalVisible: false})
        })
        this.setUserInfo()
      } else {
        this.logOut()
      }
    })
  }

  componentWillMount() {
    NetInfo.addEventListener(
        'change',
        this._handleConnectionInfoChange
    );
    NetInfo.fetch().done((connectionInfo) => {
      if (connectionInfo !== 'none') {
        NetInfo.removeEventListener(
            'change',
            this._handleConnectionInfoChange
        )
        this.readyToLogin()
      } else {
        alert('Please connect to the internet')
      }
    })
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

  toggleMenu() {
    if (actions.pressed == false) {
      actions.alternateSpin(5)
      Animated.sequence([
        Animated.timing(
          this._opacity,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.linear
          }
        ),
        Animated.timing(
          this._deltaX,
          {
            toValue: 0,
            duration: 10,
            easing: Easing.linear
          }
        )
      ]).start()
    } else {
      actions.alternateSpin(5)
      Animated.sequence([
        Animated.timing(
          this._deltaX,
          {
            toValue: -(Screen.width),
            duration: 0,
            easing: Easing.linear
          }
        ),
        Animated.timing(
          this._opacity,
          {
            toValue: -(Screen.width),
            duration: 250,
            easing: Easing.linear
          }
        )
      ]).start()
    }

  };
}
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#efefef',
    },
    panelContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    },
    panel: {
      height: Screen.height + 300,
      width: Screen.width - 20,
      padding: 20,
      left:10,
      backgroundColor: '#f7f5eee8',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 0},
      shadowRadius: 5,
      shadowOpacity: 0.4
    },
    panelHeader: {
      alignItems: 'center'
    },
    panelHandle: {
      width: 40,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#00000040',
      marginBottom: 10
    },
    panelTitle: {
      fontSize: 27,
      height: 35
    },
    panelSubtitle: {
      fontSize: 14,
      color: 'gray',
      height: 30,
      marginBottom: 10
    },
    panelButton: {
      padding: 20,
      borderRadius: 10,
      backgroundColor: '#318bfb',
      alignItems: 'center',
      marginVertical: 10
    },
    panelButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white'
    },
});


AppRegistry.registerComponent('EPRouter', () => EPRouter);
