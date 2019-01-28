import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button
} from "react-native";
import Hamburger from "../Hamburger";
import SharedPics from "./SharedPics";
import FileSystem from "react-native-filesystem";
import SharedGroups from "./SharedGroups";
import LoginPage from "./LoginPage";
import Settings from "./Settings";
import { createStackNavigator, createAppContainer } from "react-navigation";

class HomePageScreen extends Component {
  constructor(props) {
    super(props);
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
