// UserInfoScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import InputField from "../resources/InputField";
import UserInfoService from "../services/userInfo.service";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";

export default function UserInfo() {
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    gender: "male",
    age: "",
    peso: "",
    altura: "",
    cadera: "",
    cintura: "",
    lvl: "medium",
  });
  const [selectedMetric, setSelectedMetric] = useState("peso");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const screenWidth = Dimensions.get("window").width;

  // Cargar historial y datos actuales solo al montar
  useEffect(() => {
    fetchUserHistoryAndSetForm();
    // eslint-disable-next-line
  }, []);

  // Recarga historial y datos cada vez que se entra en la pestaña
  useFocusEffect(
    React.useCallback(() => {
      fetchUserHistoryAndSetForm();
    }, [])
  );

  // --- Cambia esta función para que SIEMPRE actualice el formulario con los datos más recientes ---
  const fetchUserHistoryAndSetForm = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await UserInfoService.getUserHistory();
      if (Array.isArray(res.data) && res.data.length > 0) {
        setHistory(res.data);
        const latest = res.data[0];
        setFormData({
          gender: latest.gender || "male",
          age: latest.age?.toString() || "",
          peso: latest.peso?.toString() || "",
          altura: latest.altura?.toString() || "",
          cadera: latest.cadera?.toString() || "",
          cintura: latest.cintura?.toString() || "",
          lvl: latest.lvl || "medium",
        });
      } else {
        setHistory([]);
        setFormData({
          gender: "male",
          age: "",
          peso: "",
          altura: "",
          cadera: "",
          cintura: "",
          lvl: "medium",
        });
      }
    } catch (err) {
      setError("Error al cargar historial");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Cuando guardas, vuelve a cargar los datos y actualiza el formulario
  const handleCreateOrUpdate = async () => {
    const { gender, age, peso, altura, cadera, cintura, lvl } = formData;
    if (!gender || !age || !peso || !altura || !cadera || !cintura || !lvl) {
      setError("Por favor, complete todos los campos.");
      setSuccess("");
      return;
    }
    setUpdating(true);
    setError("");
    setSuccess("");
    try {
      await UserInfoService.createUserInfo(
        gender,
        parseInt(age),
        parseFloat(peso),
        parseFloat(altura),
        parseFloat(cadera),
        parseFloat(cintura),
        lvl
      );
      setSuccess("Datos actualizados correctamente.");
      // Recarga historial y actualiza los inputs con los nuevos datos
      await fetchUserHistoryAndSetForm();
    } catch (err) {
      setError("No se pudo actualizar la información.");
    } finally {
      setUpdating(false);
    }
  };

  const metrics = [
    { key: "peso", label: "Peso", icon: "scale-bathroom" },
    { key: "altura", label: "Altura", icon: "human-male-height" },
    { key: "cintura", label: "Cintura", icon: "tape-measure" },
    { key: "cadera", label: "Cadera", icon: "tape-measure" },
    { key: "imc", label: "IMC", icon: "calculator-variant" },
    { key: "cc", label: "CC", icon: "ruler" },
    { key: "pgc", label: "% Grasa", icon: "percent-outline" },
  ];

  const getMetricValue = (item) => item[selectedMetric] ?? 0;

  const getYAxisSuffix = () => {
    if (["peso", "pgc"].includes(selectedMetric)) return "kg";
    if (["altura", "cintura", "cadera", "cc"].includes(selectedMetric)) return "cm";
    return "";
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f5f7fa" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.profileHeader}>
          <MaterialIcons name="account-circle" size={70} color="#6c63ff" />
          <Text style={styles.title}>Mi Perfil Saludable</Text>
          <Text style={styles.subtitle}>Gestiona y visualiza tu progreso</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Datos personales</Text>
          <View style={styles.formColumn}>
            <InputField
              label="Género"
              value={formData.gender}
              onChangeText={(text) => handleChange("gender", text)}
              icon="gender-male-female"
              style={styles.input}
            />
            <InputField
              label="Edad"
              value={formData.age}
              onChangeText={(text) => handleChange("age", text)}
              icon="calendar"
              style={styles.input}
            />
            <InputField
              label="Peso (kg)"
              value={formData.peso}
              onChangeText={(text) => handleChange("peso", text)}
              icon="scale-bathroom"
              style={styles.input}
            />
            <InputField
              label="Altura (cm)"
              value={formData.altura}
              onChangeText={(text) => handleChange("altura", text)}
              icon="human-male-height"
              style={styles.input}
            />
            <InputField
              label="Cadera (cm)"
              value={formData.cadera}
              onChangeText={(text) => handleChange("cadera", text)}
              icon="tape-measure"
              style={styles.input}
            />
            <InputField
              label="Cintura (cm)"
              value={formData.cintura}
              onChangeText={(text) => handleChange("cintura", text)}
              icon="tape-measure"
              style={styles.input}
            />
            <InputField
              label="Nivel (low/medium/high)"
              value={formData.lvl}
              onChangeText={(text) => handleChange("lvl", text)}
              icon="run"
              style={styles.input}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}
          <TouchableOpacity
            style={[styles.button, updating && { opacity: 0.7 }]}
            onPress={handleCreateOrUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" size={20} style={{ marginRight: 8 }} />
            ) : (
              <MaterialIcons name="content-save" size={20} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.buttonText}>{updating ? "Guardando..." : "Actualizar Datos"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Historial y Progreso</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={styles.metricSelector}>
              {metrics.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.metricButton,
                    selectedMetric === m.key && styles.metricButtonSelected,
                  ]}
                  onPress={() => setSelectedMetric(m.key)}
                >
                  <MaterialIcons
                    name={m.icon}
                    size={18}
                    color={selectedMetric === m.key ? "#fff" : "#6c63ff"}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.metricButtonText,
                      selectedMetric === m.key && styles.metricButtonTextSelected,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {loading ? (
            <ActivityIndicator size="large" color="#6c63ff" style={{ marginVertical: 20 }} />
          ) : history.length > 0 ? (
            <LineChart
              data={{
                labels: history.map((item) => new Date(item.createdAt).toLocaleDateString()),
                datasets: [{ data: history.map(getMetricValue) }],
              }}
              width={screenWidth - 32}
              height={220}
              yAxisSuffix={getYAxisSuffix()}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                labelColor: () => "#222",
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#6c63ff",
                },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 12, elevation: 2 }}
            />
          ) : (
            <Text style={styles.notice}>No hay historial disponible.</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: "#f5f7fa",
    flexGrow: 1,
    alignItems: "center",
  },
  profileHeader: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    width: "96%",
    marginTop: 18,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    color: "#6c63ff",
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 2,
    marginBottom: 2,
    textAlign: "center",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    width: "96%",
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#6c63ff",
    letterSpacing: 0.5,
    textAlign: "left",
  },
  formColumn: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 10,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#6c63ff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "#f44336",
    marginTop: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  success: {
    color: "#4caf50",
    marginTop: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  notice: {
    color: "#888",
    fontStyle: "italic",
    marginVertical: 10,
    textAlign: "center",
  },
  metricSelector: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
    gap: 4,
  },
  metricButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: "#eaeaff",
    borderRadius: 8,
    marginRight: 8,
    elevation: 1,
  },
  metricButtonSelected: {
    backgroundColor: "#6c63ff",
  },
  metricButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 15,
  },
  metricButtonTextSelected: {
    color: "#fff",
  },
});