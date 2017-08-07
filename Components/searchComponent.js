import functions from "/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Functions.js"
import dismissKeyboard from 'dismissKeyboard'
import React, { Component } from 'react';
import {
  Alert,AppRegistry,StyleSheet,Text,View,Animated,Easing,Modal,Image,ListView,ScrollView,RefreshControl, TouchableOpacity, TouchableHighlight, TextInput,Button,AsyncStorage,Dimensions
} from 'react-native';

var moment = require('moment');
const frame = Dimensions.get('window');
var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

class SearchItem extends Component {
    constructor (props) {
        super(props);
        this.state = {
           imageSource:"/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/blackBackground.png", 
           name:"",
        }
    }

    componentWillMount() { 
        const {navigate,USERID} = this.props;
        functions.getDisplayName(this.props.USERID).then((result) => {
            this.setState({name:result})
        })
        functions.getProfilePicture(this.props.USERID).then((image) => {
            this.setState({imageSource:image})
        })
    }

    componentWillReceiveProps(nextProps) {
        functions.getDisplayName(nextProps.USERID).then((result) => {
            if (this.state.name !== result) {
                this.setState({name:result})
            }
        })
        functions.getProfilePicture(nextProps.USERID).then((URI) => {
        if (this.state.imageSource !== URI) {
            this.setState({imageSource:URI})
        }
        })
  }

  optionsPressed() {
    functions.getFromAsyncStorage("@userID:key").then((ID) => {
      if (ID !== this.props.USERID) {
        functions.checkIfUserBlocked(ID,this.props.USERID).then((blocked) => {
            if (blocked == false) {
                Alert.alert(
                    'Post Options',
                    "Are you sure you want to block this user?",
                    [
                        {text: 'Block', onPress: () => {
                        functions.blockUser(ID,this.props.USERID)
                        }},
                        {text: 'Cancel', style: 'cancel'},
                    ],
                        { cancelable: true }
                    ) 
            } else {
                Alert.alert(
                    'Post Options',
                    "Are you sure you want to unblock this user?",
                    [
                        {text: 'Unblock', onPress: () => {
                        functions.unblockUser(ID,this.props.USERID)
                        }},
                        {text: 'Cancel', style: 'cancel'},
                    ],
                        { cancelable: true }
                    ) 
            }
        })
      }      
    })
  }
    
    render() {
        if (this.props.USERID !== "null") {
            return(
            <View style={{paddingTop:(frame.width / 80), 
              flexDirection:"row",alignItems:'center',width:(frame.width)}} >
                <TouchableHighlight underlayColor="#f1f1f1" onPress={() => 
                    {this.props.navigate('UserDetail', { USERID:  this.props.USERID })}}>
                    <View style={{paddingLeft:(frame.width / 80), flexDirection:'row',alignItems:'center'}}>
                      <Image 
                        style={{resizeMode: 'cover', height: (frame.width / 8), width: (frame.width / 8)}}
                        source={{uri: this.state.imageSource}}/>
                      <Text style={{fontSize:24,paddingLeft:(frame.height / 80)}} >{this.state.name}</Text>
                    </View>
                </TouchableHighlight>
                <View style={{position:'absolute',right:(frame.width/40),flexDirection:'row'}}>
                    <TouchableHighlight underlayColor="#f1f1f1" onPress={() => this.optionsPressed()}>
                        <Image style={{resizeMode: 'contain',resizeMode:'center',marginTop:(frame.height / 80)}} 
                        source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/MenuIcon.png')}/>
                    </TouchableHighlight>
                </View>
            </View>
        )
        } else {
            return(
                <Text style={{fontSize:24,paddingLeft:(frame.height / 80)}} >No users on this list</Text>
            )
        }
    }
}

