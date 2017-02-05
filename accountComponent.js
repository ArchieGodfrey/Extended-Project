import actions from "EP/Actions"
import firebase from 'EP/firebaseConfig'
import React, { Component } from 'react';
import {
  AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const window = Dimensions.get('window');

export default class AccountContents extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
    Username: "Loading",
    name: "Loading",
    profDesc: "Loading",
    dataSource: ds.cloneWithRows([]),
  }
  this.listYValue = new Animated.Value(200)
  this.postXValue = new Animated.Value(1000)
}

getAccountInfo() {
  return new Promise(function(resolve, reject) {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var nameRef = firebaseApp.database().ref("UserID/"+ value + "/Name")
       nameRef.once('value', (nameSnapshot) => {
         actions.name = nameSnapshot.val();
       });
       var descRef = firebaseApp.database().ref("UserID/"+ value + "/ProfDesc")
       descRef.once('value', (descSnapshot) => {
         actions.profDesc =  descSnapshot.val();
        });
        var emailRef = firebaseApp.database().ref("UserID/"+ value + "/Email")
        emailRef.once('value', (emailSnapshot) => {
          actions.Username =  emailSnapshot.val();
          clearTimeout(timeOut)
          resolve(true)
         });
      });
    } catch(error) {
      alert(error)
      resolve(false)
    }

    var timeOut = setTimeout(function() {
      resolve(false)}, 10000)
    })
  }

async getUserPosts() {
  return new Promise(function(resolve, reject) {
    try {
      AsyncStorage.getItem('@userID:key').then((value) => {
       var UserID = value
       if (UserID !== null) {
         var query = firebaseApp.database().ref("UserID/" + UserID + "/posts").orderByKey();
         query.once("value")
           .then(function(snapshot) {
             snapshot.forEach(function(childSnapshot) {
               var title,desc,likes = ""
               var postTitleRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + childSnapshot.key + "/title")
               postTitleRef.once('value', (titleSnapshot) => {
                 title = titleSnapshot.val()
               })
               var postDescRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + childSnapshot.key + "/desc")
               postDescRef.once('value', (descSnapshot) => {
                 desc = descSnapshot.val()
               })
               var postLikesRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + childSnapshot.key + "/date")
               postLikesRef.once('value', (likesSnapshot) => {
                 actions.postLikes = likesSnapshot.val()
                 actions.loadAccountPosts(title, desc, childSnapshot.key,likes)
               })
             })
           })
         }
       })
    } catch (error) {
      // Error retrieving data
      alert("There was a problem getting posts")
      resolve(false)
    }
    var timeOut = setTimeout(function() {
      resolve(false)}, 2000)
    })
  }

