import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  DeviceEventEmitter,
  ToastAndroid
} from "react-native";
import Hamburger from "../Hamburger";
import SharedPics from "./SharedPics";
import FileSystem from "react-native-filesystem";
import SharedGroups from "./SharedGroups";
import LoginPage from "./LoginPage";
import Settings from "./Settings";
import AudioFloatingWidget from "react-native-audio-floating-widget";
import { createStackNavigator, createAppContainer } from "react-navigation";
class HomePageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shown: false
    };
  }
  componentWillMount() {
    // this package has eventListeners that you can manage via DeviceEventEmitter;
    /* var ifNew
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    firebase.database().ref('/users/' + fileContents).once('value').then(function(snapshot) {
       username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
      
    });*/
    DeviceEventEmitter.addListener("onPlayPauseClicked", params => {
      alert(params.isPlaying);
      ToastAndroid.show("A pikachu appeared nearby !", ToastAndroid.SHORT);
    });

    //please view available methods in docs
  }
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
  async readFile() {
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    Alert.alert(fileContents);
  }
  render() {
    return (
      <View>
        <Text>Hi</Text>
        <Button title="Hi" onPress={this.readFile} />
        <Button
          title="Close Widget"
          onPress={() => {
            if (this.state.shown) {
              AudioFloatingWidget.hide();
              this.setState({ shown: false });
            } else {
              AudioFloatingWidget.show();
              this.setState({ shown: true });
            }
          }}
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
