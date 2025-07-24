import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import GenerateRoutineService from '../services/routine.service';
import { ro } from 'date-fns/locale';

const { width } = Dimensions.get("window");

const GoalTypes = {
  ADELGAZAR: 'adelgazar',
  MANTENIMIENTO: 'mantenimiento',
  AUMENTAR_MASA_MUSCULAR: 'aumentar masa muscular',
  TONIFICAR: 'tonificar',
  VOLUMEN: 'volumen',
};


const ActivityLevels = {
  SEDENTARIO: 'sedentario',
  MODERADO: 'moderado',
  ACTIVO: 'activo',
};

const RecommendRoutine = () => {
  const [goalType, setGoalType] = useState(GoalTypes.ADELGAZAR);
  const [days, setDays] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState(ActivityLevels.SEDENTARIO);
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedDietPlan, setExpandedDietPlan] = useState(null);
  const [expandedExercisePlan, setExpandedExercisePlan] = useState(null);

  const handleSaveRoutine = async () => {
    if (!routine) return;
    setSaving(true);
    try {
      await GenerateRoutineService.saveRoutine({routineId : routine.id}); 
      Alert.alert('Rutina guardada', 'La rutina se ha guardado correctamente.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la rutina.');
    }
    setSaving(false);
  };

  const goalTypeLabels = {
  adelgazar: 'Adelgazar',
  mantenimiento: 'Mantenimiento',
  'aumentar masa muscular': 'Aumentar masa muscular',
  tonificar: 'Tonificar',
  volumen: 'Volumen',
};
  const handleGenerate = async () => {
    setLoading(true);
    setRoutine(null);
    try {
      const params = {
        goalType,
        days: Number(days),
        age: Number(age),
        height: Number(height),
        activityLevel,
      };
      const response = await GenerateRoutineService.getRecommendedRoutines(params);
      if (response.data && response.data.routines && response.data.routines.length > 0) {
        setRoutine(response.data.routines[0]);
      } else {
        Alert.alert('Sin resultados', 'No se encontraron rutinas recomendadas.');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo obtener la rutina');
    }
    setLoading(false);
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

        <Text style={styles.title}>Generar Rutina Recomendada</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Tipo de rutina</Text>
        <Picker
          selectedValue={goalType}
          onValueChange={setGoalType}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          {Object.entries(GoalTypes).map(([key, value]) => (
            <Picker.Item key={key} label={value} value={value} color="#222" />
          ))}
        </Picker>


        <Text style={styles.label}>Días por semana</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 3"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={days}
          onChangeText={setDays}
        />

        <Text style={styles.label}>edad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 25"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 70"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />

        <Text style={styles.label}>Nivel de actividad</Text>
        <Picker
          selectedValue={activityLevel}
          onValueChange={setActivityLevel}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          {Object.entries(ActivityLevels).map(([key, value]) => (
            <Picker.Item key={key} label={value} value={value} color="#222" />
          ))}
        </Picker>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Generar Rutina'}</Text>
        </TouchableOpacity>
      </View>

      {routine && (
        <View style={styles.resultCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.resultTitle}>Rutina Recomendada</Text>
            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSaveRoutine}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar Rutina'}</Text>
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
          {routine.dietPlans?.map((plan, idx) => {
            const isExpanded = expandedDietPlan === idx;
            return (
              <View key={idx} style={styles.planContainer}>
                <TouchableOpacity
                  onPress={() => setExpandedDietPlan(isExpanded ? null : idx)}
                  style={styles.planHeader}
                >
                  <Text style={styles.planTitle}>Plan {idx + 1} - {plan.kcal} kcal</Text>
                  <Text style={styles.toggleButton}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {isExpanded && renderDietPlanDetails(plan)}
              </View>
            );
          })}

          <Text style={styles.sectionTitle}>Planes de ejercicio</Text>
          {routine.exercisePlans?.map((plan, idx) => {
            const isExpanded = expandedExercisePlan === idx;
            return (
              <View key={idx} style={styles.planContainer}>
                <TouchableOpacity
                  onPress={() => setExpandedExercisePlan(isExpanded ? null : idx)}
                  style={styles.planHeader}
                >
                  <Text style={styles.planTitle}>Plan {idx + 1}</Text>
                  <Text style={styles.toggleButton}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {isExpanded && renderExercisePlanDetails(plan)}
              </View>
            );
          })}
        </View>
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
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: width * 0.92,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 18,
  },
  label: {
    alignSelf: "flex-start",
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
    marginTop: 10,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    width: "100%",
    color: "#222",
    backgroundColor: "#f8fafd",
    fontSize: 15,
  },
  picker: {
    width: "100%",
    height: 48,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f8fafd",
    color: "#222",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 22,
    marginTop: 18,
    width: "100%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
  toggleButton: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#007AFF",
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
});

export default RecommendRoutine;