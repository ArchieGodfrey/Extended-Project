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
      tabBarIcon: () => (
      <Image
        source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/UserIcon.png')}
        style={{resizeMode: 'cover', height:50,width:50}}
      />
    ),
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
    labelStyle: {
      fontSize: 18,
    },
      tabs: {
        Settings: {
            activeIcon: 
              <Image source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/SettingsIcon.png')}
                style={{resizeMode: 'cover', height:20,width:20}}
              />
        },
      }
    }
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

const NewPostStack = StackNavigator({
  NewPost: {
    screen: NewPost,
    navigationOptions: {
      title: 'Edit Post',
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  }
  }
);

const BottomNavigation = TabNavigator({
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
    animationEnabled: true,
    headerMode: 'none',
    tabBarOptions: {
    labelStyle: {
      fontSize: 18,
    },
  }
})

const MainNavigation = StackNavigator({
  Home: {
    screen: BottomNavigation,
    navigationOptions: {
      gesturesEnabled : false,
      animationEnabled: false,
    }
  },
  UserDetail: {
    screen: UserDetailStack,
    navigationOptions: {
      title: ({state}) => `${state.params.USERID}`,
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
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
