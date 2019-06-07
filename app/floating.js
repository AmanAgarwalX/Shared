import { NativeModules } from "react-native";

export const initiate = () => {
  NativeModules.Floating.initiate();
};
export const show = () => {
  NativeModules.Floating.show();
};
export const togglepause = () => {
  NativeModules.Floating.togglepause();
};

export const hide = () => {
  NativeModules.Floating.hide();
};
export const isPlaying = () => {
  return new Promise(resolve => {
    NativeModules.Floating.isPlaying(response => {
      resolve(response);
    });
  });
};
export const isShown = () => {
  return new Promise(resolve => {
    NativeModules.Floating.isShown(response => {
      resolve(response);
    });
  });
};
