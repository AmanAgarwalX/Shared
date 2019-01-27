import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button
} from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes
} from "react-native-google-signin";
import config from "../config";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Hamburger from "../Hamburger";
import Navigator from "./HomePageScreen";
import firebase from "react-native-firebase";
class Settings extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Settings",
      headerLeft: (
        <Hamburger
          type="arrow"
          color="blue"
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      ),
      headerRight: <View />,
      headerTitleStyle: {
        textAlign: "center",
        flex: 1
      },
      headerStyle: {
        backgroundColor: "white"
      },
      headerTintColor: "black"
    };
  };
  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button onPress={this._signOut} title="Log out" />
      </View>
    );
  }
  _signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await firebase.auth().signOut();
      this.props.navigation.navigate("Login");
    } catch (error) {}
  };
}
const SettingsNavigator = createStackNavigator(
  {
    Settings: { screen: Settings }
  },
  { initialRouteName: "Settings" }
);
export default SettingsNavigator;
