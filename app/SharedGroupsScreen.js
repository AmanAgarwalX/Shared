import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button
} from "react-native";
import FileSystem from "react-native-filesystem";
import firebase from "react-native-firebase";
import CreateNewGroups from "./CreateNewGroups";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Hamburger from "../Hamburger";
export default class SharedGroupsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Shared Groups",
      headerLeft: (
        <Hamburger
          type="arrow"
          color="blue"
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      ),
      headerRight: (
        <Button
          title="Add New"
          onPress={() => navigation.navigate("CreateNewGroups")}
        />
      ),
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
  constructor(props) {
    super(props);
    this.state = {
      uid: null
    };
  }
  createGroup = () => {
    this.props.navigation.navigate("CreateNewGroups");
  };
  componentWillMount() {
    this.readFile();
  }
  readFile = async () => {
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    this.setState({ uid: fileContents });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text>groups</Text>
      </View>
    );
  }
}
