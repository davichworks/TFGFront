import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import UserService from "../services/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function Home({ navigation }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  

  useEffect(() => {
    
    async function fetchContent() {
      const storedImage = await AsyncStorage.getItem("profileImage");
      if (storedImage) {
        setProfileImage(storedImage);
      }

      try {
        const response = await UserService.getPublicContent();
        setContent(response.data);
      } catch (err) {
        setError("Error al cargar el contenido.");
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
                      source={{ uri: profileImage } }
                      style={styles.avatar}
                    />
        <Text style={styles.gymName}>Salesport Gym</Text>
      </View>

      <View style={styles.introBox}>
        <Text style={styles.welcome}>{content.welcome}</Text>
        <Text style={styles.description}>{content.description}</Text>
      </View>

      {/* Features en tarjetas */}
      <View style={styles.featuresGrid}>
        {content.features.map((feat, i) => (
          <View key={i} style={styles.featureCard}>
            <MaterialCommunityIcons name="star-circle" size={32} color="#007AFF" style={{ marginBottom: 8 }} />
            <Text style={styles.featureText}>{feat}</Text>
          </View>
        ))}
      </View>

      {/* Botones de navegación con iconos */}
      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Reservation")}>
          <Ionicons name="calendar" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Reservar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MyReservations")}>
          <FontAwesome5 name="clipboard-list" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Mis Reservas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("GenerateRoutines")}>
          <MaterialCommunityIcons name="dumbbell" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Generar Rutinas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MyRoutines")}>
          <Ionicons name="archive" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Rutinas Guardadas</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    marginTop: 100,
  },
  container: {
    padding: 0,
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    minHeight: "100%",
  },
  header: {
    width: "100%",
    backgroundColor: "#007AFF",
    alignItems: "center",
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#007AFF",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  gymName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  introBox: {
    backgroundColor: "#fff",
    marginTop: -30,
    marginBottom: 15,
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: width * 0.95,
    marginBottom: 25,
    gap: 12,
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    margin: 6,
    width: width * 0.42,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  featureText: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
  },
  navButtons: {
    width: width * 0.95,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 2,
    borderRadius: 30,
    marginBottom: 12,
    minWidth: "45%",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  error: {
    color: "red",
    marginTop: 50,
    fontSize: 18,
    textAlign: "center",
  },
});
