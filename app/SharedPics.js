import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Hamburger from "../Hamburger";
class SharedPics extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Shared Pics",
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
      <View style={{ flex: 1 }}>
        <Text>HiHello</Text>
      </View>
    );
  }
}
const SharedPicsNavigator = createStackNavigator(
  {
    SharedPics: { screen: SharedPics }
  },
  { initialRouteName: "SharedPics" }
);
export default SharedPicsNavigator;
