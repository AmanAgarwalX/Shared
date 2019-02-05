import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  ScrollView
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
      uid: null,
      groups: []
    };
  }
  createGroup = () => {
    this.props.navigation.navigate("CreateNewGroups");
  };
  componentWillMount() {
    this.doThings();
  }
  doThings = async () => {
    const uid = await this.readFile();
    this.setState({ uid });
  };
  readFile = async () => {
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    return new Promise(resolve => {
      resolve(fileContents);
    });
  };
  displayGroups = async () => {
    await this.getGroups();
  };
  getGroups = async () => {
    console.log(this.state.uid);
    var groups = [];
    return firebase
      .database()
      .ref("/users/" + this.state.uid + "/groups/")
      .on("child_added", snap => {
        firebase
          .database()
          .ref("/groups/")
          .child(snap.key)
          .on("value", childSnap => {
            console.log("1", childSnap.val());
            groups = groups.concat(childSnap.val());
            console.log(groups);
            this.setState({ groups });
          });
        //  groups.push(group);
      });
  };
  render() {
    return (
      <ScrollView style={{ flex: 1 }}>
        <Text>groups</Text>
        {this.state.groups.map(group => (
          <View style={{ flexDirection: "row" }}>
            <Text style={{ marginTop: 5 }}>
              {" "}
              {group.name}
              {`\n`}
            </Text>
          </View>
        ))}
        <Button title="Get Groups" onPress={this.displayGroups} />
      </ScrollView>
    );
  }
}
