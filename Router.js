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
      title: 'Home',
    },  
  }
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
  }
  }, {
    headerMode: 'none',
  }
);

const UserDetailStack = StackNavigator({
  UserDetail: {
    screen: UserDetail,
    navigationOptions: {
      title: ({state}) => `${state.params.USERID}`,
      headerLeft: ({state}) => ({backTitle: "Back", tintColor:'black'}),
      headerBackTitle:"test"
    },
  }
  }
);



const BottomNavigation = TabNavigator({
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
    initialRouteName: "Feed",
    tabBarPosition: 'top',
    swipeEnabled: true,
    animationEnabled: true,
    headerMode: 'none',
    tabBarOptions: {
    labelStyle: {
      fontSize: 18,
    },
  }
})

export default MainNavigation = StackNavigator({
  Home: {
    screen: BottomNavigation,
  },
  UserDetail: {
    screen: UserDetailStack,
    navigationOptions: {
      title: ({state}) => `${state.params.USERID}`,
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  },
  NewPost: {
    screen: NewPost,
    navigationOptions: {
      title: 'Create a post',
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  }
}, {
    headerMode: 'none',
  })
