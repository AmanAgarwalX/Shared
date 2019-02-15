import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  DeviceEventEmitter,
  CameraRoll,
  ToastAndroid,
  PermissionsAndroid
} from "react-native";
import { connect } from "react-redux";
import { initiate, show, togglepause, isShown, hide } from "./floating";
import Hamburger from "../Hamburger";
import firebase from "react-native-firebase";
import SharedPics from "./SharedPics";
import FileSystem from "react-native-filesystem";
import SharedGroups from "./SharedGroups";
import LoginPage from "./LoginPage";
import Settings from "./Settings";
import BackgroundTimer from "react-native-background-timer";
import { createStackNavigator, createAppContainer } from "react-navigation";
var isOn = false;
var myuid;
var intervalId;
var isShownVar = true;
var groupname;
var index = 0;
const check = async () => {
  let result = await isShown();
  if (result) isShownVar = true;
  else isShownVar = false;
};

var groups = [];
const OnOff = async () => {
  isOn = !isOn;
  var mytimestamp = Date.now() / 1000;
  var currentgroup;
  firebase
    .database()
    .ref("/users/" + myuid)
    .child("sharing_with")
    .once("value", snap => {
      currentgroup = snap.val();
      if (currentgroup == 0)
        ToastAndroid.show("Create a Group First", ToastAndroid.SHORT);

      console.log(currentgroup);
    })
    .then(() => {
      let currentgroupname;
      if (currentgroup != 0) {
        groups.forEach(group => {
          if (group.key === currentgroup) currentgroupname = group.name;
        });
        groupname = currentgroupname;
        ToastAndroid.show(currentgroupname, ToastAndroid.SHORT);

        intervalId = BackgroundTimer.setInterval(() => {
          check();
          console.log("hi", isShownVar);
          if (!isShownVar) {
            BackgroundTimer.clearInterval(intervalId);
            togglepause();
          }
          console.log("hi");
          var mypics;
          CameraRoll.getPhotos({
            first: 20,
            groupName: "Camera",
            assetType: "All"
          })
            .then(r => {
              mypics = r.edges.reverse();
              mypics.forEach(function(element) {
                let flag = null;
                if (element.node.timestamp > mytimestamp) {
                  flag = true;
                  console.log(flag);
                  console.log(element.node.image.uri);
                  let usertimestamp = element.node.timestamp;
                  mytimestamp = usertimestamp;
                  ToastAndroid.show("Uploading Pic", ToastAndroid.SHORT);
                  firebase
                    .storage()
                    .ref("/images/" + currentgroup)
                    .child(myuid + usertimestamp + ".jpeg")
                    .putFile(element.node.image.uri, {
                      contentType: "application/octet-stream"
                    })
                    .then(() => {
                      ToastAndroid.show("Uploaded Pic", ToastAndroid.SHORT);
                      let filepath =
                        "/images/" +
                        currentgroup +
                        "/" +
                        myuid +
                        usertimestamp +
                        ".jpeg";
                      firebase
                        .storage()
                        .ref("/images/" + currentgroup)
                        .child(myuid + usertimestamp + ".jpeg")
                        .getDownloadURL()
                        .then(url => {
                          console.log(url);
                          let key = firebase
                            .database()
                            .ref("/groups/" + currentgroup + "/shared/")
                            .push(/*{ url, filepath }*/);
                          key = String(key).split("/");
                          key = key[key.length - 1];
                          firebase
                            .database()
                            .ref("/groups/" + currentgroup + "/shared/" + key)
                            .set({ url, filepath, key });
                        });
                    })
                    .catch(failureCb);
                } else {
                  flag = false;
                }
              });
            })
            .catch(err => {
              //Error Loading Images
            });

          console.log("1");
          console.log("tic");
        }, 3000);
      } else {
        togglepause();
        isOn = false;
      }
    });
};
AppRegistry.registerHeadlessTask("OnOff", () => OnOff);
const Off = async () => {
  isOn = false;
  console.log("2");
  BackgroundTimer.clearInterval(intervalId);
};
AppRegistry.registerHeadlessTask("Off", () => Off);
const Right = async () => {
  BackgroundTimer.clearInterval(intervalId);
  if (isOn == true) isOn = false;
  togglepause();
  if (++index === groups.length) index = 0;
  ToastAndroid.show(groups[index].name, ToastAndroid.SHORT);
  console.log("3");
  let newkey = groups[index].key;
  firebase
    .database()
    .ref("/users/" + myuid + "/sharing_with")
    .set(newkey);
};
AppRegistry.registerHeadlessTask("Right", () => Right);
const Left = async () => {
  BackgroundTimer.clearInterval(intervalId);
  if (isOn == true) isOn = false;
  togglepause();
  if (--index === -1) index = groups.length - 1;
  ToastAndroid.show(groups[index].name, ToastAndroid.SHORT);
  console.log("4", groups[index].name);
  let newkey = groups[index].key;
  firebase
    .database()
    .ref("/users/" + myuid + "/sharing_with")
    .set(newkey);
};
AppRegistry.registerHeadlessTask("Left", () => Left);

class HomePageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shown: false,
      uid: null,
      isOn: false,
      textContent: null
    };
  }
  mountedComponent = async () => {
    if (this.props.uid);
    else {
      const uid = await this.readFile();
      this.props.setUID(uid);

      this.setState({ uid });
    }
    await this.getGroups();
  };
  componentDidMount() {
    this.requestFilePermission();
    initiate();
    this.getGroups();
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        // Process your notification as required
        alert(notification.body);
      });
    this.onTokenRefreshListener = firebase
      .messaging()
      .onTokenRefresh(fcmToken => {
        console.log("done");
        firebase
          .database()
          .ref("/users/" + this.state.uid)
          .update({ token: fcmToken });
      });
  }
  getGroups = async () => {
    return firebase
      .database()
      .ref("/users/" + this.state.uid + "/groups/")
      .on("child_added", snap => {
        firebase
          .database()
          .ref("/groups/")
          .child(snap.key)
          .on("value", childSnap => {
            groups = groups.concat(childSnap.val());
          });
        //  groups.push(group);
      });
  };
  componentWillMount() {
    this.mountedComponent();
  }
  componentWillUnmount() {
    this.onTokenRefreshListener();
  }
  getLocationHandler = () => {
    navigator.geolocation.getCurrentPosition(position => {
      firebase
        .database()
        .ref("/users/" + this.state.uid)
        .update({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          last_seen: Date.now()
        });
    });
  };
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

  readFile = async () => {
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    myuid = fileContents;
    return new Promise(resolve => {
      resolve(fileContents);
    });
  };
  requestFilePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "File Access Permission",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Another File Access Permission",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };
  render() {
    return (
      <View>
        <Text>Hi</Text>
        <Button
          title="Hi"
          onPress={() => {
            alert(this.state.uid);
          }}
        />
        <Button
          title="Switch On Widget"
          onPress={() => {
            // check();
            // if (isOn) {
            //   hide();
            //   isOn = false;
            // } else {
            show();
            //   isOn = true;
            // }
          }}
        />
        <Button
          title="Show Yourself Nearby"
          onPress={this.getLocationHandler}
        />
        <Button title="what" />
        <Text>{this.state.textContent}</Text>
        <Text>{this.props.uid}</Text>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    test: state.test,
    uid: state.uid
  };
}
function mapDispatchToProps(dispatch) {
  return {
    increaseTest: () => dispatch({ type: "INCREASE_TEST" }),
    setUID: uid => dispatch({ type: "SET_UID", uid })
  };
}
const ReduxHomePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomePageScreen);
const HomePageNavigator = createStackNavigator(
  {
    HomePage: { screen: ReduxHomePage }
  },
  { initialRouteName: "HomePage" }
);

export default HomePageNavigator;
