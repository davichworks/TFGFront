// screens/BoardActivity.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  Dimensions
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import ActivityService from "../services/activity.service";
import Icon from "react-native-vector-icons/MaterialIcons";
const { width } = Dimensions.get("window");

const dayOptions = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [classname, setClassname] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [monitor, setMonitor] = useState("");
  const [schedules, setSchedules] = useState([
    { startTime: "", endTime: "", dayOfWeek: "", isSingle: false, specificDate: null }
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPicker, setShowPicker] = useState({ show: false, index: null, mode: 'date' });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await ActivityService.getActivities();
      const act = res.data.map(a => ({
        ...a,
        schedules: a.schedules?.map(s => ({
          ...s,
          specificDate: s.specificDate ? new Date(s.specificDate) : null
        })) || [{ startTime: "", endTime: "", dayOfWeek: "", isSingle: false, specificDate: null }]
      }));
      setActivities(act);
    } catch {
      setError("Error cargando actividades");
    }
  };

  const addSchedule = () => {
    setSchedules([...schedules, { startTime: "", endTime: "", dayOfWeek: "", isSingle: false, specificDate: null }]);
  };

  const removeSchedule = idx => {
    const copy = schedules.filter((_, i) => i !== idx);
    setSchedules(copy);
  };

  const onScheduleChange = (idx, field, value) => {
    const copy = [...schedules];
    copy[idx][field] = value;

    if (field === "specificDate") {
      copy[idx].dayOfWeek = value.toLocaleDateString("es-ES",{ weekday:'long' }).replace(/^\w/,c=>c.toUpperCase());
    }
    if (field === "isSingle" && !value) {
      copy[idx].specificDate = null;
      copy[idx].dayOfWeek = "";
    }
    setSchedules(copy);
  };

  const validate = () => {
    if (!classname || !location || !description || !capacity || !monitor) return "Rellena los campos básicos.";
    if (schedules.length === 0) return "Agrega un horario.";
    for (let s of schedules) {
      if (!s.startTime || !s.endTime) return "Introduce horas de horarios.";
      if (s.isSingle && !s.specificDate) return "Selecciona una fecha específica.";
      if (!s.isSingle && !s.dayOfWeek) return "Selecciona día de la semana.";
    }
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    const formatted = schedules.map(s => ({
      startTime: s.startTime,
      endTime: s.endTime,
      dayOfWeek: s.dayOfWeek,
      isSingle: s.isSingle,
      specificDate: s.isSingle ? s.specificDate.toISOString().slice(0,10) : null
    }));
    try {
      if (editingId) {
        await ActivityService.updateActivity(editingId, classname, location, description, parseInt(capacity), monitor, formatted);
        setSuccess("Actividad actualizada");
      } else {
        await ActivityService.createActivity(classname, location, description, parseInt(capacity), monitor, formatted);
        setSuccess("Actividad creada");
      }
      resetForm();
      loadActivities();
    } catch {
      setError("Error guardando actividad.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setClassname(""); setLocation(""); setDescription(""); setCapacity(""); setMonitor("");
    setSchedules([{ startTime: "", endTime: "", dayOfWeek: "", isSingle: false, specificDate: null }]);
  };

  const onEdit = a => {
    setEditingId(a.id);
    setClassname(a.classname);
    setLocation(a.location);
    setDescription(a.description);
    setCapacity(a.capacity.toString());
    setMonitor(a.monitor);
    setSchedules(a.schedules && a.schedules.length ? a.schedules : [{ startTime: "", endTime: "", dayOfWeek: "", isSingle: false, specificDate: null }]);
  };

  const onDelete = id => {
    Alert.alert("Confirmar", "Eliminar actividad?",[
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
          await ActivityService.deleteActivity(id);
          setSuccess("Eliminada");
          loadActivities();
        }
      }
    ]);
  };

  const openPicker = (mode, idx) => setShowPicker({ show: true, mode, index: idx });

  const onPickerChange = (event, date) => {
    const { index, mode } = showPicker;
    setShowPicker({ ...showPicker, show: false });
    if (mode === 'date' && date) onScheduleChange(index, 'specificDate', date);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}>
      <View style={styles.formCard}>
        <Text style={styles.title}>{ editingId ? "Editar Actividad" : "Crear Actividad" }</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        {[
          { label: "Nombre", value: classname, setter: setClassname, icon: "event" },
          { label: "Ubicación", value: location, setter: setLocation, icon: "place" },
          { label: "Descripción", value: description, setter: setDescription, icon: "description" },
          { label: "Capacidad", value: capacity, setter: setCapacity, keyboard: 'numeric', icon: "people" },
          { label: "Monitor", value: monitor, setter: setMonitor, icon: "person" }
        ].map((f,i)=>
          <View key={i} style={styles.field}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <View style={styles.inputGroup}>
              <Icon name={f.icon} size={20} color="#6c63ff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={f.value}
                onChangeText={f.setter}
                keyboardType={f.keyboard || 'default'}
                placeholder={f.label}
                placeholderTextColor="#aaa"
              />
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Horarios</Text>
        {schedules.map((s, idx)=>
          <View key={idx} style={styles.scheduleBox}>
            <View style={styles.inline}>
              <Text style={styles.scheduleLabel}>Única:</Text>
              <Switch
                value={s.isSingle}
                onValueChange={val => onScheduleChange(idx, 'isSingle', val)}
                thumbColor={s.isSingle ? "#6c63ff" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#b3b0ff" }}
              />
            </View>

            {s.isSingle ? (
              <TouchableOpacity onPress={()=>openPicker('date', idx)} style={styles.dateButton}>
                <Icon name="event-available" size={18} color="#6c63ff" />
                <Text style={styles.dateButtonText}>
                  { s.specificDate ? s.specificDate.toLocaleDateString() : "Selecciona Fecha"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.inline}>
                {dayOptions.map(day=>(
                  <TouchableOpacity key={day}
                    style={ s.dayOfWeek === day ? styles.daySel : styles.dayBtn}
                    onPress={() => onScheduleChange(idx, 'dayOfWeek', day)}>
                    <Text style={ s.dayOfWeek === day ? styles.daySelText : styles.dayBtnText}>{day.slice(0,3)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.inline}>
              <Icon name="schedule" size={18} color="#6c63ff" />
              <TextInput
                placeholder="Inicio (HH:MM)"
                style={styles.timeInput}
                value={s.startTime}
                onChangeText={val => onScheduleChange(idx, 'startTime', val)}
                placeholderTextColor="#aaa"
              />
              <Text style={{ marginHorizontal: 4 }}>-</Text>
              <TextInput
                placeholder="Fin (HH:MM)"
                style={styles.timeInput}
                value={s.endTime}
                onChangeText={val => onScheduleChange(idx, 'endTime', val)}
                placeholderTextColor="#aaa"
              />
            </View>

            {schedules.length > 1 && (
              <TouchableOpacity onPress={() => removeSchedule(idx)} style={styles.removeScheduleBtn}>
                <Icon name="delete" size={20} color="#f44336" />
                <Text style={styles.removeScheduleText}>Eliminar horario</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={addSchedule}>
          <Icon name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Agregar Horario</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}>
          <Icon name={editingId ? "save" : "add"} size={20} color="#fff" />
          <Text style={styles.saveBtnText}>{editingId ? "Actualizar actividad" : "Crear actividad"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>Actividades existentes</Text>
      {activities.length === 0 && <Text style={styles.empty}>No hay actividades registradas</Text>}
      {activities.map(a=>(
        <View key={a.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="event" size={28} color="#6c63ff" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.cardTitle}>{a.classname}</Text>
              <Text style={styles.cardSub}>{a.location} — {a.description}</Text>
              <Text style={styles.cardSub}>Monitor: {a.monitor} | Capacidad: {a.capacity}</Text>
            </View>
          </View>
          <View style={styles.cardSchedules}>
            {a.schedules && a.schedules.map((sch, i) => (
              <View key={i} style={styles.cardScheduleItem}>
                <Icon name="schedule" size={16} color="#6c63ff" />
                <Text style={styles.cardScheduleText}>
                  {sch.isSingle
                    ? `${new Date(sch.specificDate).toLocaleDateString()}`
                    : sch.dayOfWeek}
                  {"  "}
                  {sch.startTime} - {sch.endTime}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => onEdit(a)} style={styles.actionBtn}>
              <Icon name="edit" size={20} color="#6c63ff" />
              <Text style={styles.actionBtnText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(a.id)} style={[styles.actionBtn, { backgroundColor: "#f44336" }]}>
              <Icon name="delete" size={20} color="#fff" />
              <Text style={[styles.actionBtnText, { color: "#fff" }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      { showPicker.show && (
        <DateTimePicker
          value={new Date()}
          mode={showPicker.mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      )}
    </ScrollView>
    
    
  );

  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    width: width * 0.96,
    marginTop: 16,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6c63ff",
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c63ff",
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: 1,
    alignSelf: "flex-start",
  },
  error: {
    color: "#f44336",
    marginBottom: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  success: {
    color: "#4caf50",
    marginBottom: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  field: {
    marginBottom: 10,
    width: "100%",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#222",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 2,
    width: "100%",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: "#222",
    backgroundColor: "transparent",
  },
  scheduleBox: {
    width: "100%",
    backgroundColor: "#f7f7ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    marginBottom: 10,
    marginTop: 4,
    elevation: 1,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 6,
  },
  scheduleLabel: {
    fontWeight: "600",
    color: "#6c63ff",
    marginRight: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaeaff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    marginTop: 2,
  },
  dateButtonText: {
    marginLeft: 6,
    color: "#222",
    fontWeight: "500",
  },
  dayBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 2,
    minWidth: 32,
    alignItems: "center",
  },
  dayBtnText: {
    color: "#222",
    fontWeight: "500",
  },
  daySel: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#6c63ff",
    marginHorizontal: 2,
    minWidth: 32,
    alignItems: "center",
  },
  daySelText: {
    color: "#fff",
    fontWeight: "bold",
  },
  timeInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    textAlign: "center",
    fontSize: 15,
    marginHorizontal: 2,
  },
  removeScheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    alignSelf: "flex-end",
  },
  removeScheduleText: {
    color: "#f44336",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 13,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6c63ff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 6,
    alignSelf: "center",
    elevation: 2,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4caf50",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginTop: 10,
    alignSelf: "center",
    elevation: 2,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 10,
    color: "#6c63ff",
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  empty: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    width: width * 0.96,
    elevation: 2,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },
  cardSub: {
    fontSize: 13,
    color: "#666",
  },
  cardSchedules: {
    marginTop: 6,
    marginBottom: 8,
  },
  cardScheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  cardScheduleText: {
    marginLeft: 6,
    color: "#444",
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaeaff",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginHorizontal: 2,
    elevation: 1,
  },
  actionBtnText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6c63ff",
    fontWeight: "600",
  },
});