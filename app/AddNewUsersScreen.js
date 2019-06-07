//IMPORTS
import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  // Text,
  View,
  Alert,
  // Button,
  TextInput,
  CheckBox,
  Modal,
  TouchableOpacity,
  ToastAndroid,
  FlatList
} from "react-native";
import io from "socket.io-client/dist/socket.io";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import Dialog from "react-native-dialog";
import {
  Button,
  List,
  Searchbar,
  Surface,
  Text,
  Colors
} from "react-native-paper";

//CREATING GROUP AND EXPORTING IT
class AddNewUsersScreen extends Component {
  constructor(props) {
    super(props);
    this.selectflag = true;
    this.state = {
      usersNearby: [],
      lat: null,
      long: null,
      searchedUsers: [],
      flag: true,
      modalVisible: false,
      searchText: "",
      groupMembers: [],
      connected: false
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Add to Group",
      headerRight: (
        <Button color="#4f5d73" onPress={navigation.getParam("createGroup")}>
          Add
        </Button>
      ),
      headerTitleStyle: {
        textAlign: "center",
        flex: 1
      },
      headerStyle: {
        backgroundColor: "#c75c5c"
      },
      headerTintColor: "white"
    };
  };
  _createGroup = () => {
    let group = [];
    this.state.usersNearby.forEach(val => {
      if (val.checked == true) group.push(val.user_id);
    });
    if (!(group.length > 0))
      ToastAndroid.show("No members selected", ToastAndroid.SHORT);
    else this.setState({ groupMembers: group, modalVisible: true });
  };

