import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button
} from "react-native";
import FileSystem from "react-native-filesystem";
import firebase from "react-native-firebase";
import CreateNewGroups from "./CreateNewGroups";
import SharedGroupsScreen from "./SharedGroupsScreen";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Hamburger from "../Hamburger";

const SharedGroupsNavigator = createStackNavigator(
  {
    SharedGroupsScreen: { screen: SharedGroupsScreen },
    CreateNewGroups: { screen: CreateNewGroups }
  },
  { initialRouteName: "SharedGroupsScreen" }
);
export default SharedGroupsNavigator;
