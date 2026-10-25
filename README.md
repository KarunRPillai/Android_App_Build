# Learning: Building an Android App

My first Android app, built while learning React Native and Expo from scratch.
This repo tracks that journey, from a plain "Hello World" to an animated RADXA
interface packaged as an installable APK.

## About

I come from an embedded systems background and used this project to learn mobile
app development. The app shows an animated, circuit-board style AI interface
(RADXA), with glowing traces that spread outward from a central chip and replay
when the chip is tapped.

## Built with

- Expo (SDK 58)
- React Native
- react-native-svg (graphics and animation)
- EAS Build (for generating the APK)

## What I learned

- Setting up Node.js, VS Code, and the Expo toolchain on Windows
- Running an app on a real phone using Expo Go
- Animating with the React Native Animated API
- Drawing and animating vector graphics with SVG
- Building a standalone APK with EAS, without Android Studio

## Getting started

Prerequisites: Node.js LTS on your computer, and the Expo Go app on your Android phone.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npx expo start

# 3. Scan the QR code with Expo Go on your phone
```

## Building the APK

This project builds through Expo's cloud service (EAS), so no Android Studio is needed.

```bash
eas login
eas build:configure
eas build -p android --profile preview
```

When the build finishes, download the APK from the link shown in the terminal and
install it on any Android device.

## Note

The main screen file (`app/index.tsx`) is kept private and is not included in this
repo, so a fresh clone will not run as-is without supplying that file.

## Author

Karun R Pillai