import React, { Component } from "react";
import {
  createStackNavigator,
  createAppContainer,
  createDrawerNavigator
} from "react-navigation";
import HomePageScreen from "./HomePageScreen";
import SharedPics from "./SharedPics";
import SharedGroups from "./SharedGroups";
import Settings from "./Settings";
const DrawerNavigator = createDrawerNavigator(
  {
    HomePage: { screen: HomePageScreen },
    SharedPics: { screen: SharedPics },
    SharedGroups: { screen: SharedGroups },
    Settings: { screen: Settings }
  },
  {
    initialRouteName: "HomePage"
  }
);
export default DrawerNavigator;
