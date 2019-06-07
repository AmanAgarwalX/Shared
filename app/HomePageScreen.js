import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  //Text,
  View,
  Alert,
  // Button,
  Image,
  DeviceEventEmitter,
  Switch,
  CameraRoll,
  ToastAndroid,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  TextInput,
  TouchableHighlight,
  Modal
} from "react-native";
import { connect } from "react-redux";
import SocketIOClient from "socket.io-client";
import RNFetchBlob from "rn-fetch-blob";
import io from "socket.io-client/dist/socket.io";
import Icon from "react-native-vector-icons/FontAwesome";
import ReactNativeDetectNewPhoto from "react-native-detect-new-photo";
import { store } from "../App";

import { Snackbar, Button, Text } from "react-native-paper";
import {
  initiate,
  show,
  togglepause,
  isShown,
  hide,
  isPlaying
} from "./floating";
import firebase from "react-native-firebase";
import { createStackNavigator } from "react-navigation";
var isInit = false;
var index = 0;
const OnOff = async () => {
  var newstate = store.getState();
  let timestamp = Date.now() / 1000;
  if (newstate.sharing_with === 0) {
    ToastAndroid.show("Create or Select a Group First", ToastAndroid.SHORT);
    togglepause();
    ReactNativeDetectNewPhoto.destroy();
    //  isOn = false;
  } else {
    //  newstate.groups
    ReactNativeDetectNewPhoto.init();
    ToastAndroid.show(newstate.sharing_with.name, ToastAndroid.SHORT);
    ReactNativeDetectNewPhoto.registerCallback(_ => {
      console.log("new photo detected!");
      ReactNativeDetectNewPhoto.destroy();
      isShown().then(ans => {
        if (ans) {
          console.log("hi");
          CameraRoll.getPhotos({
            first: 1,
            groupName: "Camera",
            assetType: "All"
          })
            .then(r => {
              let mypic = r.edges[0];
              console.log(timestamp, mypic.node.timestamp);
              if (timestamp < mypic.node.timestamp) {
                timestamp = mypic.node.timestamp;
                pic_t = String(Date.now());
                console.log(mypic.node.image.uri);
                ToastAndroid.show("Uploading Pic", ToastAndroid.SHORT);
                var newNotification1 = new firebase.notifications.Notification();
                var progress = 0;
                let uid = newstate.uid;
                let auth = "Bearer " + String(newstate.access_token);
                let formdata = new FormData();
                formdata.append("file", {
                  uri: mypic.node.image.uri,
                  name: uid + ":" + pic_t + ".jpg",
                  type: "multipart/form-data"
                });
                formdata.append("group", newstate.sharing_with.id);
                formdata.append("uid", uid);

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "http://13.234.165.94/upload_pic");
                console.log("OPENED", xhr.status);
                xhr.setRequestHeader("Authorization", auth);
                xhr.onload = function() {
                  console.log("DONE", xhr.status);
                };
                xhr.onreadystatechange = e => {
                  if (xhr.readyState !== 4) {
                    return;
                  }

                  if (xhr.status === 200) {
                    console.log("success", xhr.responseText);
                    firebase
                      .notifications()
                      .removeDeliveredNotification(
                        newNotification1.notificationId
                      );
                    ToastAndroid.show("Uploaded Pic", ToastAndroid.SHORT);
                  } else {
                    console.warn("error");
                  }
                };
                xhr.send(formdata);

                if (xhr.upload) {
                  xhr.upload.onprogress = ({ total, loaded }) => {
                    console.log((loaded / total) * 100, "%");
                    progress = (loaded / total) * 100;
                    newNotification1.android
                      .setChannelId("test-channel")
                      .setTitle("Uploading Pic")
                      .setBody(
                        "Uploading to group" + newstate.sharing_with.name
                      )
                      .android.setProgress(100, progress, false)
                      .android.setAutoCancel(true)
                      .android.setCategory(
                        firebase.notifications.Android.Category.Alarm
                      );

                    firebase
                      .notifications()
                      .displayNotification(newNotification1);
                  };
                }
              }
              ReactNativeDetectNewPhoto.init();
            })
            .catch(err => {});
        } else {
          togglepause();
          ReactNativeDetectNewPhoto.destroy();
        }
      });
    });
  }
};
AppRegistry.registerHeadlessTask("OnOff", () => OnOff);
const Off = async () => {
  //isOn = false;
  console.log("2");
  // BackgroundTimer.clearInterval(intervalId);
  ReactNativeDetectNewPhoto.destroy();
};
AppRegistry.registerHeadlessTask("Off", () => Off);
const GroupName = async () => {
  //isOn = false;
  var newstate = store.getState();
  if (newstate.sharing_with != 0)
    ToastAndroid.show(newstate.sharing_with.name, ToastAndroid.SHORT);
  else ToastAndroid.show("Create a Group First", ToastAndroid.SHORT);
  console.log("5");
};
AppRegistry.registerHeadlessTask("GroupName", () => GroupName);
const SetLocation = async () => {
  //isOn = false;
  var newstate = store.getState();
  navigator.geolocation.getCurrentPosition(position => {
    fetch("http://13.234.165.94/user/location", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(newstate.access_token)
      },
      body: JSON.stringify({
        id: newstate.uid,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        last_seen: Date.now()
      })
    }).then(res => {
      ToastAndroid.show("Location updated", ToastAndroid.SHORT);
    });
  });
  console.log("6");
};
AppRegistry.registerHeadlessTask("SetLocation", () => SetLocation);
const Right = async () => {
  var newstate = store.getState();
  togglepause();
  ReactNativeDetectNewPhoto.destroy();
  if (++index === newstate.groups.length) index = 0;
  group = newstate.groups[index];
  store.dispatch({ type: "UPDATE_SHARING_WITH", sharing_with: group });
  ToastAndroid.show(group.name, ToastAndroid.SHORT);
  console.log("3");
};
AppRegistry.registerHeadlessTask("Right", () => Right);
const Left = async () => {
  var newstate = store.getState();
  togglepause();
  ReactNativeDetectNewPhoto.destroy();
  if (--index === -1) index = newstate.groups.length - 1;
  group = newstate.groups[index];
  store.dispatch({ type: "UPDATE_SHARING_WITH", sharing_with: group });
  ToastAndroid.show(group.name, ToastAndroid.SHORT);
};
AppRegistry.registerHeadlessTask("Left", () => Left);

class HomePageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shown: false,
      isOn: false,
      textContent: null,
      image: null,
      visible: false,
      modalVisible: false,
      userId: "",
      userVisible: false
    };
  }
  mountedComponent = async () => {
    console.log(this.props.user);
    if (this.props.user.user_name === this.props.user.gmail) {
      this.setState({ modalVisible: true });
    }
    this.getGroups();
    console.log(this.props.user);
  };
  componentDidMount() {
    firebase.admob().initialize("ca-app-pub-3596083360479551~2217153701");
    fetch("http://13.234.165.94/api/v1/resources/books/all", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(this.props.access_token)
      }
    }).then(res => {
      console.log(res.status);
      if (res.status != 200) this.props.navigation.navigate("Login");
    });

    this.mountedComponent();
    console.log("What what", {
      Authorization: String("Bearer " + this.props.access_token)
    });
    this.getLocationHandler();
  }
  onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
    console.log("done");
    fetch("http://13.234.165.94/user/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(this.props.access_token)
      },
      body: JSON.stringify({
        id: this.props.uid,
        token: fcmToken
      })
    }).then(res => {
      console.log(res.status);
    });
  });
  getGroups = async () => {
    const res = await fetch("http://13.234.165.94/group/get", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(this.props.access_token)
      },
      body: JSON.stringify({
        id: this.props.uid
      })
    }).catch(err => {
      console.log("problem", err);
    });
    if (res.status != 422)
      await res.json().then(groups => {
        this.props.updateGroups(groups);
        if (groups.length === 0) this.props.updateSharingWith(0);
        this.socket = io("http://13.234.165.94/groups/" + this.props.uid, {
          reconnection: true,
          reconnectionDelay: 500,
          reconnectionAttempts: Infinity,
          transports: ["websocket"]
        });
        this.socket.on("connect", () => {
          console.log("caaaonnected", this.props.uid);
        });
        this.socket.on("disconnect", () => {
          console.log("disconnected");
        });
        this.socket.on("my response", res => {
          console.log("uploaaaaded", res);
          if (res.length === 0) this.props.updateSharingWith(0);
          this.props.updateGroups(res);
        });
      });
    if (this.props.sharing_with === 0 && this.props.groups.length > 0)
      this.props.updateSharingWith(this.props.groups[0]);
  };
  componentWillMount() {
    console.log(this.props.sharing_with, this.props.groups.length);
    console.log(this.props.sharing_with);
    this.requestFilePermission();
    if (!isInit) (isInit = true), initiate();
  }
  componentWillUnmount() {
    this.onTokenRefreshListener();
  }
  requestFilePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "File Access Permission",
          message: "This app can't work without file access permissions",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        this.requestFilePermission();
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };
  getLocationHandler = () => {
    navigator.geolocation.getCurrentPosition(position => {
      fetch("http://13.234.165.94/user/location", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(this.props.access_token)
        },
        body: JSON.stringify({
          id: this.props.uid,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          last_seen: Date.now()
        })
      }).then(res => {
        console.log(res.status);
      });
    });
  };
  static navigationOptions = {
    header: null,
    tabBarLabel: "Home",
    tabBarIcon: ({ tintColor, focused }) => (
      <Icon name="rocket" size={25} color="#900" />
    )
  };

  render() {
    const Banner = firebase.admob.Banner;
    const AdRequest = firebase.admob.AdRequest;
    const request = new AdRequest();
    if (isInit)
      isShown().then(ans => {
        if (this.state.isOn != ans) this.setState({ isOn: ans });
      });

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Snackbar
            visible={this.state.visible}
            onDismiss={() => {
              this.setState({ visible: false });
            }}
            duration={3000}
          >
            Just play the widget and start clicking pictures. Long press the
            widget for more options.
          </Snackbar>
          <Text style={{ margin: 7, fontSize: 17 }}>Start Sharing!</Text>
          <Button
            mode={this.state.isOn ? "contained" : "outlined"}
            onPress={() => {
              if (this.props.test < 3)
                this.setState({ visible: !this.state.isOn }),
                  this.props.increaseTest();
              this.requestFilePermission();
              togglepause();
              ReactNativeDetectNewPhoto.destroy();
              if (this.state.isOn) hide(), this.setState({ isOn: false });
              else show(), this.setState({ isOn: true });
            }}
          >
            {this.state.isOn ? (
              <Icon name="camera" size={23} color="#900" />
            ) : (
              <Icon name="camera-retro" size={23} color="#900" />
            )}
            {this.state.isOn ? " Widget On" : " Widget Off"}
          </Button>
          <View />
        </View>
        <Banner
          unitId={"ca-app-pub-3596083360479551/5662764068"}
          size={"SMART_BANNER"}
          request={request.build()}
          onAdLoaded={() => {
            console.log("Advert loaded");
          }}
        />
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
            <Text>Please Input Your User Name</Text>
            <TextInput
              style={{ borderColor: "black", width: "100%" }}
              placeholder="User Name. Try and make it unique!"
              onChangeText={userId => this.setState({ userId })}
            />
            <View>
              {!this.state.userVisible ? (
                <TouchableHighlight
                  onPress={async () => {
                    this.setState({ userVisible: true });
                    await fetch("http://13.234.165.94/user/user_id", {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization:
                          "Bearer " + String(this.props.access_token)
                      },
                      body: JSON.stringify({
                        id: this.props.uid,
                        user_id: this.state.userId
                      })
                    }).then(async res => {
                      console.log(res.status);
                      if (res.status === 200) {
                        let userInfoSet = this.props.user;
                        await this.props.setUserInfo(null);
                        userInfoSet["user_name"] = this.state.userId;
                        console.log(userInfoSet);
                        await this.props.setUserInfo(userInfoSet);
                        this.setState({ modalVisible: false });
                      } else if (res.status === 402) {
                        this.setState({ userVisible: false });
                        ToastAndroid.show(
                          "Id already in use",
                          ToastAndroid.SHORT
                        );
                      }
                    });
                  }}
                >
                  <Text>Set User ID</Text>
                </TouchableHighlight>
              ) : (
                <ActivityIndicator
                  size="large"
                  color="#00ff00"
                  animating={true}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    test: state.test,
    uid: state.uid,
    groups: state.groups,
    sharing_with: state.sharing_with,
    user: state.user,
    access_token: state.access_token
  };
}
function mapDispatchToProps(dispatch) {
  return {
    increaseTest: () => dispatch({ type: "INCREASE_TEST" }),
    setUID: uid => dispatch({ type: "SET_UID", uid }),
    updateGroups: groups => dispatch({ type: "UPDATE_GROUPS", groups }),
    updateSharingWith: sharing_with =>
      dispatch({ type: "UPDATE_SHARING_WITH", sharing_with }),
    setUserInfo: user => dispatch({ type: "SET_USER_INFO", user })
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
