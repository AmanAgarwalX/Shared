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
      isOn: false
    };
  }
  componentDidMount() {
    this.requestFilePermission();
    initiate();
  }
  componentWillMount() {
    // this package has eventListeners that you can manage via DeviceEventEmitter;
    /* var ifNew
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    firebase.database().ref('/users/' + fileContents).once('value').then(function(snapshot) {
       username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
      
    });*/

    //const fileContents = FileSystem.readFile("my-directory/my-file.txt");
    //this.setState({ uid: fileContents });
    this.readFile();
    DeviceEventEmitter.addListener("onPlayPauseClicked", params => {
      //   ToastAndroid.show(String(this.state.isOn), ToastAndroid.SHORT);
    });

    //please view available methods in docs
    /*  alert(this.state.visibleNearby);
    if (this.state.visibleNearby) {
      this.setState({ visibleNearby: false });
      clearInterval(this.state.intervalID._id);

      ToastAndroid.show("Stopped Sharing Location", ToastAndroid.SHORT);
    } else {
      this.setState({ visibleNearby: true });
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(position => {
          firebase
            .database()
            .ref("/users/" + this.state.uid)
            .update({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
        });
        ToastAndroid.show(
          "Make yourself Updated Location",
          ToastAndroid.SHORT
        );
      }, 5000);
      this.setState({ intervalID: intervalId });
    }*/
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
    this.setState({ uid: fileContents });
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