updateListView(list) {
  this.setState({dataSource: this.state.dataSource.cloneWithRows(list)})
}

  render() {
    if (this.state.loaded == true) {
      return (
      <View style={{backgroundColor:"white", opacity:1, height: actions.height, width:actions.width}}>
        <Text>Loading...</Text>
      </View>
    )
    } else {
      return(
        <View style={{flex:1}}>
            <Image
              style={{resizeMode: 'cover', width: window.width, height: (window.height / 3) }} blurRadius={2} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/Bitmap.png')}/>
            <View style={{position: 'absolute', width:window.width, height: (window.height / 3), flexDirection: "column", justifyContent:"center", alignItems: 'center'}}>
            <Image
            style={{resizeMode: 'cover', height: 76, width: 71}}
            source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/Avatar.png')}/>
            <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}}>{this.state.name}</Text>
            <Text style={{paddingLeft: 50, paddingRight: 50, fontSize: 20, color: "white", backgroundColor: 'rgba(0,0,0,0)'}}>{this.state.profDesc}</Text>
            </View>
            <TouchableOpacity
              style={{position: 'absolute', top:5, width: window.width, height:60}}
              onPress={() => {this.closeList()}}>
            </TouchableOpacity>
            <Animated.View style={{flexGrow:1, transform: [{translateY: this.listYValue}]}}>
              <ListView
                onScroll={() => {this.showList()}}
                enableEmptySections={true}
                style={{backgroundColor:'white', paddingLeft: 10, paddingRight: 10,  width: window.width}}
                contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
                dataSource={this.state.dataSource}
                renderRow={(rowData, sec, i) =>
                <View style={{alignSelf: 'flex-start', width:(window.width / 2) - 20}}>
                  <Text style={{fontSize: 25}}> {rowData.TITLE}</Text>
                  <TouchableHighlight
                    onPress={() => {this.showPosts(), this.listView.scrollTo({ x:window.width * i, y:0, animated:false })}}>
                      <Image
                        style={{resizeMode: 'cover', width: window.width / 2, height: window.height / 6}} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/luggageCase.jpg')}/>
                  </TouchableHighlight>
                  <Text style={{fontSize: 15}}> {rowData.DESC.slice(0,45)}...</Text>
                </View>
                }
                renderFooter={() => <View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
                  <Text style={{fontSize: 20}}>Nothing more to see here...</Text>
                  <Text style={{height: 100}}>                           </Text>
                </View>}
              />

            </Animated.View>

            <Animated.View style={{flexGrow:1, position:'absolute', backgroundColor:'white', transform: [{translateX: this.postXValue}]}}>
              <ListView ref={component => this.listView = component}
                enableEmptySections={true}
                style={{position: 'absolute', top: 0, left: 0, height: window.height, width:window.width}}
                contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
                horizontal={true}
                dataSource={this.state.dataSource}
                renderRow={(rowData) =>
                <View style={{width:actions.width, backgroundColor:'white'}}>
                  <View style={styles.Imagecontainer}>
                    <Image
                      style={styles.postImage} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/luggageCase.jpg')}/>
                  </View>
                  <View style={styles.userContainer}>
                    <Image
                      style={styles.profileIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/Avatar.png')}/>
                    <Text style={styles.userName}>{rowData.TITLE}</Text>
                      <Image
                        style={styles.ClockIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/ClockIcon.png')}/>
                      <Text style={styles.dateStyle}>{moment(rowData.DATE, "MMDDYYYYhmmss").format('MMMM Do, h:mma')}</Text>
                      <Image
                        style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/LikeIcon.png')}/>
                      <Text style={styles.likeNumber}>{rowData.LIKES}</Text>
                    <Text style={styles.postDesc}>{rowData.DESC}</Text>
                  </View>
                  <View style={styles.buttons}>
                    <TouchableHighlight onPress={() => this.likePost(rowData.USERID,rowData.DATE).then(() => {this.newGetPosts().then(() => {actions.getPostList().then(() => {this.updateListView()})})})} underlayColor="#f1f1f1">
                      <Image
                        style={styles.LikeButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/LikeButton.png')}/>
                    </TouchableHighlight>
                    <Image
                      style={styles.CommentButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/CommentIcon.png')}/>
                    <Image
                      style={styles.OptionsButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/OptionsIcon.png')}/>
                  </View>
                </View>}
                />
            </Animated.View>
          </View>
      )
    }
  }


    componentWillMount() {
      actions.userPosts = []
      this.closeList()
      this.getAccountInfo().then((result) => {
        if (result == true) {
          this.getUserPosts().then(() => {
            actions.getAccountPostList().then((list) => {
              this.updateListView(list)
              this.setState({name: actions.name})
              this.setState({profDesc: actions.profDesc})
              this.setState({Username: actions.Username})
              this.setState({loaded: false})
            })

          })
        }
      })
    };

  showList () {
    Animated.sequence([
      Animated.timing(
        this.listYValue,
        {
          toValue: -150,
          duration: 200,
          easing: Easing.linear
        }
      )
    ]).start()
  };
  closeList () {
    Animated.sequence([
      Animated.timing(
        this.listYValue,
        {
          toValue: 0,
          duration: 200,
          easing: Easing.linear
        }
      )
    ]).start()
  };
    showPosts () {
      Animated.sequence([
        Animated.timing(
          this.postXValue,
          {
            toValue: 0,
            duration: 550,
            easing: Easing.linear
          }
        )
      ]).start()
    };
    closePosts () {
      Animated.sequence([
        Animated.timing(
          this.postXValue,
          {
            toValue: 1000,
            duration: 550,
            easing: Easing.linear
          }
        )
      ]).start()
  };
}

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
    resizeMode: 'cover',
    width: window.width
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
    position: 'absolute',
    top: 385,
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
