import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import UserService from "../services/user.service";

export default function ChangePassword() {
  const navigation = useNavigation();
  const [oldPassword1, setOldPassword1] = useState("");
  const [oldPassword2, setOldPassword2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword1 || !oldPassword2 || !newPassword) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    if (oldPassword1 !== oldPassword2) {
      Alert.alert("Error", "Las contraseñas antiguas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      await UserService.changePassword(oldPassword1, oldPassword2, newPassword);
      setLoading(false);
      Alert.alert("Éxito", "Contraseña actualizada correctamente.");
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Error", "No se pudo cambiar la contraseña.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Feather name="lock" size={48} color="#6c63ff" style={styles.icon} />
        <Text style={styles.title}>Cambiar Contraseña</Text>

        <View style={styles.inputGroup}>
          <Feather name="key" size={18} color="#6c63ff" style={styles.inputIcon} />
          <TextInput
            placeholder="Contraseña antigua"
            secureTextEntry
            style={styles.input}
            value={oldPassword1}
            onChangeText={setOldPassword1}
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputGroup}>
          <Feather name="key" size={18} color="#6c63ff" style={styles.inputIcon} />
          <TextInput
            placeholder="Repetir contraseña antigua"
            secureTextEntry
            style={styles.input}
            value={oldPassword2}
            onChangeText={setOldPassword2}
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputGroup}>
          <Feather name="lock" size={18} color="#6c63ff" style={styles.inputIcon} />
          <TextInput
            placeholder="Nueva contraseña"
            secureTextEntry
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity
          onPress={handleChangePassword}
          style={[styles.button, { backgroundColor: "#6c63ff" }]}
          disabled={loading}
        >
          <Feather name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.button, styles.cancelButton]}
          disabled={loading}
        >
          <Feather name="arrow-left" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6c63ff",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 1,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 2,
    width: "100%",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#222",
    backgroundColor: "transparent",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 12,
    marginTop: 2,
    elevation: 2,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cancelButton: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
