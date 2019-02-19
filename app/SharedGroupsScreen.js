import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  ScrollView,
  Modal,
  ToastAndroid
} from "react-native";
import FileSystem from "react-native-filesystem";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import CreateNewGroups from "./CreateNewGroups";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Hamburger from "../Hamburger";
class SharedGroupsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: []
    };
  }
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
          onPress={() => {
            functionname = navigation.getParam("navigateGroup");
            functionname();
          }}
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
  _navigateGroup = () => {
    this.props.navigation.navigate("CreateNewGroups");
  };
  _alert() {
    alert("Not Connected");
  }
  componentWillMount() {
    firebase
      .database()
      .ref(".info/connected")
      .on("value", snap => {
        console.log(snap.val());
        if (snap.val() === true) {
          this.props.navigation.setParams({
            navigateGroup: this._navigateGroup
          });
        } else {
          this.props.navigation.setParams({ navigateGroup: this._alert });
        }
      });
  }
  displayGroups = async () => {
    await this.getGroups();
  };
  getGroups = async () => {
    console.log(this.props.uid);
    var groups = [];
    return firebase
      .database()
      .ref("/users/" + this.props.uid + "/groups/")
      .on("child_added", snap => {
        firebase
          .database()
          .ref("/groups/")
          .child(snap.key)
          .on("value", childSnap => {
            console.log("1", childSnap.val());
            let val = childSnap.val();
            groups = groups.concat({ val, visible: false });
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
        {this.state.groups != undefined &&
          this.state.groups.map((group, index) => {
            return (
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ marginTop: 5 }}
                  onPress={() => {
                    let temp = this.state.groups;
                    temp[index].visible = true;
                    this.setState({ groups: temp });
                    console.log(group.val.name);
                  }}
                >
                  {" "}
                  {group.val.name}
                  {`\n`}
                </Text>
                <Modal
                  animationType="slide"
                  transparent={false}
                  visible={this.state.groups[index].visible}
                  onRequestClose={() => {
                    let temp = this.state.groups;
                    temp[index].visible = false;
                    this.setState({ groups: temp });
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      alignContent: "center",
                      justifyContent: "center",
                      fontSize: 20
                    }}
                  >
                    <Text>
                      Group Name:
                      {`\n`}
                      {group.val.name}
                      {`\n`}
                    </Text>
                    <Text>
                      Group Admin:
                      {`\n`}
                      {group.val.admin}
                      {`\n`}
                    </Text>
                    <Text>
                      Group Members:
                      {`\n`}
                      {group.val.members}
                      {`\n`}
                    </Text>
                    <Button
                      title="Delete Group"
                      onPress={() => {
                        firebase
                          .database()
                          .ref(
                            "/users/" +
                              this.props.uid +
                              "/groups/" +
                              group.val.key
                          )
                          .set(null)
                          .then(() => {
                            let temp = this.state.groups;
                            temp[index].visible = false;
                            this.setState({ groups: temp });
                            ToastAndroid.show(
                              "Deleted Group",
                              ToastAndroid.SHORT
                            );
                          });
                      }}
                    />
                  </View>
                </Modal>
              </View>
            );
          })}
        <Button title="Get Groups" onPress={this.displayGroups} />
      </ScrollView>
    );
  }
}
function mapStateToProps(state) {
  return {
    test: state.test,
    uid: state.uid
  };
}
const ReduxSharedGroups = connect(mapStateToProps)(SharedGroupsScreen);

export default ReduxSharedGroups;
