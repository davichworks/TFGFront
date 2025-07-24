// App.js

import 'react-native-reanimated';
import 'react-native-gesture-handler';

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, PermissionsAndroid, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import PushNotification from "react-native-push-notification";

import AuthService from "./android/app/src/services/auth.service";
import Login from "./android/app/src/screens/Login";
import Register from "./android/app/src/screens/Register";
import Home from "./android/app/src/screens/Home";
import Profile from "./android/app/src/screens/Profile";
import Admin from "./android/app/src/screens/BoardAdmin";
import Space from "./android/app/src/screens/Space";
import Activity from "./android/app/src/screens/Activity";
import Reservation from "./android/app/src/screens/Reservation";
import MyReservations from './android/app/src/screens/MyReservations';
import Routines from './android/app/src/screens/Routine';
import ChangePassword from './android/app/src/screens/ChangePassword';
import Salud from './android/app/src/screens/UserInfo';
import GenerateRoutine from './android/app/src/screens/RecommendRoutine';
import MyRoutines from './android/app/src/screens/MyRoutines';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation, logout, roles }) {
  const isUser = roles.includes("ROLE_USER");
  const isTrainer = roles.includes("ROLE_TRAINER");
  const isAdmin = roles.includes("ROLE_ADMIN");

  return (
    <DrawerContentScrollView>
      <DrawerItem label="Home" onPress={() => navigation.navigate("Home")} />
      {(isAdmin) && (
        <>
          <DrawerItem label="Gestiónar Usuario" onPress={() => navigation.navigate("Admin")} />
          <DrawerItem label="Actividades" onPress={() => navigation.navigate("Activity")} />
          <DrawerItem label="Espacios" onPress={() => navigation.navigate("Space")} />
        </>
      )}
      {(isAdmin || isTrainer) && (
        <DrawerItem label="Rutinas" onPress={() => navigation.navigate("Routines")} />
      )}
      <DrawerItem label="MisReservas" onPress={() => navigation.navigate("MyReservations")} />
      <DrawerItem label="Reservar" onPress={() => navigation.navigate("Reservation")} />
      <DrawerItem label="Salud" onPress={() => navigation.navigate("Salud")} />
      <DrawerItem label="Generar Rutina" onPress={() => navigation.navigate("GenerateRoutines")} />
      <DrawerItem label="Mis Rutinas" onPress={() => navigation.navigate("MyRoutines")} />
    </DrawerContentScrollView>
  );
}

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Permiso de notificación concedido');
    } else {
      console.log('Permiso de notificación denegado');
    }
  }
};

function DrawerNavigator({ logout, roles }) {
  const isUser = roles.includes("ROLE_USER");
  const isTrainer = roles.includes("ROLE_TRAINER");
  const isAdmin = roles.includes("ROLE_ADMIN");

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} logout={logout} roles={roles} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        drawerStyle: { width: '50%' },
        headerRight: () => (
          <View style={{ flexDirection: "row", marginRight: 10, gap: 15 }}>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Text style={{ color: "#007bff", fontWeight: "bold" }}>Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
              <Text style={{ color: "red", fontWeight: "bold" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        )
      })}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Profile" component={Profile} />
      {isAdmin && (
        <>
          <Drawer.Screen name="Admin" component={Admin} />
          <Drawer.Screen name="Activity" component={Activity} />
          <Drawer.Screen name="Space" component={Space} />
        </>
      )}
      {(isAdmin || isTrainer) && (
        <Drawer.Screen name="Routines" component={Routines} />
      )}
      <Drawer.Screen name="Reservation" component={Reservation} />
      <Drawer.Screen name="MyReservations" component={MyReservations} />
      <Drawer.Screen name="ChangePassword" component={ChangePassword} />
      <Drawer.Screen name="Salud" component={Salud} />
      <Drawer.Screen name="GenerateRoutines" component={GenerateRoutine} />
      <Drawer.Screen name="MyRoutines" component={MyRoutines} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      setRoles(user?.roles || []);
    };
    checkUser();
  }, []);

  useEffect(() => {
    // Configura PushNotification
    PushNotification.configure({
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
        notification.finish(PushNotification.FetchResult.NoData);
      },
      requestPermissions: Platform.OS === 'ios',
    });

    // Crear canal para Android
    PushNotification.createChannel(
      {
        channelId: "default-channel-id",
        channelName: "Reservas",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Canal creado?: ${created}`)
    );

    requestNotificationPermission();

    // Notificación de prueba
    setTimeout(() => {
      const now = new Date();
const scheduledTime = new Date(now.getTime() + 2 * 60 * 1000); // +2 minutos

PushNotification.localNotificationSchedule({
  channelId: "default-channel-id",
  title: "Programada básica",
  message: "Esto debería salir en 2 minutos",
  date: scheduledTime,
  allowWhileIdle: true,
});
    }, 2000);
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(null);
    setRoles([]);
  };

  return (
    <NavigationContainer>
      {currentUser ? (
        <DrawerNavigator logout={logOut} roles={roles} />
      ) : (
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => (
              <Login
                {...props}
                onLogin={(user) => {
                  setCurrentUser(user);
                  setRoles(user.roles || []);
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
