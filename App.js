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
import { createStore, applyMiddleware } from "redux";
import config from "./config";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { createSwitchNavigator, createAppContainer } from "react-navigation";
const initialState = {
  test: 0,
  uid: null
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "INCREASE_TEST":
      return { ...state, test: state.test + 1 };
    case "SET_UID":
      console.log("Called", action.uid);
      return { ...state, uid: action.uid };
  }
  return state;
};

const store = createStore(reducer, applyMiddleware(thunk));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
    );
  }
}
export default App;
