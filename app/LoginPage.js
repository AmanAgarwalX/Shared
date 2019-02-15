import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  Modal,
  TouchableHighlight,
  TextInput
} from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes
} from "react-native-google-signin";
import { connect } from "react-redux";
import { StackActions, NavigationActions } from "react-navigation";
import firebase from "react-native-firebase";
import config from "../config";
import FileSystem from "react-native-filesystem";
class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      error: null,
      isNew: null,
      modalVisible: false,
      userId: null,
      uid: null
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
  async writeToFile(uid) {
    const fileContents = uid;
    await FileSystem.writeToFile("my-directory/my-file.txt", fileContents);
    Alert.alert("file is written");
  }
  /* async _getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      this.setState({ userInfo, error: null });
    } catch (error) {
      const errorMessage =
        error.code === statusCodes.SIGN_IN_REQUIRED
          ? "Please sign in :)"
          : error.message;
      this.setState({
        error: new Error(errorMessage)
      });
    }
  }*/
  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }
  render() {
    console.log(this.props.uid);
    const { userInfo } = this.state;
    const { isNew } = this.state;
    const body = /*userInfo
      ? this.renderUserInfo(userInfo)
      :*/ this.renderSignInButton();
    return (
      <View style={[styles.container, { flex: 1 }]}>
        {body}
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
            <Text>Please Input UserName</Text>
            <TextInput
              style={{ borderColor: "black", width: "100%" }}
              placeholder="Type here to translate!"
              onChangeText={userId => this.setState({ userId })}
            />
            <View>
              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                  this.setUserID();
                }}
              >
                <Text>Set User ID</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        <Text>{this.props.test}</Text>
        <Button title="increase" onPress={() => this.props.increaseTest()} />
      </View>
    );
  }
  setUserID = async () => {
    firebase
      .database()
      .ref("/users/" + this.state.uid)
      .update({ userId: this.state.userId });
    this.isSignedIn(this.state.uid);
  };
  /* renderUserInfo(userInfo) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
          Welcome {userInfo.user.name}
        </Text>
        <Text>Your user info: {JSON.stringify(userInfo.user)}</Text>

        <Button onPress={this._signOut} title="Log out" />
        {this.renderError()}
      </View>
    );
  }
*/
  renderSignInButton() {
    return (
      <View style={styles.container}>
        <GoogleSigninButton
          style={{ width: 212, height: 48 }}
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Auto}
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
  isSignedIn = async UIDGIVEN => {
    const isSignedIn = await GoogleSignin.isSignedIn();

    this.writeToFile(UIDGIVEN);
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
      // add any configuration settings here:
      await GoogleSignin.configure();

      const data = await GoogleSignin.signIn();

      // create a new firebase credential with the token
      const credential = firebase.auth.GoogleAuthProvider.credential(
        data.idToken,
        data.accessToken
      );
      // login with credential
      const firebaseUserCredential = await firebase
        .auth()
        .signInWithCredential(credential);
      let uid = firebaseUserCredential.user.uid;
      this.props.setUID(uid);
      if (firebaseUserCredential.additionalUserInfo.isNewUser) {
        //Wait for UserId, then add new user and then send to homepage
        this.setState({
          isNew: true,
          modalVisible: true,
          uid: firebaseUserCredential.user.uid
        });

        firebase
          .messaging()
          .getToken()
          .then(fcmToken => {
            if (fcmToken) {
              // user has a device token
              firebase
                .database()
                .ref("/users/" + firebaseUserCredential.user.uid)
                .set({
                  gmail: firebaseUserCredential.user.email,
                  profile_picture:
                    firebaseUserCredential.additionalUserInfo.profile.picture,
                  locale:
                    firebaseUserCredential.additionalUserInfo.profile.locale,
                  name: firebaseUserCredential.additionalUserInfo.profile.name,
                  created_at: Date.now(),
                  userId: this.state.userId,
                  token: fcmToken,
                  sharing_with: 0
                });
            } else {
              // user doesn't have a device token yet
              firebase
                .database()
                .ref("/users/" + firebaseUserCredential.user.uid)
                .set({
                  gmail: firebaseUserCredential.user.email,
                  profile_picture:
                    firebaseUserCredential.additionalUserInfo.profile.picture,
                  locale:
                    firebaseUserCredential.additionalUserInfo.profile.locale,
                  name: firebaseUserCredential.additionalUserInfo.profile.name,
                  created_at: Date.now(),
                  userId: this.state.userId,
                  token: null,
                  sharing_with: 0
                });
            }
          });
      } else {
        //Update and Login Normally
        firebase
          .messaging()
          .getToken()
          .then(fcmToken => {
            firebase
              .database()
              .ref("/users/" + firebaseUserCredential.user.uid)
              .update({ token: fcmToken, last_logged_in: Date.now() });
          });
        this.isSignedIn(firebaseUserCredential.user.uid);
      }

      /*
      if (firebaseUserCredential.additionalUserInfo.isNewUser) {
        this.setState({ isNew: true, modalVisible: true });
        firebase
          .database()
          .ref("/users/" + firebaseUserCredential.user.uid)
          .set({
            gmail: firebaseUserCredential.user.email,
            profile_picture:
              firebaseUserCredential.additionalUserInfo.profile.picture,
            locale: firebaseUserCredential.additionalUserInfo.profile.locale,
            name: firebaseUserCredential.additionalUserInfo.profile.name,
            created_at: Date.now()
          });
      } else {
        this.setState({ isNew: false });
        firebase
          .database()
          .ref("/users/" + firebaseUserCredential.user.uid)
          .update({ last_logged_in: Date.now() });
      }
      this.setState({ userInfo: data, error: null });
      this.writeToFile(firebaseUserCredential.user.uid);
      console.warn(JSON.stringify(firebaseUserCredential.user.toJSON()));
      if (!this.state.isNew) this.isSignedIn(firebaseUserCredential.user.uid);*/
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // sign in was cancelled
        Alert.alert("cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation in progress already
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

  _signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      this.setState({ userInfo: null, error: null });
    } catch (error) {
      this.setState({
        error
      });
    }
  };
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