class SearchContainer extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      refreshing: false,
      search:"",
    }
  }

  searchForUser(searchQuery) {
      this.setState({search: searchQuery})
      if (searchQuery !== "") {
        functions.searchForUser(searchQuery).then((result) => {
          if (result !== null) {
            this.setState({dataSource: this.state.dataSource.cloneWithRows(result)})
          }
        })
      }
    }

  render() {
    return(
      <View style={{flex:0.5}}>
        <TextInput
          style={{fontSize:24, height:(frame.height / 16),borderColor:'grey',borderBottomWidth:0.5
            ,paddingLeft:(frame.width / 80)}}
          placeholder={"Search"}
          value={this.state.search}
          onChange={(event) => this.searchForUser(event.nativeEvent.text)}
          maxLength={20}/>
          <ListView
            enableEmptySections={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{flexDirection: 'column'}}
            horizontal={false}
            dataSource={this.state.dataSource}
            renderRow={(rowData, s, i) =>
            <View >
              <SearchItem USERID={rowData.USERID}
              navigate={this.props.navigate}/>
            </View>
            }
          />     
      </View>
    )
  }
}

class SuggestionsContainer extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      refreshing: false,
      search:"",
    }
  }

  componentWillMount() {
    getSuggestions().then((result) => {
      this.setState({dataSource: this.state.dataSource.cloneWithRows(result)})
    })
    
  }

  render() {
    return(
      <View style={{flex:0.5,marginTop:(frame.height / 40),backgroundColor:'white'
          }} >
        <Text style={{fontSize:24,marginLeft:(frame.width / 80)}}>Suggestions:</Text>
        <ListView
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexDirection: 'column'}}
          horizontal={false}
          dataSource={this.state.dataSource}
          renderRow={(rowData, s, i) =>
          <View >
            <SearchItem USERID={rowData.USERID}
            navigate={this.props.navigate}/>
          </View>
          }
        /> 
      </View>    
    )
  }
}

export default class SearchPage extends Component {
  render() {
    return(
      <ScrollView keyboardShouldPersistTaps="never" scrollEnabled={false} style={{flex:1,backgroundColor:"white"}}>
        <SearchContainer navigate={this.props.navigation.navigate}/>
        <SuggestionsContainer navigate={this.props.navigation.navigate}/>
      </ScrollView>
    )
  }
}

function getSuggestions() {
  return new Promise(function(resolve, reject) {
    var suggestions = []
    var increment = 0
    functions.getFromAsyncStorage("@userID:key").then((ID) => {//get ID
      functions.getArray(ID,"following").then((originalList) => {//get first list
        originalList.map(function(item, index,arr) {//for every user in the original list
          increment = increment + 1 
          functions.getArray(item,"following").then((firstList) => {//get the first list
            if (arr[index+1] !== null) {
              functions.getArray(arr[index+1],"following").then((secondList) => {//get the second list
                firstList.map(function(first, i) { //for every user in the first list
                  secondList.map(function(second, i) {//for every user in the second list
                    if (first == second) {//if there's a match
                      if (first !== ID) {
                        suggestions.push({USERID:first})//add it to suggestions
                      }
                    }
                    if (increment == originalList.length) {
                      clearTimeout(timeOut)
                      resolve(suggestions)
                    }
                  })
                })
              })
            }
          })
        })
      })
    })
    let timeOut = setTimeout(function() {
        resolve(null)}
    , 100000)
    })
}

