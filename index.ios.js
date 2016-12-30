import actions from "ExtendedProject/Actions"
import PostContents from 'ExtendedProject/postContents'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,Navigator,ListView, TouchableHighlight, TextInput,Button,AsyncStorage
} from 'react-native';

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

class ExtendedProject extends Component {
  constructor (props) {
    super(props);
    this.database = firebase.database();
    //this.firebase = new Firebase(FirebaseURL);
    this.state = {
    modalVisible: false,
    textEntered: false,
    Username: "",
    password: "",
    postTitle: "",
    postDesc: "",
    postImage: "",
    postDate: "",
    Following: [],
    postIndex: 0,
    }
    this.previousValue = new Animated.Value(500)
    this.spinValue = new Animated.Value(0)
    this.moveYValue = new Animated.Value(-210)
    this.feedValue = new Animated.Value(0)
    this.accountValue = new Animated.Value(-500)
    this.settingsValue = new Animated.Value(-500)
  }

  tryLogin() {
    try {
      AsyncStorage.getItem('@username:key').then((value) => {
               this.setState({Username: value});
               if (this.state.Username !== null){
                 // We have data!!
                 this.setState({modalVisible: false});
                 AsyncStorage.getItem('@password:key').then((value) => {
                          this.setState({password: value});
                          firebase.auth().signInWithEmailAndPassword(this.state.Username, this.state.password).catch(function(error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            this.setState({modalVisible: true});
                          });
                  });
               } else {
                 this.setState({modalVisible: true});
               }
             });
             } catch (error) {
               // Error retrieving data
               this.setState({modalVisible: true});
             }
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
    AsyncStorage.getItem('@username:key').then((value) => {
             this.setState({Username: value});
        });;
    AsyncStorage.getItem('@password:key').then((value) => {
             this.setState({password: value});
             });;
    if (this.state.Username !== ""){
      // We have data!!
      this.setState({modalVisible: false});
      firebase.auth().signInWithEmailAndPassword(this.state.Username, this.state.password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        this.setState({modalVisible: true});
        alert('There was a problem logging in')
      });
    }
  } catch (error) {
    // Error retrieving data
    this.setState({modalVisible: true});
  }
  }

  logOut() {
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      AsyncStorage.setItem('@username:key', "");
      AsyncStorage.setItem('@password:key', "");
    }, function(error) {
      // An error happened.
      alert('There was a problem signing out');
    });
    this.setState({modalVisible: true});
  }

  newPost () {
    var postTitle = "New post"
    var postDesc = "New desc"
    var newPostKey = firebase.database().ref("UserID/Archie").child('posts').push().key;
    var postsRef = firebase.database().ref("UserID/Archie/posts")
    postsRef.child(newPostKey).update( {
      title: postTitle,
      desc: postDesc
    });
  }

  loadFollowers (childData) {
      childData = null
      var query = firebase.database().ref("UserID/Archie/Following/UserID").orderByKey();
      query.once("value")
        .then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            // key will be "ada" the first time and "alan" the second time
            var key = childSnapshot.key;
            // childData will be the actual contents of the child
           childData = childSnapshot.val();
           return childData
         })
        })
    }

    previousPost() {
      this.setState({postIndex: this.state.postIndex + 1})
      this.setState({postTitle: actions.postTitleList[this.state.postIndex]})
      this.setState({postDesc: actions.postDescList[this.state.postIndex]})
    }

    nextPost () {
      this.setState({postIndex: this.state.postIndex - 1})
      this.setState({postTitle: actions.postTitleList[this.state.postIndex]})
      this.setState({postDesc: actions.postDescList[this.state.postIndex]})
    }

  getPosts () {
    var {
      postTitle
    } = this.state
    var newTitle = ""
    var query = firebase.database().ref("UserID/Archie/Following/UserID").orderByKey();
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          // key will be "ada" the first time and "alan" the second time
          var key = childSnapshot.key;
          // childData will be the actual contents of the child
          var followedUserID = childSnapshot.val();
          //alert("childData" + followedUserID)
          var newRef = firebase.database().ref("UserID/" + childSnapshot.key + "/posts")
          newRef.once("value")
            .then(function(newSnapshot) {
              var newChildData = newSnapshot.val();
              var postTitleRef = firebase.database().ref("UserID/" + childSnapshot.key + "/posts/title")
              postTitleRef.on('value', (titleSnapshot) => {
                actions.postTitle = titleSnapshot.val()
              })
              var postDescRef = firebase.database().ref("UserID/" + childSnapshot.key + "/posts/description")
              postDescRef.on('value', (descSnapshot) => {
                actions.postDesc = descSnapshot.val()
                actions.newPost(actions.postTitle,actions.postDesc)
              })
            })
          });
        });
    }

  getpreviousPost () {
    let {
        postTitle, postDesc, postImage, postDate, Following
      } = this.state;
      postTitle = this.getPreviousPost()
      alert(this.getPreviousPost())
      this.setState({postTitle: postTitle})
    // Loop through users in order with the forEach() method. The callback
    // provided to forEach() will be called synchronously with a DataSnapshot
    // for each child:
    var UserID = 'Archie' //firebase.auth().currentUser.UserID


    this.followingRef = this.database.ref('UserID/Archie/Following/UserID/Miles');
    this.followingRef.on('value', (snapshot) => {
      Following = snapshot.val();

    })

    this.setState({Following: Following});

    var val = firebase.database().ref('UserID/Archie/Following/UserID/');
    val.on('value', function(snapshot) {
      var value = snapshot.val();

    });


    var val = firebase.database().ref('UserID/Archie/Following/UserID/Jack/posts/time/151299/title');
    val.on('value', function(snapshot) {
      postTitle = snapshot.val();
      //alert(postTitle)
    });
    var val = firebase.database().ref('UserID/Archie/Following/UserID/Jack/posts/time/151299/description');
    val.on('value', function(snapshot) {
      postDesc = snapshot.val();
    });
    this.setState({postTitle: postTitle})
    this.setState({postDesc: postDesc})
  }

  render() {
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg','90deg']
  })
    return (

<View>
  <Modal
      animationType={"slide"} transparent={false} visible={this.state.modalVisible}>
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
    </Modal>

      <View style={styles.navBar}>
        <TouchableHighlight
          onPress={this.menuFunc.bind(this)}
          style={{width: 40,height: 30 }}
          underlayColor="#f1f1f1">
          <Animated.Image
           style={{position: 'absolute',top: 8, height:25, width:25,left: 2,transform: [{rotate: spin}],}}
        source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/MenuIcon.png')}/>
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
        onPress={this.settingsFunc.bind(this)} style={{padding: 10 }} underlayColor="#f1f1f1">
        <Animated.Text style={styles.row}> Settings </Animated.Text>
      </TouchableHighlight>



    <Animated.View style={{flex:1, transform: [{ translateY: this.moveYValue}, {translateX: this.feedValue}] }}>
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
          <Text style={styles.dateStyle}>4 Days Ago...</Text>
          <Image
            style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/LikeIcon.png')}/>
          <Text style={styles.likeNumber}>100</Text>
        <Text style={styles.postDesc}>{this.state.postDesc}</Text>
      </View>

      <View style={styles.buttons}>
        <Image
          style={styles.LikeButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/LikeButton.png')}/>
        <Image
          style={styles.CommentButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/CommentIcon.png')}/>
        <Image
          style={styles.OptionsButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/OptionsIcon.png')}/>
      </View>
      <TouchableHighlight onPress={this.previousPost.bind(this)} style={{position: 'absolute', top: 535, right: 50,padding:25}} underlayColor="#f1f1f1">
        <Text style={{fontSize: 20}}>Previous</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={this.newPost.bind(this)} style={{position: 'absolute', top: 535, left: 50,padding:25}} underlayColor="#f1f1f1">
        <Text style={{fontSize: 20}}>Next</Text>
      </TouchableHighlight>
      <Image
        style={styles.PageTurn} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/PageTurn.png')}/>
      </Animated.View>

      <Animated.View style={{paddingLeft:this.previousValue, flex:1, transform: [{ translateY: this.moveYValue}, {translateX: this.previousValue}] }}>
        <PostContents />
      </Animated.View>


      <Animated.View style={{paddingLeft:(this.accountValue), flex:1, backgroundColor: '#FFFFFF', transform: [{ translateY: this.moveYValue}, {translateX: this.accountValue}] }}>
          <Image
            style={{position: 'absolute', top: 50, left: 150}} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/Avatar2.png')}/>
          <Text style={{position: 'absolute', top: 125, left: 130, fontSize: 20}}>{this.state.Username}</Text>
          <TouchableHighlight onPress={this.logOut.bind(this)} style={{position: 'absolute', top: 200, left: 130}} underlayColor="#f1f1f1">
            <Text style={{fontSize: 20}}>Log Out</Text>
          </TouchableHighlight>
      </Animated.View>


      <Animated.View style={{paddingLeft:(this.settingsValue), flex:1, flexDirection: 'column', backgroundColor: '#FFFFFF', transform: [{ translateY: this.moveYValue}, {translateX: this.settingsValue}] }}>
          <Text style={{position: 'absolute', top: 25, left: 130, fontSize: 20}}>Settings</Text>
          <TouchableHighlight onPress={this.logOut.bind(this)} style={{position: 'absolute', top: 75, left: 130}} underlayColor="#f1f1f1">
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

moveLeft () {
  Animated.sequence([
    Animated.timing(
      this.previousValue,
      {
        toValue: 0,
        duration: 550,
        easing: Easing.linear
      }
    )
  ]).start()
};
menuFunc () {
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
    ),
    Animated.timing(
      this.spinValue,
      {
        toValue: 0,
        delay: 1400,
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
