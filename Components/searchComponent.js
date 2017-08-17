import functions from "/Users/archiegodfrey/Desktop/GitHub/Project/Functions.js"
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
           imageSource:"/Users/archiegodfrey/Desktop/GitHub/Project/Images/blackBackground.png", 
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
                        <Image style={{resizeMode:'center',marginTop:(frame.height / 80)}} 
                        source={require('/Users/archiegodfrey/Desktop/GitHub/Project/Images/MenuIcon.png')}/>
                    </TouchableHighlight>
                </View>
            </View>
        )
        } else {
            return(
                <Text style={{fontSize:24,paddingLeft:(frame.height / 80)}} >No users to show</Text>
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
      suggestions.push({USERID:"null"})
        resolve(suggestions)}
    , 100000)
    })
}