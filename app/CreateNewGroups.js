//IMPORTS
import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  TextInput,
  CheckBox,
  Modal,
  TouchableHighlight,
  ToastAndroid
} from "react-native";
import FileSystem from "react-native-filesystem";
import firebase from "react-native-firebase";
import Hamburger from "../Hamburger";

//CREATING GROUP AND EXPORTING IT
export default class CreateNewGroups extends Component {
  //CONSTRUCTOR WITH ALL PROPS DEFINED
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
      searchText: "",
      modalVisible: false,
      groupName: null,
      groupMembers: [],
      email: null,
      farUsers: []
    };
  }
  //NAVIGATION OPTIONS DEFINED
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
      headerRight: (
        <Button title="Create" onPress={navigation.getParam("createGroup")} />
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
  //USED BY HEADER BUTTON TO CREATE GROUP. IT SHOWS THE MODAL
  _createGroup = () => {
    let group = [];
    this.state.userLast.forEach(val => {
      if (val.checked == true) group = group.concat(val);
    });
    if (!(group.length > 0))
      ToastAndroid.show("No members selected", ToastAndroid.SHORT);
    else this.setState({ groupMembers: group, modalVisible: true });
  };

  //GETS THE USERS NEAR YOU. CALLED BY THE BUTTON GET USERS
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
          console.log("calledone");
          if (data.key != this.state.uid) {
            console.log(data.val().gmail);
            console.log(data.val().latitude);
            var longi = data.val().longitude;

            if (longi >= downlong && longi <= uplong) {
              console.log("three", data.val().gmail);
              if (usersNearby.indexOf(data.val().gmail) == -1) {
                usersNearby = usersNearby.concat(data.val().gmail);
                let nearUID = data.key;
                let email = data.val().gmail;
                let last_seen = data.val().last_seen;
                let checked = false;
                userLast = userLast.concat({
                  email,
                  last_seen,
                  checked,
                  nearUID
                });
              }
              this.setState({ userLast: userLast, usersNearby: usersNearby });
            }
          }
        }.bind(this)
      );
  };
  mountedComponent = async () => {
    const uid = await this.readFile();
    this.setState({ uid });
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
    firebase
      .database()
      .ref("/users/" + this.state.uid)
      .once("value", data => {
        let email = data.val().gmail;
        this.setState({ email: email });
        console.log(this.state.email);
      });
  };
  componentDidMount() {}
  //CALLED BEFORE COMPONENT IS MOUNTED
  componentWillMount() {
    this.props.navigation.setParams({ createGroup: this._createGroup });
    this.mountedComponent();
  }
  //READS THE UID OF USER
  readFile = async () => {
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    return new Promise(resolve => {
      resolve(fileContents);
    });
  };
  //RENDERS THE SEARCH RESULTS. CALLED BY THE MAIN RENDER FUNCTION
  SearchBar = () => {
    var searchUsers = [];
    this.state.userLast.forEach(
      function(val, index) {
        if (val) {
          if (val.email.startsWith(String(this.state.searchText))) {
            {
              searchUsers = searchUsers.concat({ val, index });
            }
          }
        }
      }.bind(this)
    );

    const body = this.renderSearch(searchUsers);
    return <View>{body}</View>;
  };
  //USED TO RENDER THE RESULTS OF SEARCH BOX. IT UPDATES THE USERLAST'S CHECKED VARIABLE. CALLED BY SEARCH BAR
  // IF THERE ARE SOME USERS NEARBY AND IN THE USERSLAST ARRAY
  renderSearch = searchUsers => {
    if (searchUsers.length > 0)
      return searchUsers.map(users => (
        <View style={{ flexDirection: "row" }}>
          <CheckBox
            value={this.state.userLast[users.index].checked}
            onValueChange={() => {
              let temp = this.state.userLast;
              temp[users.index].checked = !temp[users.index].checked;
              this.setState({ userLast: temp });
            }}
          />

          <Text style={{ marginTop: 5 }}>
            {" "}
            {users.val.email}
            {users.val.last_seen}
            {`\n`}
          </Text>
        </View>
      ));
    else {
      this.notFound();
      return this.state.farUsers.map(users => (
        <View style={{ flexDirection: "row" }}>
          <CheckBox
            value={users.checked}
            onValueChange={() => {
              users.checked = !users.checked;
              let temp = this.state.userLast;
              if (temp.indexOf(users.email) == -1) {
                temp = temp.concat(users);
                this.setState({ userLast: temp });
              }
            }}
          />

          <Text style={{ marginTop: 5 }}>
            {" "}
            {users.email}
            {users.last_seen}
            {`\n`}
          </Text>
        </View>
      ));
    }
  };
  notFound = () => {
    var email = null;
    var last_seen = null;
    var nearUID = null;
    var users = [];
    firebase
      .database()
      .ref("/users/")
      .orderByChild("gmail")
      .equalTo(this.state.searchText)
      .on(
        "child_added",
        function(data) {
          let flag = false;
          email = data.val().gmail;
          last_seen = data.val().last_seen;
          nearUID = data.key;
          if (users.indexOf(data.val().gmail) == -1) {
            users = users.concat({ email, last_seen, checked: false, nearUID });
            flag = true;
          }

          if (flag) this.setState({ farUsers: users });
        }.bind(this)
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
            searchText = searchText.toLowerCase();
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
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
        >
          <View
            style={{
              margin: 20,
              flex: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text>Please Input GroupName</Text>
            <TextInput
              style={{ borderColor: "black", width: "100%" }}
              placeholder="Type here to translate!"
              onChangeText={groupName => this.setState({ groupName })}
            />
            <View>
              <TouchableHighlight
                onPress={() => {
                  let emails = [];
                  let nearUIDs = [];
                  this.state.groupMembers.forEach(val => {
                    emails = emails.concat(val.email);
                    nearUIDs = nearUIDs.concat(val.nearUID);
                  });
                  let key = firebase
                    .database()
                    .ref("/groups/")
                    .push();
                  key = String(key).split("/");
                  key = key[key.length - 1];
                  firebase
                    .database()
                    .ref("/users/" + this.state.uid + "/groups/" + key)
                    .set(0);
                  firebase
                    .database()
                    .ref("/groups/" + key)
                    .set(
                      {
                        name: this.state.groupName,
                        admin: this.state.email,
                        members: emails,
                        key: key,
                        nearUIDs: nearUIDs,
                        adminUID: this.state.uid
                      },
                      function(error) {
                        if (error) {
                          alert("Data could not be saved." + error);
                        } else {
                          alert("Data saved successfully.");
                          this.setState({
                            modalVisible: !this.state.modalVisible
                          });
                        }
                      }.bind(this)
                    );

                  /*  firebase
                    .database()
                    .ref(ref)
                    .set(this.state.groupName);*/
                }}
              >
                <Text>Set User ID</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
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
