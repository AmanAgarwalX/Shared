import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  FlatList
  // Button
} from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes
} from "react-native-google-signin";
import { connect } from "react-redux";
import config from "../config";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Navigator from "./HomePageScreen";
import { Button, List } from "react-native-paper";
import firebase from "react-native-firebase";
class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      animating: false
    };
    console.log(this.props.user);
  }
  renderLoadingView = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <ActivityIndicator size="large" color="#00ff00" animating={true} />
    </View>
  );
  renderMainView = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center"
      }}
    >
      {this.props.user && (
        <List.Section>
          <List.Item
            title="Name"
            description={this.props.user.name}
            style={{}}
            titleStyle={{ fontSize: 20, fontWeight: "bold", color: "#c75c5c" }}
            descriptionStyle={{
              fontSize: 16,
              fontWeight: "100",
              color: "#4f5d73"
            }}
          />
          <List.Item
            title="Email"
            description={this.props.user.gmail}
            style={{}}
            titleStyle={{ fontSize: 20, fontWeight: "bold", color: "#c75c5c" }}
            descriptionStyle={{
              fontSize: 16,
              fontWeight: "200",
              color: "#4f5d73"
            }}
          />
          <List.Item
            title="User Name"
            description={this.props.user.user_name}
            style={{}}
            titleStyle={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#c75c5c"
            }}
            descriptionStyle={{
              fontSize: 16,
              fontWeight: "300",
              color: "#4f5d73"
            }}
          />
        </List.Section>
      )}

      <View style={{ alignItems: "center" }}>
        <Button mode="contained" onPress={this._signOut}>
          Sign Out
        </Button>
      </View>
    </View>
  );
  static navigationOptions = { header: null };
  render() {
    if (this.state.animating) {
      return this.renderLoadingView();
    } else {
      return this.renderMainView();
    }
  }
  _signOut = async () => {
    await this.setState({ animating: true });
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await firebase.auth().signOut();
      fetch("http://13.234.165.94/logout", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(this.props.access_token)
        }
      });
      await this.props.logout();
      this.setState({ animating: false });
      this.props.navigation.navigate("Login");
    } catch (error) {}
  };
}
function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch({ type: "LOGOUT" })
  };
}
function mapStateToProps(state) {
  return {
    user: state.user,
    access_token: state.access_token
  };
}
const ReduxSettings = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
const SettingsNavigator = createStackNavigator(
  {
    Settings: { screen: ReduxSettings }
  },
  { initialRouteName: "Settings" }
);
export default SettingsNavigator;
