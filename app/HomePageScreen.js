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
import SharedGroups from "./SharedGroups";
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

  render() {
    return (
      <View>
        <Text>Hi</Text>
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
