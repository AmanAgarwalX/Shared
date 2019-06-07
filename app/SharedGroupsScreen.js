import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  ToastAndroid
} from "react-native";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import { FAB, List, Button } from "react-native-paper";
import CreateNewGroups from "./CreateNewGroups";
import { createStackNavigator, createAppContainer } from "react-navigation";
class SharedGroupsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: {},
      grouparr: [],
      modalVisible: false,
      modal: undefined
    };
  }
  static navigationOptions = { header: null };
  _navigateGroup = () => {
    this.props.navigation.navigate("CreateNewGroups");
  };
  _alert() {
    alert("Not Connected");
  }
  componentWillMount() {
    //this.getGroups();
    // setInterval(() => console.log(this.state.modal), 1000);
    /*
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
      });*/
  }
  /* getGroups = async () => {
    console.log(this.props.uid);
    let group = {};
    firebase
      .database()
      .ref("/users/" + this.props.uid + "/groups/")
      .on("value", snap => {
        group = {};
        let groups = undefined;
        this.setState({ group: undefined, grouparr: undefined });
        groups = snap.val();
        for (var groupkey in groups) {
          console.log(groupkey);
          firebase
            .database()
            .ref("/groups/" + groupkey)
            .on("value", snap => {
              let val = snap.val();
              let keygroup = val.key;
              // console.log(keygroup);
              let pair = { [keygroup]: val };
              group = { ...group, ...pair };
              let grouparr = Object.keys(group).map(function(key) {
                return group[key];
              });
              console.log("hi", keygroup, group, grouparr);
              this.setState({ group: group, grouparr: grouparr });
            });
        }
      });
  };*/
  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.props.groups && (
          <FlatList
            data={this.props.groups}
            extraData={this.props.sharing_with}
            renderItem={({ item, index }) => {
              //      console.log("hi", item);
              return (
                <List.Item
                  title={item.name}
                  onPress={() => {
                    let key = item.id;
                    this.props.navigation.navigate("ViewGroupPicsScreen", {
                      key: key,
                      uid: this.props.uid,
                      name: item.name
                    });
                  }}
                  right={() => {
                    if (item.id === this.props.sharing_with.id)
                      return (
                        <Button mode="contained" disabled>
                          Selected
                        </Button>
                      );
                    else
                      return (
                        <Button
                          onPress={() => {
                            this.props.updateSharingWith({
                              id: item.id,
                              name: item.name
                            });
                          }}
                        >
                          Select
                        </Button>
                      );
                  }}
                  style={{ backgroundColor: "#e0e0d1", marginBottom: 1 }}
                  //  description="Item description"
                  //    left={props => <List.Icon {...props} icon="folder" />}
                />
              );
            }}
          />
        )}
        <FAB
          style={styles.fab}
          icon="add"
          disabled={false}
          onPress={() => {
            this.props.navigation.navigate("CreateNewGroups");
          }}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0
  }
});
function mapStateToProps(state) {
  return {
    test: state.test,
    uid: state.uid,
    groups: state.groups,
    sharing_with: state.sharing_with
  };
}
function mapDispatchToProps(dispatch) {
  return {
    increaseTest: () => dispatch({ type: "INCREASE_TEST" }),
    setUID: uid => dispatch({ type: "SET_UID", uid }),
    updateGroups: groups => dispatch({ type: "UPDATE_GROUPS", groups }),
    updateSharingWith: sharing_with =>
      dispatch({ type: "UPDATE_SHARING_WITH", sharing_with })
  };
}
const ReduxSharedGroups = connect(
  mapStateToProps,
  mapDispatchToProps
)(SharedGroupsScreen);

export default ReduxSharedGroups;
