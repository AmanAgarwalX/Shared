import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  DeviceEventEmitter,
  ToastAndroid,
  PermissionsAndroid
} from "react-native";
import { initiate, show } from "./floating";
import Hamburger from "../Hamburger";
import firebase from "react-native-firebase";
import SharedPics from "./SharedPics";
import FileSystem from "react-native-filesystem";
import SharedGroups from "./SharedGroups";
import LoginPage from "./LoginPage";
import Settings from "./Settings";
//import AudioFloatingWidget from "react-native-audio-floating-widget";
import { createStackNavigator, createAppContainer } from "react-navigation";
var isOn = false;
const OnOff = async () => {
  isOn = !isOn;
  ToastAndroid.show(String(isOn), ToastAndroid.SHORT);
  console.log(isOn);
};
AppRegistry.registerHeadlessTask("OnOff", () => OnOff);
class HomePageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shown: false,
      uid: null,
      isOn: false,
      textContent: null
    };
  }
  mountedComponent = async () => {
    const uid = await this.readFile();
    this.setState({ uid });
  };
  componentDidMount() {
    this.requestFilePermission();
    initiate();
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        // Process your notification as required
        alert(notification.body);
      });
    this.onTokenRefreshListener = firebase
      .messaging()
      .onTokenRefresh(fcmToken => {
        console.log("done");
        firebase
          .database()
          .ref("/users/" + this.state.uid)
          .update({ token: fcmToken });
      });
  }
  componentWillMount() {
    this.mountedComponent();
    DeviceEventEmitter.addListener("onPlayPauseClicked", params => {
      //   ToastAndroid.show(String(this.state.isOn), ToastAndroid.SHORT);
    });
  }
  componentWillUnmount() {
    this.onTokenRefreshListener();
  }
  getLocationHandler = () => {
    navigator.geolocation.getCurrentPosition(position => {
      firebase
        .database()
        .ref("/users/" + this.state.uid)
        .update({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          last_seen: Date.now()
        });
    });
  };
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Home",
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

  readFile = async () => {
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    return new Promise(resolve => {
      resolve(fileContents);
    });
  };
  requestFilePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "File Access Permission",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Another File Access Permission",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };
  render() {
    return (
      <View>
        <Text>Hi</Text>
        <Button
          title="Hi"
          onPress={() => {
            alert(this.state.uid);
          }}
        />
        <Button
          title="Toggle Widget"
          onPress={() => {
            if (this.state.shown) {
              //     AudioFloatingWidget.hide();
              this.setState({ shown: false });
            } else {
              show();
              this.setState({ shown: true });
            }
          }}
        />
        <Button
          title="Show Yourself Nearby"
          onPress={this.getLocationHandler}
        />
        <Text>{this.state.textContent}</Text>
      </View>
    );
  }
}

const HomePageNavigator = createStackNavigator(
  {
    HomePage: { screen: HomePageScreen }
  },
  { initialRouteName: "HomePage" }
);

export default HomePageNavigator;
