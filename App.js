import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  type
} from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes
} from "react-native-google-signin";
import LoginPage from "./app/LoginPage";
import HomePage from "./app/HomePage";
import firebase from "react-native-firebase";
import config from "./config";
import { createSwitchNavigator, createAppContainer } from "react-navigation";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      error: null,
      initialRoute: null
    };
  }
  async componentWillMount() {
    this._configureGoogleSignIn();
    await this.isSignedIn();
  }

  _configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: config.webClientId,
      offlineAccess: false
    });
  }

  isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) this.setState({ initialRoute: "Home" });
    else this.setState({ initialRoute: "Login" });
  };

  render() {
    const NavigatorObject = {
      Home: {
        screen: HomePage
      },
      Login: { screen: LoginPage }
    };
    var InitalObject = { initialRouteName: null };
    InitalObject.initialRouteName = this.state.initialRoute;
    const AppNavigator = createSwitchNavigator(NavigatorObject, InitalObject);
    const AppContainer = createAppContainer(AppNavigator);
    return <AppContainer />;
  }
}
