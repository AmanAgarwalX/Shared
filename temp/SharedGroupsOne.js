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
import { createStackNavigator, createAppContainer } from "react-navigation";
import Hamburger from "../Hamburger";
class SharedGroups extends Component {
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
  constructor(props) {
    super(props);
    this.state = {
      uid: null,
      usersNearby: [],
      userLast: {},
      latitudes: [],
      longitudes: [],
      lat: null,
      long: null
    };
  }
  getUsers = async () => {
    console.log(this.state.lat, this.state.long);

    var uplat = this.state.lat + 0.002;
    var downlat = this.state.lat - 0.002;
    var uplong = this.state.long + 0.002;
    var downlong = this.state.long - 0.002;

    firebase
      .database()
      .ref("/users/")
      .orderByChild("latitude")
      .startAt(downlat)
      .endAt(uplat)
      .on(
        "child_added",
        function(data) {
          //  if (data.key != this.state.uid) {
          console.log(data.val().gmail);
          console.log(data.val().latitude);
          var longi = data.val().longitude;

          if (longi >= downlong && longi <= uplong) {
            console.log("three", data.val().gmail);
            if (this.state.usersNearby.indexOf(data.val().gmail) == -1) {
              this.setState({
                usersNearby: this.state.usersNearby.concat(data.val().gmail)
              });
              const email = data.val().gmail;
              const last_seen = data.val().last_seen;
              this.setState({
                userLast: Object.assign(this.state.userLast, {
                  email,
                  last_seen
                })
              });
            }
            //     }
          }
        }.bind(this)
      );
  };
  componentWillMount() {
    this.readFile();
    navigator.geolocation.getCurrentPosition(position => {
      firebase
        .database()
        .ref("/users/" + this.state.uid)
        .update({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          last_seen: Date.now()
        });
      this.setState({
        lat: position.coords.latitude,
        long: position.coords.longitude
      });
    });
  }
  readFile = async () => {
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    this.setState({ uid: fileContents });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text>
          {this.state.userLast.email}
          {this.state.userLast.last_seen}
        </Text>
        <Button title="Get Users" onPress={this.getUsers} />
      </View>
    );
  }
}
const SharedGroupsNavigator = createStackNavigator(
  {
    SharedGroups: { screen: SharedGroups }
  },
  { initialRouteName: "SharedGroups" }
);
export default SharedGroupsNavigator;
