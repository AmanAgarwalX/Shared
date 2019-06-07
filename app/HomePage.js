import React, { Component } from "react";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import HomePageScreen from "./HomePageScreen";
import Icon from "react-native-vector-icons/FontAwesome";
import { AppRegistry, CameraRoll, ToastAndroid, View } from "react-native";
import ReactNativeDetectNewPhoto from "react-native-detect-new-photo";
import { Banner } from "react-native-paper";
import { togglepause, isShown } from "./floating";
import SharedGroups from "./SharedGroups";
import Settings from "./Settings";
import firebase from "react-native-firebase";

const DrawerNavigator = createMaterialBottomTabNavigator(
  {
    HomePage: {
      screen: HomePageScreen,
      navigationOptions: {
        tabBarLabel: "Home",
        tabBarIcon: ({ tintColor }) => (
          <View>
            <Icon style={[{ color: tintColor }]} size={25} name={"home"} />
          </View>
        )
      }
    },
    SharedGroups: {
      screen: SharedGroups,
      navigationOptions: {
        tabBarLabel: "Shared Groups",
        tabBarIcon: ({ tintColor }) => (
          <View>
            <Icon style={[{ color: tintColor }]} size={25} name={"group"} />
          </View>
        )
      }
    },
    Settings: {
      screen: Settings,
      navigationOptions: {
        tabBarLabel: "You",
        tabBarIcon: ({ tintColor }) => (
          <View>
            <Icon
              style={[{ color: tintColor }]}
              size={25}
              name={"user-circle"}
            />
          </View>
        )
      }
    }
  },
  {
    initialRouteName: "HomePage",
    defaultNavigationOptions: { header: null },
    lazy: true,
    tabBarPosition: "bottom",
    tabBarOptions: {
      showIcon: true
    }
  }
);
export default DrawerNavigator;
