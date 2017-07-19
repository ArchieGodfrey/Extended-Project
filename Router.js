import React from 'react';
import { StackNavigator,TabNavigator  } from 'react-navigation';

import Feed from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/feedComponent'
import UserDetail from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/otherUserAccount'
import Account from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/accountComponent'
import Search from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/searchComponent'
import NewPost from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/newPostComponent'

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const FeedStack = StackNavigator({
  Home: {
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
  NewPost: {
    screen: NewPost,
    navigationOptions: {
      title: 'Create a post',
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  },
  }, {
    headerMode: 'none',
  }
);

const AccountStack = StackNavigator({
  Account: {
    screen: Account,
    navigationOptions: {
      title: 'Account',
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  },
  UserDetail: {
    screen: UserDetail,
    navigationOptions: {
      /*title: ({state}) => `${state.params.USERID}`,*/
      header: ({state}) => ({backTitle: null, tintColor:'black'})

    },
  },
  }, {
    headerMode: 'none',
  }
);

const SearchStack = StackNavigator({
  Search: {
    screen: Search,
    navigationOptions: {
      title: 'Search',
      header: ({state}) => ({backTitle: null, tintColor:'black'}),
    },
  },
  UserDetail: {
    screen: UserDetail,
    navigationOptions: {
      /*title: ({state}) => `${state.params.USERID}`,*/
      header: ({state}) => ({backTitle: null, tintColor:'black'}),
    },
  },
  }, {
    headerMode: 'none',
  }
);

export default MainNavigation = TabNavigator({
  Account: {
    screen: AccountStack,
  },
  Feed: {
    screen: FeedStack
  },
  Search: {
    screen: SearchStack,
  },
},{
    initialRouteName: "Account",
    tabBarPosition: 'none',
    swipeEnabled: true,
    animationEnabled: true,
    headerMode: 'none',
    tabBarOptions: {
    labelStyle: {
      fontSize: 18,
    },
  }
})
