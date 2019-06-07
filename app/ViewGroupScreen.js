import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  // Button,
  ScrollView,
  Modal,
  FlatList,
  ToastAndroid,
  TouchableOpacity
} from "react-native";
import io from "socket.io-client/dist/socket.io";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import CreateNewGroups from "./CreateNewGroups";
import { createStackNavigator, createAppContainer } from "react-navigation";
import { Divider, Button, List } from "react-native-paper";

class ViewGroupScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      group: {},
      connected: false
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("groupname"),
      headerRight: <View />,
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

  mountComponent = async () => {
    const res = await fetch("http://13.234.165.94/group/get_group", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(this.props.access_token)
      },
      body: JSON.stringify({
        group_id: this.groupkey
      })
    }).catch(err => {
      console.log("problem", err);
    });
    if (res.status != 422)
      await res.json().then(group => {
        console.log(group);
        this.setState({ group });

        this.socket = io("http://13.234.165.94/groups/" + this.groupkey, {
          reconnection: true,
          reconnectionDelay: 500,
          reconnectionAttempts: Infinity,
          transports: ["websocket"]
        });
        this.socket.on("connect", () => {
          console.log("connected");
          this.setState({ connected: true });
        });
        this.socket.on("disconnect", () => {
          console.log("disconnected");
        });
        this.socket.on("my response3", group => {
          console.log("what what", group);
          let flag = 0;
          for (member of group.members) {
            if (member.id === this.uid) flag = 1;
          }
          if (flag === 1) this.setState({ group });
          else {
            this.socket.close();
            this.props.navigation.navigate("SharedGroupsScreen");
          }
        });
      });
  };

  componentWillUnmount = () => {
    if (this.state.connected) this.socket.disconnect();
  };
  componentWillMount() {
    const { navigation } = this.props;
    this.groupkey = navigation.getParam("key", "some default value");
    this.uid = navigation.getParam("uid", "some default value");
    this.mountComponent();
  }
  render() {
    //this.componentWillMount();
    return (
      <View
        style={{
          flex: 1,
          //  alignItems: "center",
          //  alignItems: "center",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <View />
        {this.state.group.members && (
          <FlatList
            data={this.state.group.members}
            extraData={this.state}
            renderItem={({ item, index }) => {
              if (item)
                return (
                  <List.Item
                    title={item.user_id_name}
                    right={() => {
                      if (
                        this.state.group.admin === this.uid &&
                        item.id != this.uid
                      ) {
                        return (
                          <Button
                            onPress={() => {
                              fetch("http://13.234.165.94/group/remove", {
                                method: "POST",
                                headers: {
                                  Accept: "application/json",
                                  "Content-Type": "application/json",
                                  Authorization:
                                    "Bearer " + String(this.props.access_token)
                                },
                                body: JSON.stringify({
                                  group_id: this.groupkey,
                                  user_id: item.id
                                })
                              })
                                .then(res => {
                                  console.log(res);
                                  ToastAndroid.show(
                                    "Deleted user",
                                    ToastAndroid.SHORT
                                  );
                                })
                                .catch(err => {
                                  console.log("problem", err);
                                });
                            }}
                          >
                            Delete
                          </Button>
                        );
                      }
                    }}
                  />
                );
              else return <View />;
            }}
          />
        )}
        <Divider />
        <View>
          {this.state.group.admin === this.uid && (
            <Button
              mode="outlined"
              onPress={() => {
                this.props.navigation.navigate("AddNewUsersScreen", {
                  key: this.groupkey,
                  uid: this.uid,
                  group: this.state.group
                });
              }}
            >
              Add to Group
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={() => {
              Alert.alert(
                "Confirm Delete?",
                "Are you sure you want to delete this group?",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      fetch("http://13.234.165.94/group/remove", {
                        method: "POST",
                        headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json",
                          Authorization:
                            "Bearer " + String(this.props.access_token)
                        },
                        body: JSON.stringify({
                          group_id: this.groupkey,
                          user_id: this.uid
                        })
                      })
                        .then(res => {
                          console.log(res);
                          ToastAndroid.show(
                            "Deleted Group",
                            ToastAndroid.SHORT
                          );
                        })
                        .catch(err => {
                          console.log("problem", err);
                        });
                    }
                  }
                ],
                { cancelable: false }
              );
            }}
          >
            Delete Group
          </Button>
        </View>
      </View>
    );
  }
}
function mapStateToProps(state) {
  return {
    test: state.test,
    uid: state.uid,
    groups: state.groups,
    current_group: state.current_group,
    access_token: state.access_token
  };
}
const ReduxViewGroup = connect(mapStateToProps)(ViewGroupScreen);

export default ReduxViewGroup;
