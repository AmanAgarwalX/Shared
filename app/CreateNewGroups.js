import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  TextInput,
  CheckBox
} from "react-native";
import FileSystem from "react-native-filesystem";
import firebase from "react-native-firebase";
import Hamburger from "../Hamburger";
export default class CreateNewGroups extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Create New Groups",
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
      userLast: [],
      latitudes: [],
      longitudes: [],
      lat: null,
      long: null,
      searchText: ""
    };
  }
  getUsers = async () => {
    console.log(this.state.lat, this.state.long);
    var userLast = [];
    var usersNearby = [];
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
            if (usersNearby.indexOf(data.val().gmail) == -1) {
              usersNearby = usersNearby.concat(data.val().gmail);
              let email = data.val().gmail;
              let last_seen = data.val().last_seen;
              let checked = false;
              userLast = userLast.concat({ email, last_seen, checked });
            }
            this.setState({ userLast: userLast, usersNearby: usersNearby });

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
  SearchBar = () => {
    var searchUsers = [];
    this.state.userLast.forEach(
      function(val, index) {
        if (val.email.startsWith(String(this.state.searchText))) {
          {
            searchUsers = searchUsers.concat({ val, index });
          }
        }
      }.bind(this)
    );
    if (!(searchUsers.length > 0))
      searchUsers = searchUsers.concat({ email: "Not Found", last_seen: null });

    return (
      <View>
        {searchUsers.map(users => (
          <View style={{ flexDirection: "row" }}>
            {users.val.last_seen != null && (
              <CheckBox
                value={this.state.userLast[users.index].checked}
                onValueChange={() => {
                  let temp = this.state.userLast;
                  temp[users.index].checked = !temp[users.index].checked;
                  this.setState({ userLast: temp });
                }}
              />
            )}
            <Text style={{ marginTop: 5 }}>
              {" "}
              {users.val.email}
              {users.val.last_seen}
              {`\n`}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  returnNothing() {
    return <View />;
  }
  render() {
    const searchBar =
      this.state.searchText == "" ? this.returnNothing() : this.SearchBar();
    return (
      <View style={{ flex: 1 }}>
        <TextInput
          style={{ borderColor: "black" }}
          placeholder="Type here to translate!"
          onChangeText={searchText => {
            this.setState({ searchText });
          }}
        />
        {searchBar}
        {this.state.userLast.map((users, index) => (
          <View style={{ flexDirection: "row" }}>
            <CheckBox
              value={this.state.userLast[index].checked}
              onValueChange={() => {
                let temp = this.state.userLast;
                temp[index].checked = !temp[index].checked;
                this.setState({ userLast: temp });
              }}
            />
            <Text style={{ marginTop: 5 }}>
              {" "}
              {users.email}
              {users.last_seen}
              {`\n`}
            </Text>
          </View>
        ))}
        <Button title="Get Users" onPress={this.getUsers} />
      </View>
    );
  }
}
/*
map(users => (
          <View style={{ flexDirection: "row" }}>
            <CheckBox
              value={users.checked}
              onValueChange={() =>
                this.setState({ checked: !this.state.checked })
              }
            />
            <Text style={{ marginTop: 5 }}>
              {" "}
              {users.email}
              {users.last_seen}
              {`\n`}
            </Text>
          </View>
        ))*/
