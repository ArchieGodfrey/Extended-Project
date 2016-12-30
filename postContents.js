import actions from "ExtendedProject/Actions"
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
  }
  render() {
  return (
    <View>
      <View style={styles.Imagecontainer}>
        <Image
          style={styles.postImage} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/luggageCase.jpg')}/>
      </View>
      <View style={styles.userContainer}>
        <Image
          style={styles.profileIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/Avatar2.png')}/>
        <Text style={styles.userName}>{actions.postTitle}</Text>
          <Image
            style={styles.ClockIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/ClockIcon.png')}/>
          <Text style={styles.dateStyle}>4 Days Ago...</Text>
          <Image
            style={styles.LikeIcon} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/LikeIcon.png')}/>
          <Text style={styles.likeNumber}>100</Text>
        <Text style={styles.postDesc}>Description</Text>
      </View>

      <View style={styles.buttons}>
        <Image
          style={styles.LikeButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/LikeButton.png')}/>
        <Image
          style={styles.CommentButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/CommentIcon.png')}/>
        <Image
          style={styles.OptionsButton} source={require('/Users/archiegodfrey/Desktop/ReactNativeApp/ExtendedProject/OptionsIcon.png')}/>
      </View>
      </View>
  )
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
