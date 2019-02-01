import { NativeModules } from "react-native";

export const initiate = () => {
  NativeModules.Floating.initiate();
};
export const show = () => {
  NativeModules.Floating.show();
};
