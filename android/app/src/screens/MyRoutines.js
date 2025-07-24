import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import GenerateRoutineService from '../services/routine.service';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get("window");

const MyRoutines = () => {
  const [savedRoutines, setSavedRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSavedRoutines = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GenerateRoutineService.getSavedRoutines();
      setSavedRoutines(response.data?.routines || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las rutinas guardadas.');
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSavedRoutines();
    }, [fetchSavedRoutines])
  );

  const handleDeleteRoutine = async (routineId) => {
    Alert.alert(
      'Eliminar rutina',
      '¿Estás seguro de que deseas eliminar esta rutina guardada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(routineId);
            try {
              await GenerateRoutineService.deleteSavedRoutine(routineId);
              setSavedRoutines((prev) => prev.filter((r) => r.id !== routineId));
              Alert.alert('Eliminada', 'La rutina fue eliminada correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la rutina.');
            }
            setDeletingId(null);
          },
        },
      ]
    );
  };

  const renderDietPlanDetails = (plan) => (
    <View style={styles.planDetails}>
      <Text style={styles.detailText}>Kcal: {plan.kcal}</Text>
      <Text style={styles.detailText}>Proteínas: {plan.protein}</Text>
      <Text style={styles.detailText}>Carbohidratos: {plan.carbs}</Text>
      <Text style={styles.detailText}>Grasas: {plan.fats}</Text>
      <Text style={styles.detailText}>Desayuno: {plan.breakfast}</Text>
      <Text style={styles.detailText}>Almuerzo: {plan.lunch}</Text>
      <Text style={styles.detailText}>Cena: {plan.dinner}</Text>
      <Text style={styles.detailText}>Snacks: {plan.snacks}</Text>
    </View>
  );

  const renderExercisePlanDetails = (plan) => (
    <View style={styles.planDetails}>
      <Text style={styles.detailText}>Ejercicios: {plan.exercises}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Mis Rutinas Guardadas</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : savedRoutines.length === 0 ? (
        <Text style={{ marginTop: 40, color: "#888", fontSize: 16 }}>No tienes rutinas guardadas.</Text>
      ) : (
        savedRoutines.map((routine, idx) => (
          <View key={routine.id || idx} style={styles.resultCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.resultTitle}>Rutina {idx + 1}</Text>
              <TouchableOpacity
                style={[styles.saveButton, deletingId === routine.id && { opacity: 0.6 }]}
                onPress={() => handleDeleteRoutine(routine.id)}
                disabled={deletingId === routine.id}
              >
                <Text style={styles.saveButtonText}>
                  {deletingId === routine.id ? 'Eliminando...' : 'Eliminar'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.resultInfo}>Días: <Text style={styles.resultValue}>{routine.days}</Text></Text>
            <Text style={styles.resultInfo}>
              Edad recomendada: <Text style={styles.resultValue}>{routine.minAgeRecommendation} - {routine.maxAgeRecommendation}</Text>
            </Text>
            <Text style={styles.resultInfo}>
              Peso recomendado: <Text style={styles.resultValue}>{routine.minHeightRecommendation} - {routine.maxHeightRecommendation}</Text>
            </Text>

            <Text style={styles.sectionTitle}>Planes de dieta</Text>
            {routine.dietPlans?.map((plan, idx2) => (
              <View key={idx2} style={styles.planContainer}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>Plan {idx2 + 1} - {plan.kcal} kcal</Text>
                </View>
                {renderDietPlanDetails(plan)}
              </View>
            ))}

            <Text style={styles.sectionTitle}>Planes de ejercicio</Text>
            {routine.exercisePlans?.map((plan, idx2) => (
              <View key={idx2} style={styles.planContainer}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>Plan {idx2 + 1}</Text>
                </View>
                {renderExercisePlanDetails(plan)}
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    paddingBottom: 40,
    minHeight: "100%",
  },
  headerCard: {
    width: width * 0.95,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  resultCard: {
    marginTop: 18,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    width: width * 0.92,
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 30,
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
    color: "#007AFF",
    textAlign: "center",
  },
  resultInfo: {
    fontSize: 15,
    color: "#444",
    marginBottom: 2,
  },
  resultValue: {
    fontWeight: "bold",
    color: "#222",
  },
  sectionTitle: {
    marginTop: 15,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#007AFF",
  },
  planContainer: {
    marginBottom: 12,
    backgroundColor: "#f8fafd",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e6ed",
    elevation: 1,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#e6f0ff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  planTitle: {
    fontWeight: "bold",
    color: "#007AFF",
    fontSize: 15,
  },
  planDetails: {
    padding: 12,
    backgroundColor: "#f0f6ff",
  },
  detailText: {
    color: "#333",
    fontSize: 14,
    marginBottom: 2,
  },
  saveButton: {
    backgroundColor: "#e53935",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default MyRoutines;
