import React, { useState } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/Entypo";
import AuthService from "../services/auth.service";

export default function Login({ navigation, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setMessage("");
    setLoading(true);

    if (!username || !password) {
      setMessage("Username and password are required");
      setLoading(false);
      return;
    }

    try {
      const user = await AuthService.login(username, password);
      if (onLogin) {
        onLogin(user); // << notifica al padre que el login fue exitoso
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }
    } catch (error) {
      setMessage("Login failed. Check credentials or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="dark-content" />
        <Text style={styles.salesportGym}>Salesport Gym</Text>

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#aaa"
          style={styles.input}
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholderTextColor="#aaa"
            style={styles.input}
          />
          <Icon name="lock" style={styles.icon} />
        </View>

        {message !== "" && <Text style={styles.errorText}>{message}</Text>}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.register}>Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 100, alignItems: "center", flexGrow: 1 },
  salesportGym: { fontSize: 28, color: "#121212", marginBottom: 50 },
  input: {
    width: 300,
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    borderRadius: 4,
    color: "#121212",
  },
  passwordContainer: { width: 300, position: "relative" },
  icon: {
    position: "absolute",
    right: 10,
    top: 12,
    color: "gray",
    fontSize: 20,
  },
  loginButton: {
    marginTop: 30,
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  loginButtonText: { color: "white", fontSize: 16 },
  errorText: { color: "red", marginTop: 10 },
  or: { marginTop: 30, color: "#555", opacity: 0.5 },
  register: { marginTop: 10, color: "#121212", opacity: 0.8, fontSize: 16 },
});
