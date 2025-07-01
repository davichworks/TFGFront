// Importaciones necesarias
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";

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

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Componente personalizado del Drawer
function CustomDrawerContent({ navigation, logout, roles }) {
  const isUser = roles.includes("ROLE_USER");

  return (
    <DrawerContentScrollView>
      <DrawerItem label="Home" onPress={() => navigation.navigate("Home")} />
      {!isUser && (
        <>
          <DrawerItem label="Gestiónar Usuario" onPress={() => navigation.navigate("Admin")} />
          <DrawerItem label="Actividades" onPress={() => navigation.navigate("Activity")} />
          <DrawerItem label="Espacios" onPress={() => navigation.navigate("Space")} />
          <DrawerItem label="Rutinas" onPress={() => navigation.navigate("Routines")} />
        </>
      )}
      <DrawerItem label="MisReservas" onPress={() => navigation.navigate("MyReservations")} />
      <DrawerItem label="Reservar" onPress={() => navigation.navigate("Reservation")} />
      <DrawerItem label="Salud" onPress={() => navigation.navigate("Salud")} />
    </DrawerContentScrollView>
  );
}

// Navegador Drawer con botones arriba a la derecha
function DrawerNavigator({ logout, roles }) {
  const isUser = roles.includes("ROLE_USER");

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
      {!isUser && (
        <>
          <Drawer.Screen name="Admin" component={Admin} />
          <Drawer.Screen name="Activity" component={Activity} />
          <Drawer.Screen name="Space" component={Space} />
          <Drawer.Screen name="Routines" component={Routines} />
        </>
      )}
      <Drawer.Screen name="Reservation" component={Reservation} />
      <Drawer.Screen name="MyReservations" component={MyReservations} />
      <Drawer.Screen name="ChangePassword" component={ChangePassword} />
      <Drawer.Screen name="Salud" component={Salud} />
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
