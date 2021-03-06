import functions from "/Users/archiegodfrey/Desktop/GitHub/Project/Functions"
import PostComponent from "/Users/archiegodfrey/Desktop/GitHub/Project/Components/postComponent"
import { NavigationActions } from 'react-navigation'
import React, { Component } from 'react';
import {
  AppRegistry,Alert,StyleSheet,Text,View,Animated,Easing,Image,ListView,RefreshControl, TouchableHighlight, TouchableOpacity,TextInput,Button,AsyncStorage,Dimensions,Platform
} from 'react-native';

var moment = require('moment');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage");

const frame = Dimensions.get('window');

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({ routeName: 'SignIn' }),
    ],
    key: null
});

export default class Timeline extends Component {
  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      tempList:[],
      refreshing: false,
      limit:"",
    }
  }

  componentDidMount() {
    const {navigate} = this.props.navigation;
    /*tryLoadCache().then((OldPosts) => { //Works but SLOW
      this.setState({dataSource: this.state.dataSource.cloneWithRows(OldPosts)})
    })*/
    functions.getFromAsyncStorage("@userID:key").then((UserID) => {
      if (UserID !== null) {
        functions.getTimeline(UserID,8).then((MostRecentPosts) => {
            this.setState({dataSource: this.state.dataSource.cloneWithRows(dedupe(MostRecentPosts))})
            this.setState({tempList: MostRecentPosts})
            this.setState({limit: (Number(MostRecentPosts.length) + Number(this.state.limit)).toString()})
          //saveCache(MostRecentPosts)
      }) 
      } else { //Not Logged In
        this.props.navigation.dispatch(resetAction)
      } 
    })
  }

  transition(location) {
    this.props.navigation.navigate(location)
  }

  _onRefresh() {
      this.setState({refreshing: true});
      functions.getFromAsyncStorage("@userID:key").then((UserID) => {
        if (UserID !== null) {
          functions.getTimeline(UserID,8).then((MostRecentPosts) => {
            this.setState({dataSource: this.state.dataSource.cloneWithRows(dedupe(MostRecentPosts))})
            this.setState({refreshing: false});
            this.setState({limit: (Number(MostRecentPosts.length) + Number(this.state.limit)).toString()})
          //saveCache(MostRecentPosts)
          }) 
        }
      })  
    }

    returnLastValue(arr) {
      return new Promise(function(resolve, reject) {
        var increment = 0
        arr.map(function(item) {
          increment ++
            if (increment == arr.length) {
              resolve(item.DATE)
            }
        })
      })
    }

    endReached() {
      functions.getFromAsyncStorage("@userID:key").then((UserID) => {
        if (UserID !== null) {
          functions.getTimeline(UserID,this.state.limit).then((MostRecentPosts) => {
            this.setState({dataSource: this.state.dataSource.cloneWithRows(dedupe(MostRecentPosts))})
            this.setState({limit: (Number(MostRecentPosts.length) + Number(this.state.limit)).toString()})
          })
        }
      })  
    }

  render() {
    return(
        <ListView
        enableEmptySections={true}
        showsVerticalScrollIndicator={false}
        style={{flex:1}}
        contentContainerStyle={{flexDirection: 'column'}}
        horizontal={false}
        dataSource={this.state.dataSource}
        refreshControl={
          <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
          />}
        renderRow={(rowData, s, i) =>
        <View >
          <PostComponent USERID={rowData.USERID} TITLE={rowData.TITLE} 
          LIKES={rowData.LIKES} DESC={rowData.DESC} DATE={rowData.DATE} 
          navigate={this.props.navigation.navigate}/>
        </View>
        }
        renderHeader={() => <View style={{flex:0.25,backgroundColor:'white', marginTop:(frame.height / 80), 
        marginBottom:(frame.height / 80), alignItems: 'center'}}>
        <TouchableHighlight underlayColor="#f1f1f1" onPress={() => {this.transition("NewPost") }}>
          <View style={{flexDirection:'row',alignItems:'center'}} >
             <Image style={{resizeMode: 'center',marginRight:(frame.width / 80)}} 
                  source={require('/Users/archiegodfrey/Desktop/GitHub/Project/Images/PlusIcon.png')}/>
            <Text style={{fontSize: 24}}>New Post</Text>
          </View>
         </TouchableHighlight>
        </View>}
        onEndReached={() => {
          //this.endReached()
        }}
        onEndReachedThreshold={frame.height / 4}
      />     
    )
  }
}

function saveCache(Posts) {
  try {
    AsyncStorage.setItem('@feedCache:key', JSON.stringify(Posts));
  } catch (error) {
    // Error saving feed cache
  }
}

function tryLoadCache() {
  return new Promise(function(resolve, reject) {
    try {
      AsyncStorage.getItem('@feedCache:key').then((list) => {
        if (list != null) {
          clearTimeout(timeOut)
          resolve(JSON.parse(list))
        } else {
          clearTimeout(timeOut)
          resolve(null)
        }
      })
    } catch (error) {
      // Error saving data
    }
    var timeOut = setTimeout(function() {
    resolve(null)}, 10000)
  })
}

function dedupe(arr) {
  return arr.reduce(function (p, c) {

    // create an identifying id from the object values
    var id = [c.DATE].join('|');

    // if the id is not found in the temp array
    // add the object to the output array
    // and add the key to the temp array
    if (p.temp.indexOf(id) === -1) {
      p.out.push(c);
      p.temp.push(id);
    }
    return p;

  // return the deduped array
  }, { temp: [], out: [] }).out;
}