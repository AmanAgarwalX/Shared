import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button
} from "react-native";
import firebase from "react-native-firebase";
import CreateNewGroups from "./CreateNewGroups";
import SharedGroupsScreen from "./SharedGroupsScreen";
import ViewGroupScreen from "./ViewGroupScreen";
import ViewGroupPicsScreen from "./ViewGroupPicsScreen";
import AddNewUsersScreen from "./AddNewUsersScreen";
import {
  createStackNavigator,
  createAppContainer,
  createSwitchNavigator
} from "react-navigation";
const SharedGroupsNavigator = createStackNavigator(
  {
    SharedGroupsScreen: { screen: SharedGroupsScreen },
    CreateNewGroups: { screen: CreateNewGroups },
    ViewGroupPicsScreen: { screen: ViewGroupPicsScreen },
    ViewGroupScreen: { screen: ViewGroupScreen },
    AddNewUsersScreen: { screen: AddNewUsersScreen }
  },
  { initialRouteName: "SharedGroupsScreen" }
);
SharedGroupsNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  // console.log(navigation.state);
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible
  };
};
export default SharedGroupsNavigator;
