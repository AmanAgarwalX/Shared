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
import { PersistGate } from "redux-persist/integration/react";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import firebase from "react-native-firebase";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import HomePage from "./app/HomePage";
import { createStore, applyMiddleware } from "redux";
import SplashScreen from "react-native-splash-screen";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import config from "./config";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { createSwitchNavigator, createAppContainer } from "react-navigation";
const persistConfig = {
  key: "root",
  storage: storage,
  stateReconciler: autoMergeLevel2 // see "Merge Process" section for details.
};
const initialState = {
  test: 0,
  uid: null,
  groups: [],
  sharing_with: 0,
  user: null,
  current_group: null,
  access_token: null
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "INCREASE_TEST":
      return { ...state, test: state.test + 1 };
    case "SET_UID":
      console.log("Called", action.uid);
      return { ...state, uid: action.uid };
    case "SET_ACCESS_TOKEN":
      console.log("Called", action.access_token);
      return { ...state, access_token: action.access_token };
    case "UPDATE_GROUPS":
      console.log("Called", action.groups);
      return { ...state, groups: action.groups };
    case "UPDATE_SHARING_WITH":
      console.log("Called", action.sharing_with);
      return { ...state, sharing_with: action.sharing_with };
    case "SET_USER_INFO":
      console.log("Called", action.user);
      return { ...state, user: action.user };
    case "CURRENT_GROUP":
      console.log("Called", action.current_group);
      return { ...state, current_group: action.current_group };
    case "LOGOUT":
      console.log("Called Logout");
      return {
        ...state,
        test: 0,
        uid: null,
        groups: [],
        sharing_with: 0,
        user: null,
        current_group: null,
        access_token: null
      };
  }
  return state;
};
const pReducer = persistReducer(persistConfig, reducer);
export const store = createStore(pReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: "#c75c5c",
    accent: "#77b3d4",
    background: "#e0e0d1",
    text: "#4f5d73"
  }
};
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialRoute: null
    };
  }
  async componentWillMount() {
    this._configureGoogleSignIn();
    const channel = new firebase.notifications.Android.Channel(
      "test-channel",
      "Test Channel",
      firebase.notifications.Android.Importance.Low
    ).setDescription("My apps test channel");

    // Create the channel
    firebase.notifications().android.createChannel(channel);
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const newNotification = new firebase.notifications.Notification().android
          .setChannelId("test-channel")
          .setTitle(notification.title)
          .setBody(notification.body)
          .android.setAutoCancel(true)
          .android.setCategory(firebase.notifications.Android.Category.Alarm);
        firebase.notifications().displayNotification(newNotification);
      });
    await this.isSignedIn();
  }

  _configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: config.webClientId,
      offlineAccess: false
    });
  }
  componentDidMount() {
    SplashScreen.hide();
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
        <PersistGate loading={null} persistor={persistor}>
          <PaperProvider theme={theme}>
            <AppContainer />
          </PaperProvider>
        </PersistGate>
      </Provider>
    );
  }
}
export default App;