/*export default class SearchContents extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
    searchQuery: "",
    resultsOpacity: 0,
    dataSource: ds.cloneWithRows([]),
    searchResults: ds.cloneWithRows([]),
    otherUserID: "",
    otherName: "Loading",
    otherProfDesc: "Loading",
    following: "Loading",
    key:0,
    showAccount:0,
  }
  this.otherAccountValue = new Animated.Value(-500)
}

searchForUser (searchQuery) {
  this.setState({resultsOpacity:1})
    actions.foundUsers = []
    this.searchUsers(searchQuery).then((result) => {
      if (result == false) {
        alert('Could not find any users with that name')
        this.setState({resultsOpacity:0})
        this.getResults()
      } else {
        this.getResults()
      }
    })
    dismissKeyboard()
}

searchUsers(searchQuery) {
  return new Promise(function(resolve, reject) {
    var found = false
    var query = firebaseApp.database().ref("UserID").orderByKey();
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          // key will be "ada" the first time and "alan" the second time
          var key = childSnapshot.key;
          // childData will be the actual contents of the child
          //alert(childSnapshot.key)
          var newRef = firebaseApp.database().ref("UserID/" + childSnapshot.key + "/Name")
          //alert(newRef)
          newRef.once("value")
            .then(function(newSnapshot) {
              if (searchQuery == newSnapshot.val()) {
                found = true
                actions.searchFunction(childSnapshot.key, newSnapshot.val())
              }
            })
          })
        })
        setTimeout(function() {
          resolve(found)}, 2000)
      })
}

getResults() {
  this.setState({searchResults: this.state.searchResults.cloneWithRows(actions.foundUsers)})
  this.setState({resultsOpacity:0})
}

downloadImage(otherUserID) {
  return new Promise(function(resolve, reject) {
    var Realurl = ""
    var Realurl2 = ""
    firebaseApp.storage().ref('Users/' + otherUserID).child('Profile').getDownloadURL().then(function(url) {
      Realurl = url
      firebaseApp.storage().ref('Users/' + otherUserID).child('Background').getDownloadURL().then(function(url2) {
        Realurl2 = url2
        resolve([Realurl, url2])
      }).catch((error) =>  {
        firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
          Realurl2 = url2
          resolve([Realurl, Realurl2])
        })
      })
    }).catch((error) => {
      firebaseApp.storage().ref('blackBackground.png').getDownloadURL().then(function(url) {
        Realurl = url
        firebaseApp.storage().ref('Users/' + otherUserID).child('Background').getDownloadURL().then(function(url2) {
          Realurl2 = url2
          resolve([Realurl, url2])
        }).catch((error) =>  {
          firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
            Realurl2 = url2
            resolve([Realurl, Realurl2])
          })
        })
      })
    })

  })
}

showAccountInfo(otherUserID) {
  this.setState({otherUser: otherUserID})
  this.setState({showAccount:1})
  //this.navigator && this.navigator.dispatch({ type: 'Navigation/NAVIGATE', routeName: 'UserDetail' });
  this.props.navigation.navigate('UserDetail', { USERID:  otherUserID })
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
        <View>
          <Text style={{position: 'absolute', top: 10, left: 150, fontSize: 25}}>Search</Text>
          <TextInput
          style={{position: 'absolute', top: 50, left: 40, height: 40, width: 225, borderColor: 'gray', borderWidth: 1}}
          placeholder={' Search for a name'}
          onChange={(event) => this.setState({searchQuery: event.nativeEvent.text})}
          ref={component => this._titleInput = component}
          />
        <TouchableHighlight onPress={() => this.searchForUser(this.state.searchQuery)} style={{position: 'absolute', top: 60, left: 275}} underlayColor="#f1f1f1">
            <Text style={{fontSize: 20}}>Search</Text>
        </TouchableHighlight>
        <Text style={{opacity: this.state.resultsOpacity, position: 'absolute', top: 100, left: 40, fontSize: 20}}>Searching...</Text>
          <ListView
            enableEmptySections={true}
            style={{position: 'absolute', top: 150, left: 25}}
            dataSource={this.state.searchResults}
            renderRow={(rowData) =>
            <TouchableHighlight style={{height:40, width:325, borderColor: "black", borderWidth:1, justifyContent: "center"}} onPress={() => this.showAccountInfo(rowData.USERID)}>
              <Text  style={{fontSize: 25}}> {rowData.NAME}</Text>
            </TouchableHighlight>}
          />
        </View>
      )}
    }
  componentWillMount() {
    this.setState({loaded:false})
    const {navigate} = this.props;
  }

  showOtherAccount() {
    Animated.sequence([
      Animated.timing(
        this.otherAccountValue,
        {
          toValue: 0,
          duration: 250,
          easing: Easing.linear
        }
      )
    ]).start()
  }

  closeOtherAccount() {
    Animated.parallel([
      Animated.timing(
        this.otherAccountValue,
        {
          toValue: -500,
          duration: 250,
          easing: Easing.linear
        }
      ),
    ]).start()
  }

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
});*/
