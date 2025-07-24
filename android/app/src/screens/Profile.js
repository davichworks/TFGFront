import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserService from "../services/user.service";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from 'react-native-image-picker';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [editingField, setEditingField] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    birthday: "",
    number: "",
    dni: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const userStr = await AsyncStorage.getItem("user");
      const storedImage = await AsyncStorage.getItem("profileImage");
      if (storedImage) {
        setProfileImage(storedImage);
      }
      if (!userStr) {
        navigation.navigate("Home");
        return;
      }
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        birthday: user.birthday || "",
        number: user.number || "",
        dni: user.dni || "",
      });
    };

    fetchUser();
  }, []);

  const toggleEdit = (field) => {
    setEditingField((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleImagePick = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.5,
    includeBase64: true, 
  });

  if (result.didCancel) return;

  const base64Image = `data:${result.assets[0].type};base64,${result.assets[0].base64}`;

  setProfileImage(base64Image);
  await AsyncStorage.setItem("profileImage", base64Image);
};

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    const changedFields = Object.keys(formData).filter(
      (key) => formData[key] !== currentUser[key]
    );

    if (changedFields.length === 0) {
      setEditingField({});
      Alert.alert("Actualizado", "No hubo cambios, pero todo está al día.");
      return;
    }

    const message = changedFields
      .map((field) => `- ${field}: "${currentUser[field]}" → "${formData[field]}"`)
      .join("\n");

    Alert.alert(
      "Confirmar cambios",
      `¿Estás seguro de actualizar los siguientes campos?\n\n${message}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              await UserService.updateUser(
                currentUser.id,
                formData.name,
                formData.username,
                formData.birthday,
                formData.email,
                formData.number,
                formData.dni
              );

              const updatedUser = { ...currentUser, ...formData };
              await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
              setCurrentUser(updatedUser);
              setEditingField({});
              Alert.alert("Éxito", "Datos actualizados correctamente.");
            } catch (error) {
              console.error(error.response?.data || error.message);
              Alert.alert("Error", "No se pudieron actualizar los datos.");
            }
          },
        },
      ]
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleImagePick}>
            <Image
              source={profileImage ? { uri: profileImage } : require("../assets/avatar.jpg")}
              style={styles.avatar}
            />
</TouchableOpacity>
        </View>
        <Text style={styles.name}>{formData.name}</Text>
        <Text style={styles.username}>@{formData.username}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        { [
          { field: "username", icon: "account-outline", label: "Usuario" }, // <-- Añadido aquí
          { field: "email", icon: "email-outline", label: "Correo" },
          { field: "birthday", icon: "cake-variant-outline", label: "Nacimiento" },
          { field: "number", icon: "phone-outline", label: "Teléfono" },
          { field: "dni", icon: "card-account-details-outline", label: "DNI" },
        ].map(({ field, icon, label }) => (
          <View key={field} style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name={icon} size={18} color="#6c63ff" style={{ marginRight: 6 }} />
                <Text style={styles.label}>{label}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleEdit(field)}>
                <Feather
                  name={editingField[field] ? "x" : "edit-3"}
                  size={16}
                  color="#6c63ff"
                />
              </TouchableOpacity>
            </View>
            {editingField[field] ? (
              <TextInput
                value={formData[field]}
                onChangeText={(value) => handleChange(field, value)}
                style={styles.input}
                placeholder={`Editar ${label}`}
                placeholderTextColor="#999"
                autoCapitalize={field === "email" ? "none" : "sentences"}
              />
            ) : (
              <Text style={styles.text}>{formData[field]}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privilegios</Text>
        <View style={styles.rolesRow}>
          {currentUser.roles.map((role, index) => (
            <View key={index} style={styles.roleBadge}>
              <MaterialCommunityIcons name="shield-account" size={16} color="#fff" />
              <Text style={styles.roleText}>
                {role.replace("ROLE_", "").toLowerCase()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Botones */}
      <TouchableOpacity
        onPress={() => navigation.navigate("ChangePassword")}
        style={[styles.button, { backgroundColor: "#444" }]}
      >
        <Feather name="lock" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Cambiar Contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSave}
        style={[styles.button, { backgroundColor: "#6c63ff" }]}
      >
        <Feather name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    fontSize: 18,
    color: "#6c63ff",
  },
  container: {
    padding: 0,
    backgroundColor: "#f5f7fa",
    flexGrow: 1,
    alignItems: "center",
  },
  header: {
    width: "100%",
    backgroundColor: "#6c63ff",
    alignItems: "center",
    paddingVertical: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarContainer: {
    backgroundColor: "#fff",
    borderRadius: 60,
    padding: 4,
    marginBottom: 10,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
    marginBottom: 2,
  },
  username: {
    fontSize: 15,
    color: "#e0e0e0",
    marginBottom: 4,
  },
  section: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c63ff",
    marginBottom: 10,
    letterSpacing: 1,
  },
  inputContainer: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#6c63ff",
    letterSpacing: 1,
  },
  text: {
    fontSize: 15,
    color: "#444",
    paddingLeft: 2,
    paddingBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 7,
    paddingHorizontal: 12,
    fontSize: 15,
    borderRadius: 8,
    color: "#333",
    backgroundColor: "#f7f7ff",
    marginTop: 2,
  },
  rolesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6c63ff",
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 6,
  },
  roleText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 5,
    textTransform: "capitalize",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 14,
    marginTop: 2,
    elevation: 2,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});