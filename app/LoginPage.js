import React, { Component } from "react";
import {
  StyleSheet,
  //Text,
  View,
  Image,
  Alert,
  Button,
  ToastAndroid,
  Modal,
  TouchableHighlight,
  TextInput,
  ActivityIndicator
} from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes
} from "react-native-google-signin";
import { connect } from "react-redux";
import { Text } from "react-native-paper";
import { StackActions, NavigationActions } from "react-navigation";
import firebase from "react-native-firebase";
import config from "../config";
class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      error: null,
      isNew: null,
      modalVisible: false,
      userId: null,
      uid: null,
      visible: true,
      userVisible: false
    };
  }

  async componentDidMount() {
    this._configureGoogleSignIn();
    //   await this._getCurrentUser();
  }

  _configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: config.webClientId,
      offlineAccess: false
    });
  }
  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }
  renderActivity = () => {
    return (
      <View>
        <ActivityIndicator size="large" color="#00ff00" animating={true} />
      </View>
    );
  };
  render() {
    const body = this.renderSignInButton();
    const activity = this.renderActivity();
    return (
      <View
        style={[
          {
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            padding: 10,
            backgroundColor: "#e0e0d1"
          }
        ]}
      >
        <View
          style={{
            flex: 0.7,
            backgroundColor: "#e0e0d1",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Image
            source={require("./ic_launcher.png")}
            style={{ height: 150, width: 150 }}
          />
          <Text
            style={{
              fontSize: 25,
              margin: 10,
              color: "#c75c5c"
            }}
          >
            Welcome to Shared
          </Text>
        </View>
        {this.state.visible ? body : activity}
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
                        this.userInfoSet["user_name"] = this.state.userId;
                        await this.props.setUserInfo(this.userInfoSet);
                        this.setModalVisible(!this.state.modalVisible);

                        this.isSignedIn(this.state.uid);
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
  renderSignInButton() {
    return (
      <View
        style={{
          flex: 0.3,
          backgroundColor: "#4f5d73",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 25
        }}
      >
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={this._signIn}
        />
        {this.renderError()}
      </View>
    );
  }

  renderError() {
    const { error } = this.state;
    if (!error) {
      return null;
    }
    const text = `${error.toString()} ${error.code ? error.code : ""}`;
    return <Text>{text}</Text>;
  }
  isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
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
    if (isSignedIn) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "HomePage" })]
      });
      this.props.navigation.dispatch(resetAction);
    }
  };

  _signIn = async () => {
    try {
      this.setState({ visible: false });
      let ans = await GoogleSignin.configure();
      console.log(ans);
      const data = await GoogleSignin.signIn();
      console.log(data);
      const credential = firebase.auth.GoogleAuthProvider.credential(
        data.idToken,
        data.accessToken
      );
      console.log(credential);
      const firebaseUserCredential = await firebase
        .auth()
        .signInWithCredential(credential);
      console.log("4");
      let uid = firebaseUserCredential.user.uid;
      await this.props.setUID(uid);
      console.log("5");
      const user = {
        gmail: firebaseUserCredential.user.email,
        profile_picture:
          firebaseUserCredential.additionalUserInfo.profile.picture,
        name: firebaseUserCredential.additionalUserInfo.profile.name
      };
      this.userInfoSet = user;
      console.log("6");
      if (firebaseUserCredential.additionalUserInfo.isNewUser) {
        this.setState({
          isNew: true,
          modalVisible: true,
          uid: firebaseUserCredential.user.uid
        });

        const fcmToken = await firebase.messaging().getToken();
        const new_data = await fetch("http://13.234.165.94/user", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: firebaseUserCredential.user.email,
            name: firebaseUserCredential.additionalUserInfo.profile.name,
            id: firebaseUserCredential.user.uid,
            token: fcmToken,
            sharing_with: 0,
            password: firebaseUserCredential.user.uid
          })
        });
        await new_data.json().then(async hi => {
          console.log("newnew", hi);
          await this.props.setAccessToken(hi["access_token"]);
          console.log("Done that too");
        });
      } else {
        const fcmToken = await firebase.messaging().getToken();
        console.log("hihi hi", fcmToken);
        let new_data = await fetch("http://13.234.165.94/user", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: firebaseUserCredential.user.email,
            name: firebaseUserCredential.additionalUserInfo.profile.name,
            id: firebaseUserCredential.user.uid,
            token: fcmToken,
            sharing_with: 0,
            password: firebaseUserCredential.user.uid
          })
        });
        await new_data.json().then(async hi => {
          console.log("newnew", hi);
          await this.props.setAccessToken(hi["access_token"]);
          this.userInfoSet["user_name"] = hi["user_id_name"];
          await this.props.setUserInfo(this.userInfoSet);
          console.log("Done that too");
          this.isSignedIn();
        });
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("cancelled");
        this.setState({ visible: true });
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("play services not available or outdated");
      } else {
        Alert.alert("Something went wrong", error.toString());
        this.setState({
          error
        });
      }
    }
  };
}
function mapStateToProps(state) {
  return {
    test: state.test,
    uid: state.uid,
    access_token: state.access_token,
    user: state.user
  };
}
function mapDispatchToProps(dispatch) {
  return {
    increaseTest: () => dispatch({ type: "INCREASE_TEST" }),
    setUID: uid => dispatch({ type: "SET_UID", uid }),
    setAccessToken: access_token =>
      dispatch({ type: "SET_ACCESS_TOKEN", access_token }),
    setUserInfo: user => dispatch({ type: "SET_USER_INFO", user })
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