  msToTime = s => {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    if (hrs > 0) return hrs + " hrs";
    else if (mins > 0) return mins + " mins";
    else if (secs > 0) return secs + " secs";
    else return "less than one second";
  };
  //GETS THE USERS NEAR YOU. CALLED BY THE BUTTON GET USERS
  getUsers = async () => {
    const resp = await fetch("http://13.234.165.94/near_users/get", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(this.props.access_token)
      },
      body: JSON.stringify({
        id: this.props.uid,
        lat: this.state.lat,
        long: this.state.long
      })
    });

    if (resp.status != 422)
      resp.json().then(users => {
        console.log("all", users);
        new_users = [];
        for (user of users) {
          flag = 0;
          for (old of this.group.members) {
            if (old.id === user.user_id) {
              flag = 1;
              break;
            }
          }
          if (flag === 0) {
            user["checked"] = false;
            new_users.push(user);
          }
        }
        console.log(new_users);

        this.setState({ usersNearby: new_users });
        this.socket = io("http://13.234.165.94/nearby/" + this.props.uid, {
          reconnection: true,
          reconnectionDelay: 500,
          reconnectionAttempts: Infinity,
          transports: ["websocket"]
        });
        this.socket.on("connect", () => {
          console.log("connected nearby users");
          this.setState({ connected: true });
        });
        this.socket.on("disconnect", () => {
          console.log("disconnected");
        });
        this.socket.on("my response2", async users => {
          console.log("all", users);
          new_users = [];
          for (user of users) {
            flag = 0;
            for (old of this.group.members) {
              if (old.id === user.user_id) {
                flag = 1;
                break;
              }
            }
            if (flag === 0) {
              user["checked"] = false;
              new_users.push(user);
            }
          }
          console.log(new_users);
          for (new_user of new_users) {
            flag = 0;
            for (user of this.state.usersNearby) {
              if (new_user.user_id === user.user_id) {
                console.log("found", new_user.user_id);
                new_user["checked"] = user.checked;
                flag = 1;
                break;
              }
            }
            if (flag === 0) new_user["checked"] = false;
          }
          for (user of this.state.usersNearby) {
            flag = 0;
            for (new_user of new_users) {
              if (user.user_id === new_user.user_id) {
                flag = 1;
                break;
              }
            }
            if (flag === 0) new_users.push(user);
          }
          console.log("uploaaaaded", new_users);
          await this.setState({ usersNearby: new_users });
          console.log("now", this.state.usersNearby);
        });
      });
    else if (resp.status == 403) {
      console.log(resp);
    }
  };
  mountedComponent = async () => {
    const { navigation } = this.props;
    this.groupkey = navigation.getParam("key", "some default value");
    this.uid = navigation.getParam("uid", "some default value");
    this.group = navigation.getParam("group", "some default value");
    console.log("major", this.group);
    navigator.geolocation.getCurrentPosition(position => {
      this.setState(
        {
          lat: position.coords.latitude,
          long: position.coords.longitude
        },
        this.getUsers
      );
    });
  };
  componentWillUnmount = () => {
    if (this.state.connected) this.socket.disconnect();
  };
  componentWillMount() {
    /*
    firebase
      .database()
      .ref(".info/connected")
      .on("value", snap => {
        console.log(snap.val());
        if (snap.val() === false) {
          this.props.navigation.goBack();
          alert("Not Connected");
        }
      });
      */
    this.props.navigation.setParams({ createGroup: this._createGroup });
    this.mountedComponent();
  }
  render_search = async searchText => {
    searchedUsers = [];
    if (searchText.length > 0)
      for (user of this.state.usersNearby) {
        // if (user.checked === false)
        if (user.user_id_name.startsWith(String(searchText))) {
          searchedUsers.push(user);
        }
      }
    await this.setState({ searchedUsers });
    console.log(this.state.searchedUsers);
  };
  render() {
    onCancel = () => {
      this.setState({
        modalVisible: false
      });
    };
    const extraProps = {
      onBackdropPress: onCancel,
      onRequestClose: onCancel
    };
    return (
      <View style={{}}>
        <Searchbar
          style={{ margin: 10 }}
          placeholder="Search by User ID"
          icon="search"
          onIconPress={async () => {
            if (
              this.state.flag === true &&
              this.state.searchedUsers.length === 0 &&
              this.state.searchText.length > 0
            ) {
              const resp = await fetch(
                "http://13.234.165.94/user/get_far_user",
                {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(this.props.access_token)
                  },
                  body: JSON.stringify({
                    email: String(this.state.searchText)
                  })
                }
              );
              if (resp.status === 200)
                resp.json().then(async user => {
                  console.log(user);
                  flag = 0;
                  for (old of this.group.members) {
                    if (old.id === user.user_id) {
                      flag = 1;
                      break;
                    }
                  }
                  if (flag === 0 && this.props.user.gmail != user.user_email) {
                    user["checked"] = false;
                    usersNearby = this.state.usersNearby;
                    usersNearby.unshift(user);
                    await this.setState({
                      usersNearby
                    });

                    this.textInput.clear();
                    this.setState({ searchText: "" });
                  } else {
                    this.setState({ flag: false });
                    //Not found condition here
                  }
                });
              else {
                this.setState({ flag: false });
                //Not found condition here
              }
            }
          }}
          onChangeText={searchText => {
            this.setState({ searchText, flag: true });
            this.render_search(searchText);
          }}
          ref={input => {
            this.textInput = input;
          }}
        />

        {this.state.searchedUsers.length === 0 &&
          this.state.searchText.length > 0 && (
            <View>
              {this.state.flag ? (
                <Text
                  style={{
                    textAlign: "center",
                    color: "#4f5d73",
                    fontSize: 15,
                    fontWeight: "bold"
                  }}
                >
                  Not found. Please input email ID and press the Search button
                </Text>
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    color: "#a75050",
                    fontSize: 15,
                    fontWeight: "bold"
                  }}
                >
                  No one with that email
                </Text>
              )}
            </View>
          )}
        {this.state.searchedUsers.length > 0 && (
          <FlatList
            data={this.state.searchedUsers}
            extraData={this.state}
            renderItem={({ item, index }) => {
              return (
                <List.Item
                  title={item.user_id_name}
                  description={
                    "Last seen : " +
                    this.msToTime(Date.now() - item.last_seen) +
                    " ago"
                  }
                  right={() => {
                    if (item.checked) {
                      return (
                        <Button
                          mode="contained"
                          onPress={() => {
                            usersNearby = this.state.usersNearby;
                            for (user in usersNearby)
                              if (
                                usersNearby[user].user_email === item.user_email
                              )
                                usersNearby[user].checked = !usersNearby[user]
                                  .checked;
                            this.setState({
                              usersNearby,
                              searchedUsers: [],
                              searchText: ""
                            });
                          }}
                        >
                          Selected
                        </Button>
                      );
                    } else {
                      return (
                        <Button
                          mode="text"
                          onPress={() => {
                            usersNearby = this.state.usersNearby;
                            for (user in usersNearby)
                              if (
                                usersNearby[user].user_email === item.user_email
                              )
                                usersNearby[user].checked = !usersNearby[user]
                                  .checked;
                            this.setState({
                              usersNearby,
                              searchedUsers: [],
                              searchText: ""
                            });
                          }}
                        >
                          Select
                        </Button>
                      );
                    }
                  }}
                />
              );
            }}
          />
        )}

        {this.state.usersNearby.length > 0 && (
          <Button
            mode="outlined"
            style={{ marginTop: 5, borderColor: "#e0e0d1", borderWidth: 1 }}
            //  color={"#c75c5c"}
            onPress={() => {
              usersNearby = this.state.usersNearby;
              if (this.selectflag)
                for (user of usersNearby) user.checked = true;
              else for (user of usersNearby) user.checked = false;
              this.selectflag = !this.selectflag;
              this.setState({ usersNearby });
            }}
          >
            {this.selectflag ? "select all" : "deselect all"}
          </Button>
        )}

        {this.state.usersNearby && (
          <FlatList
            data={this.state.usersNearby}
            extraData={this.state}
            renderItem={({ item, index }) => {
              if (item) {
                return (
                  <List.Item
                    title={item.user_id_name}
                    description={
                      "Last seen : " +
                      this.msToTime(Date.now() - item.last_seen) +
                      " ago"
                    }
                    right={() => {
                      if (item.checked) {
                        return (
                          <Button
                            mode="contained"
                            onPress={() => {
                              usersNearby = this.state.usersNearby;
                              usersNearby[index].checked = !usersNearby[index]
                                .checked;
                              this.setState({ usersNearby });
                            }}
                          >
                            Selected
                          </Button>
                        );
                      } else {
                        return (
                          <Button
                            mode="text"
                            onPress={() => {
                              usersNearby = this.state.usersNearby;
                              usersNearby[index].checked = !usersNearby[index]
                                .checked;
                              this.setState({ usersNearby });
                            }}
                          >
                            Select
                          </Button>
                        );
                      }
                    }}
                  />
                );
              } else return <View />;
            }}
          />
        )}
        {this.state.usersNearby.length === 0 && (
          <Text
            style={{
              textAlign: "center",
              color: "#4f5d73",
              fontSize: 15,
              fontWeight: "bold",
              margin: 10
            }}
          >
            No users nearby!
          </Text>
        )}
        <Dialog.Container visible={this.state.modalVisible} {...extraProps}>
          <Dialog.Title>Are you sure?</Dialog.Title>
          <Dialog.Button
            label="Cancel"
            onPress={() => {
              this.setState({ modalVisible: false });
            }}
          />
          <Dialog.Button
            label="Okay"
            onPress={() => {
              console.log(this.props.uid, this.state.groupMembers);
              fetch("http://13.234.165.94/group/add_members", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + String(this.props.access_token)
                },
                body: JSON.stringify({
                  group_id: this.groupkey,
                  member_ids: this.state.groupMembers
                })
              }).then(res => {
                console.log(res);
                if (res.status === 200) {
                  ToastAndroid.show("Added Successfully", ToastAndroid.SHORT);
                  this.setState({
                    modalVisible: !this.state.modalVisible
                  });
                  this.props.navigation.goBack();
                } else
                  ToastAndroid.show(
                    "Couldn't create group",
                    ToastAndroid.SHORT
                  );
              });
            }}
          />
        </Dialog.Container>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    test: state.test,
    uid: state.uid,
    user: state.user,
    access_token: state.access_token
  };
}
const ReduxAddNewUsersScreen = connect(mapStateToProps)(AddNewUsersScreen);

export default ReduxAddNewUsersScreen;
