import React from 'react';
import { StackNavigator  } from 'react-navigation';

import Feed from 'EPRouter/feedComponent'
import UserDetail from 'EPRouter/otherUserAccount'
import Account from 'EPRouter/accountComponent'

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database")

export const FeedStack = StackNavigator({
  Feed: {
    screen: Feed,
    navigationOptions: {
      title: 'Feed',
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  },
  UserDetail: {
    screen: UserDetail,
    navigationOptions: {
      title: ({state}) => `${state.params.USERID}`,
      header: ({state}) => ({backTitle: null, tintColor:'black'})

    },
  },
  Account: {
    screen: Account,
    navigationOptions: {
      title: 'Account',
      header: ({state}) => ({backTitle: null, tintColor:'black'})
    },
  },
});
