import React from 'react';
import { StackNavigator,TabNavigator,NavigationActions  } from 'react-navigation';
import { Image,TouchableHighlight,Text,Dimensions } from 'react-native';

import Feed from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/feedComponent'
import UserDetail from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/otherUserAccount'
import Account from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/accountComponent'
import SignIn from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/SignIn'
import Search from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/searchComponent'
import NewPost from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/newPostComponent'
import Settings from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/settingsComponent'
import AccountPosts from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/AccountPostsComponent'
import EditAccount from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/editAccountComponent'
import Comment from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/CommentComponent'
import ReportPage from '/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Components/ReportPage'

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")
const frame = Dimensions.get('window');

const backAction = NavigationActions.back({})
const BackButton = ({ onPress }) => (
  <TouchableHighlight underlayColor="#f1f1f1" style={{marginLeft:(frame.width / 20)}} onPress={onPress}>
    <Image
      source={require('/Users/archiegodfrey/Desktop/GitHub/Extended-Project/Images/BackIcon.png')}
    />
  </TouchableHighlight>
);

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
    navigationOptions: ({navigation}) => ({
      title: 'Profile',
      headerLeft: (
        <BackButton onPress={() => navigation.dispatch(backAction)}/>
      ),
    }),
  }
  }
);

const AccountPostsStack = StackNavigator({
  AccountPosts: {
    screen: AccountPosts,
    navigationOptions: ({navigation}) => ({
      title: 'Posts',
      headerLeft: (
        <BackButton onPress={() => navigation.dispatch(backAction)}/>
      ),
    }),
  }
  }
);

const NewPostStack = StackNavigator({
  NewPost: {
    screen: NewPost,
    navigationOptions: ({navigation}) => ({
      title: 'Edit Post',
      headerLeft: (
        <BackButton onPress={() => navigation.dispatch(backAction)}/>
      ),
    }),
  }
  }
);

const CommentStack = StackNavigator({
  Comment: {
    screen: Comment,
    navigationOptions: ({navigation}) => ({
      title: 'Comments',
      headerLeft: (
        <BackButton onPress={() => navigation.dispatch(backAction)}/>
      ),
    }),
  }
  }
);

const ReportPageStack = StackNavigator({
  ReportPage: {
    screen: ReportPage,
    navigationOptions: ({navigation}) => ({
      title: 'Report',
      headerLeft: (
        <BackButton onPress={() => navigation.dispatch(backAction)}/>
      ),
    }),
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
  },
  NewPost: {
    screen: NewPostStack,
  },
  AccountPosts: {
    screen: AccountPostsStack,
  },
  EditAccount: {
    screen: EditAccount,
  },
  Comment: {
    screen: CommentStack,
  },
  ReportPage: {
    screen: ReportPageStack,
  }
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
