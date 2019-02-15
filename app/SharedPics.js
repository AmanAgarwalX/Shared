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
  Image,
  Modal,
  TouchableWithoutFeedback,
  ToastAndroid
} from "react-native";
import FileSystem from "react-native-filesystem";
import firebase from "react-native-firebase";
//import ImagePicker from "react-native-image-picker";
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
      pics: []
    };
  }
  /*_handleButtonPress = () => {
    CameraRoll.getPhotos({
      first: 20,
      groupName: "Camera",
      assetType: "All"
    })
      .then(r => {
        this.setState({ photos: r.edges });
        this.state.photos.forEach(function(element) {
          console.log(element.node.timestamp);
          console.log(element.node.group_name);
        });
      })
      .catch(err => {
        //Error Loading Images
      });
  };
  uploadImage = (path, mime = "application/octet-stream") => {
    return new Promise((resolve, reject) => {
      const imageRef = firebase
        .storage()
        .ref("images")
        .child("filename.jpg");

      return imageRef
        .put(path, { contentType: mime })
        .then(() => {
          return imageRef.getDownloadURL();
        })
        .then(url => {
          resolve(url);
        })
        .catch(error => {
          reject(error);
          console.log("Error uploading image: ", error);
        });
    });
  };*/

  mountedComponent = async () => {
    const uid = await this.readFile();
    this.setState({ uid });
    await this.getGroups();
  };

  getGroups = async () => {
    let arr = [];
    return firebase
      .database()
      .ref("/users/" + this.state.uid + "/groups/")
      .on("child_added", snap => {
        firebase
          .database()
          .ref("/groups/")
          .child(snap.key)
          .child("shared")
          .on("value", childSnap => {
            let groupKey = snap.key;

            let canDelete = false;
            if (snap.val() == 0) canDelete = true;

            let pics = childSnap.val();
            if (pics) {
              for (var pickey in pics) {
                let pic = pics[pickey].url;
                let path = pics[pickey].filepath;
                let key = pics[pickey].key;
                arr = arr.concat({
                  groupKey,
                  key,
                  path,
                  pic,
                  visible: false,
                  canDelete
                });
              }

              this.setState({ pics: arr });
              console.log(arr);
            }
          });
        //  groups.push(group);
      });
  };
  readFile = async () => {
    const fileContents = await FileSystem.readFile("my-directory/my-file.txt");
    myuid = fileContents;
    return new Promise(resolve => {
      resolve(fileContents);
    });
  };
  componentWillMount() {
    this.mountedComponent();
  }
  componentDidMount() {
    /* const options = {
      title: "Select Avatar",
      customButtons: [{ name: "fb", title: "Choose Photo from Facebook" }],
      storageOptions: {
        skipBackup: true,
        path: "images"
      }
    };
    ImagePicker.showImagePicker(options, response => {
      console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        const source = { uri: response.uri };
        console.log(this.uploadImage(response.uri));
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };

        console.log(source);
      }
    });*/
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Button title="Load Images" onPress={this._handleButtonPress} />
        <ScrollView>
          {this.state.pics.map((p, i) => {
            return (
              <View>
                <TouchableWithoutFeedback
                  onPress={() => {
                    let temp = this.state.pics;
                    temp[i].visible = true;
                    this.setState({ pics: temp });
                  }}
                >
                  <Image
                    key={i}
                    style={{
                      width: 300,
                      height: 100
                    }}
                    source={{ uri: p.pic }}
                  />
                </TouchableWithoutFeedback>
                <Modal
                  animationType="slide"
                  transparent={false}
                  visible={this.state.pics[i].visible}
                  onRequestClose={() => {
                    let temp = this.state.pics;
                    temp[i].visible = false;
                    this.setState({ pics: temp });
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      alignContent: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Image
                      key={i}
                      style={{
                        width: "100%",
                        height: "80%"
                      }}
                      source={{ uri: p.pic }}
                    />
                    <Button
                      title="Download"
                      onPress={() => {
                        console.log(p.path);
                        firebase
                          .storage()
                          .ref(p.path)
                          .downloadFile(
                            "file:///storage/emulated/0/demo/test.pdf"
                          )
                          .then(downloadedFile => {
                            //success
                            console.log(success);
                          })
                          .catch(err => {
                            //Error
                            console.log(err);
                          });
                      }}
                    />
                    {p.canDelete && (
                      <Button
                        title="Delete"
                        onPress={() => {
                          console.log(p.path);
                          firebase
                            .database()
                            .ref("/groups/" + p.groupKey + "/shared/" + p.key)
                            .set(null)
                            .then(() => {
                              firebase
                                .storage()
                                .ref(p.path)
                                .delete()
                                .then(() => {
                                  // deleted
                                  let temp = this.state.pics;
                                  temp[i].visible = false;
                                  this.setState({ pics: temp });
                                  ToastAndroid.show(
                                    "Deleted Pic",
                                    ToastAndroid.SHORT
                                  );
                                  this.setState({ pics: [] });
                                  this.getGroups();
                                })
                                .catch(deleteError => {
                                  // deletion error
                                  console.log(deleteError);
                                  ToastAndroid.show(
                                    String(deleteError),
                                    ToastAndroid.SHORT
                                  );
                                });
                            });
                        }}
                      />
                    )}
                  </View>
                </Modal>
              </View>
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
