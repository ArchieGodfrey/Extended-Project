import React from 'react';
import { StackNavigator,TabNavigator  } from 'react-navigation';
import { Image } from 'react-native';

import Feed from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/feedComponent'
import UserDetail from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/otherUserAccount'
import Account from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/accountComponent'
import SignIn from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/SignIn'
import Search from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/searchComponent'
import NewPost from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/newPostComponent'
import Settings from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/settingsComponent'

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

const FeedStack = StackNavigator({
  Feed: {
    screen: Feed,
    navigationOptions: {
      title: 'Feed',
    },  
  }, 
  }, {
    headerMode: 'none',
  }
);

const AccountTab = TabNavigator({
  Settings: {
    screen: Settings,
    navigationOptions: {
      title: 'Settings',
    },
  },
  Account: {
    screen: Account,
    navigationOptions: {
      title: 'Account',
    },
  },
  },{
    initialRouteName: "Account",
    tabBarPosition: 'bottom',
    showIcon:true,
    swipeEnabled: true,
    animationEnabled: true,
    headerMode: 'none',
    tabBarOptions: {
      activeTintColor: '#000000',
      labelStyle: {
        fontSize: 18,
      },
    }
  }
);

const SearchStack = StackNavigator({
  Search: {
    screen: Search,
    navigationOptions: {
      title: 'Search',
    },
  }
  }, {
    headerMode: 'none',
  }
);

const UserDetailStack = StackNavigator({
  UserDetail: {
    screen: UserDetail,
    navigationOptions: ({ navigation }) => ({
      title: `${navigation.state.params.USERID}`,
    }),
  }
  }
);

const NewPostStack = StackNavigator({
  NewPost: {
    screen: NewPost,
    navigationOptions: {
      title: 'Edit Post',
    },
  }
  }
);

const TopNavigation = TabNavigator({
  Account: {
    screen:  AccountTab,
  },
  Feed: {
    screen: FeedStack, 
  },
  Search: {
    screen: SearchStack,
  },
},{
    initialRouteName: "Feed",
    tabBarPosition: 'top',
    swipeEnabled: true,
    showIcon:false,
    animationEnabled: true,
    headerMode: 'none',
    tabBarOptions: {
      activeTintColor: '#000000',
      labelStyle: {
        fontSize: 18,
      },
    }
})

const MainNavigation = StackNavigator({
  Home: {
    screen: TopNavigation,
  },
  UserDetail: {
    screen: UserDetailStack,
    navigationOptions: ({ navigation }) => ({
      title: `${navigation.state.params.USERID}`,
      header: ({navigation}) => ({backTitle: null, tintColor:'black'})
    }),
  },
  NewPost: {
    screen: NewPostStack,
  },
}, {
    headerMode: 'none',
    initialRouteName: "Home",
  })

  export default SignInStack = StackNavigator({
  SignIn: {
    screen: SignIn,
  },
  MainNavigation: {
    screen:MainNavigation,
  },
}, {
    headerMode: 'none',
    initialRouteName: "MainNavigation",
})
