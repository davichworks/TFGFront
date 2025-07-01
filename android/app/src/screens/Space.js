import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';
import SpaceService from "../services/space.service";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");
const dayOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

class Space extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spaces: [],
      editingSpaceId: null,
      name: "",
      location: "",
      capacity: "",
      schedules: [
        { startTime: "", endTime: "", dayOfWeek: "", isSingle: false, specificDate: null },
      ],
      snackbar: { open: false, message: "", severity: "info" },
      showDatePickerIndex: null,
      showTimePicker: null,
    };
  }

  componentDidMount() {
    this.loadSpaces();
  }

  loadSpaces = async () => {
    try {
      const response = await SpaceService.getSpaces();
      const spaces = response.data.map(space => {
        const schedules = Array.isArray(space.schedules) && space.schedules.length > 0
          ? space.schedules.map(s => ({
              startTime: s.startTime,
              endTime: s.endTime,
              isSingle: s.isSingle,
              dayOfWeek: s.dayOfWeek,
              specificDate: s.isSingle && s.specificDate ? new Date(s.specificDate) : null
            }))
          : [{
              startTime: "",
              endTime: "",
              isSingle: false,
              dayOfWeek: "",
              specificDate: null
            }];
        return { ...space, schedules };
      });
      this.setState({ spaces });
    } catch (error) {
      this.setSnackbar(true, "Error cargando espacios", "error");
    }
  };

  setSnackbar = (open, message, severity = "info") => {
    this.setState({ snackbar: { open, message, severity } });
    if (open) {
      setTimeout(() => this.setState({ snackbar: { open: false, message: "", severity: "info" } }), 4000);
    }
  };

  handleScheduleChange = (index, field, value) => {
    this.setState(prev => {
      const schedules = [...prev.schedules];
      schedules[index][field] = value;
      if (field === "specificDate" && value) {
        const dayName = value.toLocaleDateString("es-ES", { weekday: "long" });
        schedules[index].dayOfWeek = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      }
      if (field === "isSingle" && value === false) {
        schedules[index].specificDate = null;
        schedules[index].dayOfWeek = "";
      }
      return { schedules };
    });
  };

  addSchedule = () => {
    this.setState(prev => ({
      schedules: [...prev.schedules, { startTime: "", endTime: "", dayOfWeek: "", isSingle: false, specificDate: null }],
    }));
  };

  removeSchedule = (index) => {
    this.setState(prev => ({
      schedules: prev.schedules.filter((_, i) => i !== index),
    }));
  };

  validateForm = () => {
    const { name, location, capacity, schedules } = this.state;
    if (!name.trim() || !location.trim() || !capacity) {
      return "Complete todos los campos.";
    }
    if (schedules.length === 0) return "Agregue al menos un horario.";
    for (const s of schedules) {
      if (!s.startTime || !s.endTime) return "Complete todas las horas en los horarios.";
      if (s.isSingle && !s.specificDate) return "Seleccione la fecha para la actividad única.";
      if (!s.isSingle && !s.dayOfWeek) return "Seleccione el día de la semana para horarios recurrentes.";
    }
    return null;
  };

  resetForm = () => {
    this.setState({
      editingSpaceId: null,
      name: "",
      capacity: "",
      location: "",
      schedules: [{ startTime: "", endTime: "", dayOfWeek: "", isSingle: false, specificDate: null }],
    });
  };

  createOrUpdateSpace = async () => {
    const validationError = this.validateForm();
    if (validationError) {
      this.setSnackbar(true, validationError, "error");
      return;
    }
    const { editingSpaceId, name, capacity, location, schedules } = this.state;
    const formattedSchedules = schedules.map(s => {
      let specificDate = null;
      if (s.isSingle && s.specificDate) {
        const date = new Date(s.specificDate);
        date.setDate(date.getDate() );
        specificDate = date.toISOString().slice(0, 10);
      }
      return {
        startTime: s.startTime,
        endTime: s.endTime,
        dayOfWeek: s.dayOfWeek,
        isSingle: s.isSingle,
        specificDate: specificDate,
      };
    });
    try {
      if (editingSpaceId) {
        await SpaceService.updateSpace(editingSpaceId, name, parseInt(capacity), location, formattedSchedules);
        this.setSnackbar(true, "Espacio actualizado exitosamente", "success");
      } else {
        await SpaceService.createSpace(name, parseInt(capacity), location, formattedSchedules);
        this.setSnackbar(true, "Espacio creado exitosamente", "success");
      }
      this.resetForm();
      this.loadSpaces();
    } catch {
      this.setSnackbar(true, "Error al guardar espacio", "error");
    }
  };

  handleEditClick = (space) => {
    const mappedSchedules = space.schedules && space.schedules.length
      ? space.schedules.map(s => ({
          ...s,
          specificDate: s.specificDate ? new Date(s.specificDate) : null,
        }))
      : [{ startTime: "", endTime: "", dayOfWeek: "", isSingle: false, specificDate: null }];
    this.setState({
      editingSpaceId: space.id,
      name: space.name,
      capacity: space.capacity.toString(),
      location: space.location,
      schedules: mappedSchedules,
    });
  };

  handleDeleteClick = (id) => {
    Alert.alert(
      "Confirmación",
      "¿Seguro desea eliminar este espacio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await SpaceService.deleteSpace(id);
              this.setSnackbar(true, "Espacio eliminado", "success");
              this.loadSpaces();
            } catch {
              this.setSnackbar(true, "Error al eliminar espacio", "error");
            }
          }
        }
      ]
    );
  };

  showDatePicker = (index) => {
    this.setState({ showDatePickerIndex: index });
  };

  showTimePicker = (index, field) => {
    this.setState({ showTimePicker: { index, field } });
  };

  onDateChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      this.setState({ showDatePickerIndex: null });
      return;
    }
    this.handleScheduleChange(this.state.showDatePickerIndex, "specificDate", selectedDate);
    this.setState({ showDatePickerIndex: null });
  };

  onTimeChange = (event, selectedTime) => {
    if (event.type === "dismissed") {
      this.setState({ showTimePicker: null });
      return;
    }
    const { index, field } = this.state.showTimePicker;
    const hours = selectedTime.getHours().toString().padStart(2, "0");
    const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;
    this.handleScheduleChange(index, field, timeString);
    this.setState({ showTimePicker: null });
  };

  render() {
    const { spaces, editingSpaceId, name, location, capacity, schedules, snackbar, showDatePickerIndex, showTimePicker } = this.state;

    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}>
        <View style={styles.formCard}>
          <Text style={styles.title}>{editingSpaceId ? "Editar Espacio" : "Crear Espacio"}</Text>
          {snackbar.open && (
            <View style={[styles.snackbar, snackbar.severity === "error" ? styles.error : styles.success]}>
              <Text style={styles.snackbarText}>{snackbar.message}</Text>
            </View>
          )}
          <View style={styles.field}>
            <Icon name="office-building-marker" size={20} color="#2563eb" style={styles.inputIcon} />
            <TextInput
              placeholder="Nombre del Espacio"
              value={name}
              onChangeText={text => this.setState({ name: text })}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.field}>
            <Icon name="map-marker" size={20} color="#6c63ff" style={styles.inputIcon} />
            <TextInput
              placeholder="Localización"
              value={location}
              onChangeText={text => this.setState({ location: text })}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.field}>
            <Icon name="account-group" size={20} color="#4caf50" style={styles.inputIcon} />
            <TextInput
              placeholder="Capacidad"
              value={capacity}
              onChangeText={text => this.setState({ capacity: text.replace(/[^0-9]/g, "") })}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#aaa"
            />
          </View>

          <Text style={styles.sectionTitle}>Horarios</Text>
          {schedules.map((s, idx) => (
            <View key={idx} style={styles.scheduleBox}>
              <View style={styles.inline}>
                <CheckBox
                  value={s.isSingle}
                  onValueChange={val => this.handleScheduleChange(idx, "isSingle", val)}
                  tintColors={{ true: "#6c63ff", false: "#ccc" }}
                />
                <Text style={styles.scheduleLabel}>Horario Único</Text>
              </View>
              {s.isSingle ? (
                <TouchableOpacity onPress={() => this.showDatePicker(idx)} style={styles.dateButton}>
                  <Icon name="calendar" size={18} color="#6c63ff" />
                  <Text style={styles.dateButtonText}>
                    {s.specificDate ? s.specificDate.toLocaleDateString("es-ES") : "Seleccione fecha"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.inline}>
                  {dayOptions.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={s.dayOfWeek === day ? styles.daySel : styles.dayBtn}
                      onPress={() => this.handleScheduleChange(idx, "dayOfWeek", day)}
                    >
                      <Text style={s.dayOfWeek === day ? styles.daySelText : styles.dayBtnText}>{day.slice(0, 3)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.inline}>
                <Icon name="clock-outline" size={18} color="#6c63ff" />
                <TouchableOpacity onPress={() => this.showTimePicker(idx, "startTime")} style={styles.timeInput}>
                  <Text style={styles.timeInputText}>{s.startTime || "Hora inicio"}</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 4 }}>-</Text>
                <TouchableOpacity onPress={() => this.showTimePicker(idx, "endTime")} style={styles.timeInput}>
                  <Text style={styles.timeInputText}>{s.endTime || "Hora fin"}</Text>
                </TouchableOpacity>
              </View>
              {schedules.length > 1 && (
                <TouchableOpacity onPress={() => this.removeSchedule(idx)} style={styles.removeScheduleBtn}>
                  <Icon name="delete" size={20} color="#f44336" />
                  <Text style={styles.removeScheduleText}>Eliminar horario</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={this.addSchedule}>
            <Icon name="plus-circle-outline" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Agregar Horario</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={this.createOrUpdateSpace}>
            <Icon name={editingSpaceId ? "content-save" : "plus"} size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{editingSpaceId ? "Actualizar Espacio" : "Crear Espacio"}</Text>
          </TouchableOpacity>
          {editingSpaceId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={this.resetForm}>
              <Icon name="close" size={18} color="#fff" />
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.subTitle}>Espacios Existentes</Text>
        {spaces.length === 0 ? (
          <Text style={styles.empty}>No hay espacios creados.</Text>
        ) : (
          spaces.map(space => (
            <View key={space.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="office-building-marker" size={28} color="#2563eb" style={{ marginRight: 10 }} />
                <View>
                  <Text style={styles.cardTitle}>{space.name}</Text>
                  <Text style={styles.cardSub}>{space.location}</Text>
                  <Text style={styles.cardSub}>Capacidad: {space.capacity}</Text>
                </View>
              </View>
              <Text style={styles.scheduleLabel}>Horarios:</Text>
              <View style={styles.cardSchedules}>
                {space.schedules && space.schedules.length > 0 ? (
                  space.schedules.map((s, i) => {
                    const timeRange = `${s.startTime} - ${s.endTime}`;
                    const day = s.isSingle
                      ? s.specificDate ? new Date(s.specificDate).toLocaleDateString("es-ES") : "Fecha inválida"
                      : s.dayOfWeek;
                    return (
                      <View key={i} style={styles.cardScheduleItem}>
                        <Icon name="calendar-clock" size={16} color="#6c63ff" />
                        <Text style={styles.cardScheduleText}>{day} ({timeRange})</Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.cardScheduleText}>No definido</Text>
                )}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => this.handleEditClick(space)} style={styles.actionBtn}>
                  <Icon name="pencil" size={18} color="#6c63ff" />
                  <Text style={styles.actionBtnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.handleDeleteClick(space.id)} style={[styles.actionBtn, { backgroundColor: "#f44336" }]}>
                  <Icon name="delete" size={18} color="#fff" />
                  <Text style={[styles.actionBtnText, { color: "#fff" }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {(showDatePickerIndex !== null) && (
          <DateTimePicker
            value={schedules[showDatePickerIndex].specificDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={this.onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={(() => {
              const val = schedules[showTimePicker.index][showTimePicker.field];
              if (val) {
                const [h, m] = val.split(":");
                const date = new Date();
                date.setHours(parseInt(h, 10));
                date.setMinutes(parseInt(m, 10));
                return date;
              }
              return new Date();
            })()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={this.onTimeChange}
          />
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 0 },
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
    color: "#2563eb",
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
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 2,
    width: "100%",
    marginBottom: 10,
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
    backgroundColor: "#2563eb",
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
    alignItems: "center",
    marginHorizontal: 2,
  },
  timeInputText: {
    color: "#222",
    fontSize: 15,
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
    backgroundColor: "#2563eb",
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
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#757575",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 8,
    alignSelf: "center",
    elevation: 1,
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 10,
    color: "#2563eb",
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
    color: "#2563eb",
    fontWeight: "600",
  },
  snackbar: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    width: "100%",
  },
  error: {
    backgroundColor: "#f44336",
  },
  success: {
    backgroundColor: "#4caf50",
  },
  snackbarText: {
    color: "white",
    textAlign: "center",
  },
});

export default Space;