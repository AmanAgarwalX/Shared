import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  CameraRoll,
  PermissionsAndroid,
  ScrollView,
  Image
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Hamburger from "../Hamburger";
class SharedPics extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Shared Pics",
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
  constructor(props) {
    super(props);
    this.state = {
      photos: []
    };
  }
  _handleButtonPress = () => {
    CameraRoll.getPhotos({
      first: 20,
      assetType: "All"
    })
      .then(r => {
        this.setState({ photos: r.edges });
        this.state.photos.forEach(function(element) {
          console.log(element.node.timestamp);
        });
      })
      .catch(err => {
        //Error Loading Images
      });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Button title="Load Images" onPress={this._handleButtonPress} />
        <ScrollView>
          {this.state.photos.map((p, i) => {
            return (
              <Image
                key={i}
                style={{
                  width: 300,
                  height: 100
                }}
                source={{ uri: p.node.image.uri }}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  }
}
const SharedPicsNavigator = createStackNavigator(
  {
    SharedPics: { screen: SharedPics }
  },
  { initialRouteName: "SharedPics" }
);
export default SharedPicsNavigator;
