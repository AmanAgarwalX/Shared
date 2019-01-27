import React, { Component } from "react";
import { Animated, TouchableWithoutFeedback, Text, View } from "react-native";

export default class Hamburger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false
    };
  }

  render() {
    const {
      props: { color, type }
    } = this;

    if (this.props.active) {
      if (type == "spinArrow") {
        this.containerAnim = this.containerAnim || new Animated.Value(1);
        this.topBar = this.topBar || new Animated.Value(1);
        this.bottomBar = this.bottomBar || new Animated.Value(1);
        this.width = this.width || new Animated.Value(14);
        this.marginLeft = this.marginLeft || new Animated.Value(-13);
        this.bottomBarMargin = this.bottomBarMargin || new Animated.Value(2);
        this.topBarMargin = this.topBarMargin || new Animated.Value(-2);
      } else if (type == "arrow") {
        this.topBar = this.topBar || new Animated.Value(1);
        this.bottomBar = this.bottomBar || new Animated.Value(1);
        this.width = this.width || new Animated.Value(14);
        this.marginLeft = this.marginLeft || new Animated.Value(-13);
        this.bottomBarMargin = this.bottomBarMargin || new Animated.Value(2);
        this.topBarMargin = this.topBarMargin || new Animated.Value(-2);
      } else if (type == "spinCross") {
        this.containerAnim = this.containerAnim || new Animated.Value(1);
        this.topBar = this.topBar || new Animated.Value(0.9);
        this.bottomBar = this.bottomBar || new Animated.Value(0.9);
        this.bottomBarMargin = this.bottomBarMargin || new Animated.Value(-10);
        this.middleBarOpacity = this.middleBarOpacity || new Animated.Value(0);
      } else {
        this.topBar = this.topBar || new Animated.Value(0.9);
        this.bottomBar = this.bottomBar || new Animated.Value(0.9);
        this.bottomBarMargin = this.bottomBarMargin || new Animated.Value(-10);
        this.middleBarOpacity = this.middleBarOpacity || new Animated.Value(0);
      }
    }

    this.containerAnim = this.containerAnim || new Animated.Value(0);
    this.topBar = this.topBar || new Animated.Value(0);
    this.bottomBar = this.bottomBar || new Animated.Value(0);
    this.middleBarOpacity = this.middleBarOpacity || new Animated.Value(1);
    this.bottomBarMargin = this.bottomBarMargin || new Animated.Value(4);
    this.topBarMargin = this.topBarMargin || new Animated.Value(0);
    this.marginLeft = this.marginLeft || new Animated.Value(0);
    this.width = this.width || new Animated.Value(25);

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.props.onPress ? this.props.onPress() : undefined;
        }}
      >
        <Animated.View
          style={{
            width: 35,
            justifyContent: "center",
            alignItems: "center",
            height: 35,
            transform: [
              {
                rotate: this.containerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"]
                })
              }
            ]
          }}
        >
          <Animated.View
            style={{
              height: 3,
              marginLeft: this.marginLeft,
              width: this.width,
              marginBottom: this.topBarMargin,
              backgroundColor: color ? color : "black",
              transform: [
                {
                  rotate: this.topBar.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "-50deg"]
                  })
                }
              ]
            }}
          />
          <Animated.View
            style={{
              height: 3,
              width: 25,
              opacity: this.middleBarOpacity,
              backgroundColor: color ? color : "black",
              marginTop: 4
            }}
          />
          <Animated.View
            style={{
              height: 3,
              marginLeft: this.marginLeft,
              width: this.width,
              backgroundColor: color ? color : "black",
              marginTop: this.bottomBarMargin,
              transform: [
                {
                  rotate: this.bottomBar.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "50deg"]
                  })
                }
              ]
            }}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}
