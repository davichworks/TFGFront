import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Switch, // Añadido para los checkboxes
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import RoutineService from "../services/routine.service";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Añadido para obtener el usuario

const CreateRoutine = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [exercisePlans, setExercisePlans] = useState([]);
  const [healthRoutines, setHealthRoutines] = useState([]);

  const [dp, setDp] = useState({
    kcal: "", protein: "", carbs: "", fats: "",
    breakfast: "", lunch: "", dinner: "", snacks: ""
  });
  const [ep, setEp] = useState("");
  const [exerciseList, setExerciseList] = useState([""]);

  const [showDietModal, setShowDietModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showDietList, setShowDietList] = useState(false);
  const [showExerciseList, setShowExerciseList] = useState(false);

  const [hr, setHr] = useState({
    name: "", description: "", type: null, days: "",
    minAge: "", maxAge: "", minHeight: "",
    maxHeight: "", activityLevel: null,
    selectedDietPlans: [], selectedExercisePlans: []
  });

  const [expandedDietPlan, setExpandedDietPlan] = useState(null);
  const [expandedExercisePlan, setExpandedExercisePlan] = useState(null);
  const [exercisePlanTitle, setExercisePlanTitle] = useState("");
  const [exerciseRows, setExerciseRows] = useState([{ name: "", sets: "", reps: "" }]);

  const [showOnlyMinePlans, setShowOnlyMinePlans] = useState(false);
  const [showOnlyMineRoutines, setShowOnlyMineRoutines] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserId(user.id);
        }
      } catch (e) {
        setUserId(null);
      }
    };
    getUser();
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [dpRes, epRes, hrRes] = await Promise.all([
        RoutineService.getDietPlans(),
        RoutineService.getExercisePlans(),
        RoutineService.getHealthRoutines()
      ]);
      setDietPlans(dpRes.data || []);
      setExercisePlans(epRes.data || []);
      setHealthRoutines(hrRes.data.routines || []);
    } catch (e) {
      Alert.alert("Error", "Error cargando los datos.");
      console.error(e);
    }
  };

  // Filtrado según el switch y el userId
  const filteredDietPlans = showOnlyMinePlans && userId
    ? dietPlans.filter(plan => plan.userId === userId)
    : dietPlans;
  const filteredExercisePlans = showOnlyMinePlans && userId
    ? exercisePlans.filter(plan => plan.userId === userId)
    : exercisePlans;
  const filteredHealthRoutines = showOnlyMineRoutines && userId
    ? healthRoutines.filter(routine => routine.userId === userId)
    : healthRoutines;

  const createDietPlan = async () => {
    if (Object.values(dp).some(v => !v)) {
      Alert.alert("Error", "Completa todos los campos del Diet Plan.");
      return;
    }

    try {
      await RoutineService.createDietPlan({
        ...dp,
        kcal: Number(dp.kcal),
        protein: Number(dp.protein),
        carbs: Number(dp.carbs),
        fats: Number(dp.fats)
      });
      setDp({ kcal: "", protein: "", carbs: "", fats: "", breakfast: "", lunch: "", dinner: "", snacks: "" });
      setShowDietModal(false);
      loadAll();
    } catch (e) {
      Alert.alert("Error", "No se pudo crear el Diet Plan.");
    }
  };

  const addExerciseField = () => setExerciseList([...exerciseList, ""]);
  const removeExerciseField = (idx) => setExerciseList(exerciseList.filter((_, i) => i !== idx));
  const updateExerciseField = (text, idx) => setExerciseList(exerciseList.map((ex, i) => i === idx ? text : ex));

  const createExercisePlan = async () => {
    const exercises = exerciseList.map(e => e.trim()).filter(Boolean);
    if (!exercises.length) {
      Alert.alert("Error", "Añade al menos un ejercicio.");
      return;
    }
    try {
      await RoutineService.createExercisePlan({ exercises: exercises.join(", ") });
      setExerciseList([""]);
      setShowExerciseModal(false);
      loadAll();
    } catch (e) {
      Alert.alert("Error", "No se pudo crear el Exercise Plan.");
    }
  };

  const createHealthRoutine = async () => {
    const requiredFields = [
      "name", "description", "type", "days", 
      "minAge", "maxAge", "minHeight", "maxHeight", "activityLevel"
    ];
    const hasEmpty = requiredFields.some(field => !hr[field]);

    if (hasEmpty) {
      Alert.alert("Error", "Completa todos los campos de la rutina.");
      return;
    }

    if (!hr.selectedDietPlans.length || !hr.selectedExercisePlans.length) {
      Alert.alert("Error", "Selecciona al menos un Diet Plan y un Exercise Plan.");
      return;
    }

    try {
      await RoutineService.createHealthRoutine({
        name: hr.name,
        description: hr.description,
        type: hr.type,
        days: Number(hr.days),
        minAgeRecommendation: Number(hr.minAge),
        maxAgeRecommendation: Number(hr.maxAge),
        minHeightRecommendation: Number(hr.minHeight),
        maxHeightRecommendation: Number(hr.maxHeight),
        activityLevel: hr.activityLevel,
        dietPlanIds: hr.selectedDietPlans,
        exercisePlanIds: hr.selectedExercisePlans,
        creationDate: new Date()
      });

      setHr({
        name: "", description: "", type: null, days: "",
         minAge: "", maxAge: "", minHeight: "",
        maxHeight: "", activityLevel: null,
        selectedDietPlans: [], selectedExercisePlans: []
      });

      loadAll();
      Alert.alert("Éxito", "Rutina creada correctamente.");
    } catch (e) {
      Alert.alert("Error", "No se pudo crear la rutina.");
    }
  };

  const toggleItem = (id, key) => {
    setHr(prev => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter(i => i !== id)
        : [...prev[key], id]
    }));
  };

  const renderModalInput = (modalType) => {
    if (modalType === "diet") {
      return (
        <Modal visible={showDietModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Nuevo Diet Plan</Text>
              <Text style={styles.subTitle}>Macronutrientes</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Kcal"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={dp.kcal}
                  onChangeText={text => setDp({ ...dp, kcal: text.replace(/\D/g, "") })}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Proteína"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={dp.protein}
                  onChangeText={text => setDp({ ...dp, protein: text.replace(/\D/g, "") })}
                  maxLength={4}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Carbs"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={dp.carbs}
                  onChangeText={text => setDp({ ...dp, carbs: text.replace(/\D/g, "") })}
                  maxLength={4}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Grasas"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={dp.fats}
                  onChangeText={text => setDp({ ...dp, fats: text.replace(/\D/g, "") })}
                  maxLength={4}
                />
              </View>
              <Text style={styles.subTitle}>Comidas</Text>
              {["breakfast", "lunch", "dinner", "snacks"].map((key) => (
                <TextInput
                  key={key}
                  style={styles.input}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  placeholderTextColor="#888"
                  value={dp[key]}
                  onChangeText={text => setDp({ ...dp, [key]: text })}
                  maxLength={60}
                />
              ))}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.button} onPress={createDietPlan}>
                  <MaterialIcons name="content-save" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDietModal(false)}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }

    if (modalType === "exercise") {
      return (
        <Modal visible={showExerciseModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Nuevo Exercise Plan</Text>
              <TextInput
                style={styles.input}
                placeholder="Título del plan"
                placeholderTextColor="#888"
                value={exercisePlanTitle}
                onChangeText={setExercisePlanTitle}
                maxLength={40}
              />
              <Text style={styles.subTitle}>Ejercicios</Text>
              {exerciseRows.map((ex, idx) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 }}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    placeholder={`Ejercicio ${idx + 1}`}
                    placeholderTextColor="#888"
                    value={ex.name}
                    onChangeText={text => {
                      const newList = [...exerciseRows];
                      newList[idx].name = text;
                      setExerciseRows(newList);
                    }}
                    maxLength={30}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Series"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={ex.sets}
                    onChangeText={text => {
                      const newList = [...exerciseRows];
                      newList[idx].sets = text.replace(/\D/g, "");
                      setExerciseRows(newList);
                    }}
                    maxLength={2}
                  />
                  <Text style={{ marginHorizontal: 2, color: "#374151" }}>x</Text>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Reps"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={ex.reps}
                    onChangeText={text => {
                      const newList = [...exerciseRows];
                      newList[idx].reps = text.replace(/\D/g, "");
                      setExerciseRows(newList);
                    }}
                    maxLength={2}
                  />
                  {exerciseRows.length > 1 && (
                    <TouchableOpacity onPress={() => {
                      const newList = exerciseRows.filter((_, i) => i !== idx);
                      setExerciseRows(newList);
                    }}>
                      <MaterialIcons name="delete" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setExerciseRows([...exerciseRows, { name: "", sets: "", reps: "" }])}
                style={[styles.actionBtn, { marginBottom: 10 }]}
              >
                <MaterialIcons name="plus" size={18} color="#2563eb" />
                <Text style={styles.actionBtnText}>Añadir ejercicio</Text>
              </TouchableOpacity>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={async () => {
                    if (!exercisePlanTitle.trim() || exerciseRows.some(e => !e.name || !e.sets || !e.reps)) {
                      Alert.alert("Error", "Completa el título y todos los ejercicios.");
                      return;
                    }
                    // Estructura: título en la primera línea, luego cada ejercicio como "nombre seriesxreps"
                    const exercisesString = [
                      exercisePlanTitle.trim(),
                      ...exerciseRows.map(e => `${e.name.trim()} ${e.sets}x${e.reps}`)
                    ].join("\n");
                    try {
                      await RoutineService.createExercisePlan({ exercises: exercisesString });
                      setExercisePlanTitle("");
                      setExerciseRows([{ name: "", sets: "", reps: "" }]);
                      setShowExerciseModal(false);
                      loadAll();
                    } catch (e) {
                      Alert.alert("Error", "No se pudo crear el Exercise Plan.");
                    }
                  }}
                >
                  <MaterialIcons name="content-save" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                  setShowExerciseModal(false);
                  setExercisePlanTitle("");
                  setExerciseRows([{ name: "", sets: "", reps: "" }]);
                }}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }
  };

  const renderHeader = () => (
    <View>
      {renderModalInput("diet")}
      {renderModalInput("exercise")}

      <Text style={styles.sectionTitle}>Crear Rutina Saludable</Text>
      <View style={styles.card}>
        {[
          { key: "name", label: "Nombre" },
          { key: "description", label: "Descripción" },
          { key: "days", label: "Días", numeric: true },
          { key: "minAge", label: "Edad mínima", numeric: true },
          { key: "maxAge", label: "Edad máxima", numeric: true },
          { key: "minHeight", label: "Peso mínimo", numeric: true },
          { key: "maxHeight", label: "Peso máximo", numeric: true },
        ].map(({ key, label, numeric }) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={label}
            placeholderTextColor="#888"
            keyboardType={numeric ? "numeric" : "default"}
            value={hr[key]}
            onChangeText={text => setHr({ ...hr, [key]: text })}
            maxLength={numeric ? 4 : 40}
          />
        ))}

        <RNPickerSelect
          placeholder={{ label: "Tipo de rutina", value: null }}
          items={["adelgazar", "mantenimiento", "aumentar masa muscular", "tonificar", "volumen"]
            .map(type => ({ label: type, value: type }))}
          onValueChange={(value) => setHr({ ...hr, type: value })}
          value={hr.type}
          style={pickerStyles}
        />

        <RNPickerSelect
          placeholder={{ label: "Nivel de actividad", value: null }}
          items={["sedentario", "moderado", "activo"]
            .map(level => ({ label: level, value: level }))}
          onValueChange={(value) => setHr({ ...hr, activityLevel: value })}
          value={hr.activityLevel}
          style={pickerStyles}
        />

        {/* Switch para mostrar sólo mis Diet/Exercise Plans */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Switch
            value={showOnlyMinePlans}
            onValueChange={setShowOnlyMinePlans}
            thumbColor={showOnlyMinePlans ? "#2563eb" : "#ccc"}
            trackColor={{ false: "#ccc", true: "#a5b4fc" }}
          />
          <Text style={{ marginLeft: 8, color: "#2563eb", fontWeight: "bold" }}>
            Mostrar sólo mis Diet/Exercise Plans
          </Text>
        </View>

        <TouchableOpacity onPress={() => setShowDietList(v => !v)} style={styles.accordionHeader}>
          <Text style={styles.subTitle}>Selecciona Diet Plans</Text>
          <MaterialIcons name={showDietList ? "chevron-up" : "chevron-down"} size={22} color="#2563eb" />
        </TouchableOpacity>
        {showDietList && (
          <View style={styles.accordionContent}>
            {filteredDietPlans.map(plan => {
              const expanded = expandedDietPlan === plan.id;
              return (
                <View key={plan.id} style={{ marginBottom: 6 }}>
                  <TouchableOpacity
                    style={[
                      styles.selectItem,
                      hr.selectedDietPlans.includes(plan.id) && styles.selectedItem
                    ]}
                    onPress={() => toggleItem(plan.id, "selectedDietPlans")}
                    onLongPress={() => setExpandedDietPlan(expanded ? null : plan.id)}
                    delayLongPress={150}
                  >
                    <MaterialIcons
                      name={hr.selectedDietPlans.includes(plan.id)
                        ? "checkbox-marked" : "checkbox-blank-outline"}
                      size={20}
                      color="#2563eb"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ fontWeight: "bold", flex: 1 }}>{plan.breakfast}</Text>
                    <TouchableOpacity onPress={() => setExpandedDietPlan(expanded ? null : plan.id)}>
                      <MaterialIcons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="#2563eb" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {expanded && (
                    <View style={{ backgroundColor: "#f1f5f9", borderRadius: 6, padding: 10, marginTop: 2 }}>
                      <Text style={{ color: "#374151", fontWeight: "bold", marginBottom: 4 }}>Macronutrientes</Text>
                      <Text style={{ color: "#374151", marginBottom: 2 }}>
                        Kcal: {plan.kcal} | Prot: {plan.protein} | Carb: {plan.carbs} | Grasas: {plan.fats}
                      </Text>
                      <Text style={{ color: "#374151", fontWeight: "bold", marginTop: 6 }}>Comidas</Text>
                      <Text style={{ color: "#374151" }}>Desayuno: {plan.breakfast}</Text>
                      <Text style={{ color: "#374151" }}>Comida: {plan.lunch}</Text>
                      <Text style={{ color: "#374151" }}>Cena: {plan.dinner}</Text>
                      <Text style={{ color: "#374151" }}>Snacks: {plan.snacks}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity onPress={() => setShowExerciseList(v => !v)} style={styles.accordionHeader}>
          <Text style={styles.subTitle}>Selecciona Exercise Plans</Text>
          <MaterialIcons name={showExerciseList ? "chevron-up" : "chevron-down"} size={22} color="#2563eb" />
        </TouchableOpacity>
        {showExerciseList && (
          <View style={styles.accordionContent}>
            {filteredExercisePlans.map(plan => {
              const lines = (plan.exercises || "").split("\n").map(l => l.trim()).filter(Boolean);
              const title = lines[0] || "";
              const exercises = lines.slice(1);
              const expanded = expandedExercisePlan === plan.id;
              return (
                <View key={plan.id} style={{ marginBottom: 6 }}>
                  <TouchableOpacity
                    style={[
                      styles.selectItem,
                      hr.selectedExercisePlans.includes(plan.id) && styles.selectedItem
                    ]}
                    onPress={() => toggleItem(plan.id, "selectedExercisePlans")}
                    onLongPress={() => setExpandedExercisePlan(expanded ? null : plan.id)}
                    delayLongPress={150}
                  >
                    <MaterialIcons
                      name={hr.selectedExercisePlans.includes(plan.id)
                        ? "checkbox-marked" : "checkbox-blank-outline"}
                      size={20}
                      color="#2563eb"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ fontWeight: "bold", flex: 1 }}>{title}</Text>
                    <TouchableOpacity onPress={() => setExpandedExercisePlan(expanded ? null : plan.id)}>
                      <MaterialIcons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="#2563eb" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {expanded && (
                    <View style={{ backgroundColor: "#f1f5f9", borderRadius: 6, padding: 10, marginTop: 2 }}>
                      {exercises.map((ex, idx) => (
                        <Text key={idx} style={{ color: "#374151" }}>{ex}</Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={createHealthRoutine}>
          <MaterialIcons name="plus" size={18} color="#fff" />
          <Text style={styles.buttonText}>Crear Rutina</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowDietModal(true)}>
          <MaterialIcons name="food-apple" size={18} color="#2563eb" />
          <Text style={styles.actionBtnText}>Nuevo Diet Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowExerciseModal(true)}>
          <MaterialIcons name="dumbbell" size={18} color="#2563eb" />
          <Text style={styles.actionBtnText}>Nuevo Exercise Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {renderModalInput("diet")}
        {renderModalInput("exercise")}

        <Text style={styles.sectionTitle}>Crear Rutina Saludable</Text>
        <View style={styles.card}>
          {[
            { key: "name", label: "Nombre" },
            { key: "description", label: "Descripción" },
            { key: "days", label: "Días", numeric: true },
            { key: "minAge", label: "Edad mínima", numeric: true },
            { key: "maxAge", label: "Edad máxima", numeric: true },
            { key: "minHeight", label: "Peso mínimo", numeric: true },
            { key: "maxHeight", label: "Peso máximo", numeric: true },
          ].map(({ key, label, numeric }) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={label}
              placeholderTextColor="#888"
              keyboardType={numeric ? "numeric" : "default"}
              value={hr[key]}
              onChangeText={text => setHr({ ...hr, [key]: text })}
              maxLength={numeric ? 4 : 40}
            />
          ))}

          <RNPickerSelect
            placeholder={{ label: "Tipo de rutina", value: null }}
            items={["adelgazar", "mantenimiento", "aumentar masa muscular", "tonificar", "volumen"]
              .map(type => ({ label: type, value: type }))}
            onValueChange={(value) => setHr({ ...hr, type: value })}
            value={hr.type}
            style={pickerStyles}
          />

          <RNPickerSelect
            placeholder={{ label: "Nivel de actividad", value: null }}
            items={["sedentario", "moderado", "activo"]
              .map(level => ({ label: level, value: level }))}
            onValueChange={(value) => setHr({ ...hr, activityLevel: value })}
            value={hr.activityLevel}
            style={pickerStyles}
          />

          {/* Switch para mostrar sólo mis Diet/Exercise Plans */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Switch
              value={showOnlyMinePlans}
              onValueChange={setShowOnlyMinePlans}
              thumbColor={showOnlyMinePlans ? "#2563eb" : "#ccc"}
              trackColor={{ false: "#ccc", true: "#a5b4fc" }}
            />
            <Text style={{ marginLeft: 8, color: "#2563eb", fontWeight: "bold" }}>
              Mostrar sólo mis Diet/Exercise Plans
            </Text>
          </View>

          <TouchableOpacity onPress={() => setShowDietList(v => !v)} style={styles.accordionHeader}>
            <Text style={styles.subTitle}>Selecciona Diet Plans</Text>
            <MaterialIcons name={showDietList ? "chevron-up" : "chevron-down"} size={22} color="#2563eb" />
          </TouchableOpacity>
          {showDietList && (
            <View style={styles.accordionContent}>
              {filteredDietPlans.map(plan => {
                const expanded = expandedDietPlan === plan.id;
                return (
                  <View key={plan.id} style={{ marginBottom: 6 }}>
                    <TouchableOpacity
                      style={[
                        styles.selectItem,
                        hr.selectedDietPlans.includes(plan.id) && styles.selectedItem
                      ]}
                      onPress={() => toggleItem(plan.id, "selectedDietPlans")}
                      onLongPress={() => setExpandedDietPlan(expanded ? null : plan.id)}
                      delayLongPress={150}
                    >
                      <MaterialIcons
                        name={hr.selectedDietPlans.includes(plan.id)
                          ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={20}
                        color="#2563eb"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ fontWeight: "bold", flex: 1 }}>{plan.breakfast}</Text>
                      <TouchableOpacity onPress={() => setExpandedDietPlan(expanded ? null : plan.id)}>
                        <MaterialIcons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="#2563eb" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                    {expanded && (
                      <View style={{ backgroundColor: "#f1f5f9", borderRadius: 6, padding: 10, marginTop: 2 }}>
                        <Text style={{ color: "#374151", fontWeight: "bold", marginBottom: 4 }}>Macronutrientes</Text>
                        <Text style={{ color: "#374151", marginBottom: 2 }}>
                          Kcal: {plan.kcal} | Prot: {plan.protein} | Carb: {plan.carbs} | Grasas: {plan.fats}
                        </Text>
                        <Text style={{ color: "#374151", fontWeight: "bold", marginTop: 6 }}>Comidas</Text>
                        <Text style={{ color: "#374151" }}>Desayuno: {plan.breakfast}</Text>
                        <Text style={{ color: "#374151" }}>Comida: {plan.lunch}</Text>
                        <Text style={{ color: "#374151" }}>Cena: {plan.dinner}</Text>
                        <Text style={{ color: "#374151" }}>Snacks: {plan.snacks}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity onPress={() => setShowExerciseList(v => !v)} style={styles.accordionHeader}>
            <Text style={styles.subTitle}>Selecciona Exercise Plans</Text>
            <MaterialIcons name={showExerciseList ? "chevron-up" : "chevron-down"} size={22} color="#2563eb" />
          </TouchableOpacity>
          {showExerciseList && (
            <View style={styles.accordionContent}>
              {filteredExercisePlans.map(plan => {
                const lines = (plan.exercises || "").split("\n").map(l => l.trim()).filter(Boolean);
                const title = lines[0] || "";
                const exercises = lines.slice(1);
                const expanded = expandedExercisePlan === plan.id;
                return (
                  <View key={plan.id} style={{ marginBottom: 6 }}>
                    <TouchableOpacity
                      style={[
                        styles.selectItem,
                        hr.selectedExercisePlans.includes(plan.id) && styles.selectedItem
                      ]}
                      onPress={() => toggleItem(plan.id, "selectedExercisePlans")}
                      onLongPress={() => setExpandedExercisePlan(expanded ? null : plan.id)}
                      delayLongPress={150}
                    >
                      <MaterialIcons
                        name={hr.selectedExercisePlans.includes(plan.id)
                          ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={20}
                        color="#2563eb"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ fontWeight: "bold", flex: 1 }}>{title}</Text>
                      <TouchableOpacity onPress={() => setExpandedExercisePlan(expanded ? null : plan.id)}>
                        <MaterialIcons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="#2563eb" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                    {expanded && (
                      <View style={{ backgroundColor: "#f1f5f9", borderRadius: 6, padding: 10, marginTop: 2 }}>
                        {exercises.map((ex, idx) => (
                          <Text key={idx} style={{ color: "#374151" }}>{ex}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={createHealthRoutine}>
            <MaterialIcons name="plus" size={18} color="#fff" />
            <Text style={styles.buttonText}>Crear Rutina</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowDietModal(true)}>
            <MaterialIcons name="food-apple" size={18} color="#2563eb" />
            <Text style={styles.actionBtnText}>Nuevo Diet Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowExerciseModal(true)}>
            <MaterialIcons name="dumbbell" size={18} color="#2563eb" />
            <Text style={styles.actionBtnText}>Nuevo Exercise Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Switch para mostrar sólo mis rutinas */}
      <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 16, marginTop: 8 }}>
        <Switch
          value={showOnlyMineRoutines}
          onValueChange={setShowOnlyMineRoutines}
          thumbColor={showOnlyMineRoutines ? "#2563eb" : "#ccc"}
          trackColor={{ false: "#ccc", true: "#a5b4fc" }}
        />
        <Text style={{ marginLeft: 8, color: "#2563eb", fontWeight: "bold" }}>
          Mostrar sólo mis Rutinas
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Rutinas creadas</Text>
      <FlatList
        data={filteredHealthRoutines}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View>
              <Text style={styles.itemText}>{item.name} ({item.type})</Text>
              <Text style={styles.itemSubText}>
                Días: {item.days} | Usuario: {item.userId}
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                await RoutineService.deleteHealthRoutine(item.id);
                loadAll();
              }}
            >
              <MaterialIcons name="delete" size={22} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#888", marginVertical: 12 }}>
            No hay rutinas creadas.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9fafb",
    flex: 1,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 12,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#2563eb",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
    color: "#333",

  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600"
  },
  cancelBtn: {
    backgroundColor: "#888",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginLeft: 8,
    paddingHorizontal: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 4,
    elevation: 1,
    gap: 8,
  },
  actionBtnText: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 15,
  },
  selectList: {
    marginBottom: 10,
  },
  selectItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  selectedItem: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb",
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
    color: "#111827"
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 10,
    elevation: 1,
  },
  itemText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 15,
  },
  itemSubText: {
    color: "#666",
    fontSize: 13,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 22,
    width: "90%",
    elevation: 5,
    shadowColor: "#2563eb",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 14,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e0e7ff",
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    marginBottom: 2,
  },
  accordionContent: {
    marginBottom: 8,
  },
});

const pickerStyles = {
  inputIOS: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
    color: "#111827"
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
    color: "#111827"
  }
};

export default CreateRoutine;
