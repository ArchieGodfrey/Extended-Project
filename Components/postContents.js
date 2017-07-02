import actions from "EP/Actions"
import React, { Component } from 'react';
import {
  StyleSheet,Text,View,Animated,Easing,Modal,Image,Navigator, TouchableHighlight, TextInput,Button
} from 'react-native';

export default class PostContents extends Component {
  constructor (props) {
    super(props);
    this.state = {
    modalVisible: false,
    textEntered: false,
    Username: "",
    password: "",
    postTitle: "",
    postDesc: "",
    postImage: "",
    postDate: "",
    Following: []
  }
    this.postTitle = "Original"
    this.postDesc = "Original"
    this.postList = []
    this.post = null
    this.postTitleList = []
    this.postDescList = []
    this.visible = false
    this.UserID = ""
    this.Username = ""
    this.password = ""
    this.date = ""
}

loadPost(title,desc,date) {
  this.postTitle = title
  this.postDesc = desc
  this.date = date
  this.postList.push({TITLE: title,
                      DESC: desc,
                      DATE: date}
                      )
  //alert(this.postTitle)
  this.postTitleList.push(title)
  this.postDescList.push(desc)
  this.postList.sort((num1, num2) => {
    if (num1.DATE < num2.DATE) {
      return 1;
    }
    if (num1.DATE > num2.DATE) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
  this.readArray(this.postList)

  //var newArr = this.sortArray(this.postList)
}

readArray(array) {
  return array.map(function(item, i) {
    alert("The post is " + item.TITLE + item.DESC + item.DATE + i)
  })
}

  wholePost() {
  return actions.postList.map(function(post){
    alert("The post date is" + post.DATE)
    return(
      <View style={{flex:1}} key={post.DATE}>
        <Text>{post.TITLE}</Text>
        <View>
          <Text>{post.TITLE}</Text>
        </View>
      </View>
    );
  });
}

render() {
  return(
    <View style={{flex:1}}>
      {this.wholePost()}
    </View>
  )
}
  /*
  render() {
  return (
    <View>
      <View style={styles.Imagecontainer}>
        <Image
          style={styles.postImage} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/luggageCase.jpg')}/>
      </View>
      <View style={styles.userContainer}>
        <Image
          style={styles.profileIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/Avatar2.png')}/>
        <Text style={styles.userName}>{actions.postTitle}</Text>
          <Image
            style={styles.ClockIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/ClockIcon.png')}/>
          <Text style={styles.dateStyle}>4 Days Ago...</Text>
          <Image
            style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/LikeIcon.png')}/>
          <Text style={styles.likeNumber}>100</Text>
        <Text style={styles.postDesc}>Description</Text>
      </View>

      <View style={styles.buttons}>
        <Image
          style={styles.LikeButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/LikeButton.png')}/>
        <Image
          style={styles.CommentButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/CommentIcon.png')}/>
        <Image
          style={styles.OptionsButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/EP/OptionsIcon.png')}/>
      </View>
      </View>
  )
}*/

componentHasMounted() {

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
