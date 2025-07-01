import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Entypo";

import AuthService from "../services/auth.service"; // Ajusta la ruta según tu proyecto

export default function Register({ navigation }) {
  // Estados para cada campo
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [surname2, setSurname2] = useState("");
  const [birthday, setBirthday] = useState("");
  const [number, setNumber] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !name ||
      !surname ||
      !username ||
      !birthday ||
      !email ||
      !password ||
      !number ||
      !dni
    ) {
      Alert.alert("Error", "Por favor rellena todos los campos obligatorios.");
      return;
    }

    setLoading(true);

    try {
      await AuthService.register(
        name,
        surname,
        surname2,
        username,
        birthday,
        email,
        password,
        number,
        dni
      );

      Alert.alert("Éxito", "Registro completado. Por favor inicia sesión.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Error al registrarse. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.salesportGym}>Salesport Gym</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          placeholder="Name"
          style={styles.input}
          placeholderTextColor="rgba(205,197,197,1)"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Surname"
          style={styles.input}
          placeholderTextColor="rgba(205,197,197,1)"
          value={surname}
          onChangeText={setSurname}
        />
        <TextInput
          placeholder="Surname2"
          style={styles.input}
          placeholderTextColor="rgba(205,197,197,1)"
          value={surname2}
          onChangeText={setSurname2}
        />
        <TextInput
          placeholder="Birthday"
          style={styles.input}
          placeholderTextColor="rgba(205,197,197,1)"
          value={birthday}
          onChangeText={setBirthday}
        />
        <TextInput
          placeholder="Phone Number"
          style={styles.input}
          placeholderTextColor="rgba(205,197,197,1)"
          keyboardType="numeric"
          value={number}
          onChangeText={setNumber}
        />
        <TextInput
          placeholder="DNI"
          style={styles.input}
          placeholderTextColor="rgba(205,197,197,1)"
          value={dni}
          onChangeText={setDni}
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          placeholderTextColor="rgba(205,197,197,1)"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Username"
          style={styles.input}
          placeholderTextColor="rgba(205,197,197,1)"
          value={username}
          onChangeText={setUsername}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            style={styles.input}
            placeholderTextColor="rgba(205,197,197,1)"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <Icon name="basecamp" style={styles.icon} />
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.login}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, alignItems: "center" },
  salesportGym: { fontSize: 28, color: "#121212", marginBottom: 20 },
  scrollContent: { alignItems: "center", paddingBottom: 20 },
  input: {
    width: 300,
    height: 45,
    borderWidth: 1,
    borderColor: "rgba(205,197,197,1)",
    marginVertical: 8,
    paddingHorizontal: 10,
    fontStyle: "italic",
    color: "#121212",
  },
  passwordContainer: { width: 300, position: "relative" },
  icon: {
    position: "absolute",
    right: 10,
    top: 12,
    color: "rgba(128,128,128,1)",
    fontSize: 25,
  },
  registerButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  registerButtonText: { fontSize: 16, textAlign: "center" },
  or: { marginTop: 15, color: "#121212", opacity: 0.31 },
  login: { marginTop: 10, color: "#121212", opacity: 0.78, fontSize: 16 },
});
