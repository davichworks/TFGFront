import React, { useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
} from "react-native";
import {
  addDays,
  subDays,
  format,
  getDay
} from "date-fns";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ReservationService from "../services/reservation.service";
import ActivityService from "../services/activity.service";
import SpaceService from "../services/space.service";
import UserService from "../services/user.service";
import { useFocusEffect } from '@react-navigation/native';
import PushNotification from "react-native-push-notification";

const diasSemana = [
  "Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"
];

export default function Reservation() {
  const [activities, setActivities] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [selectedResourceKey, setSelectedResourceKey] = useState(null);

  const [customStartHour, setCustomStartHour] = useState("");
  const [customStartMinute, setCustomStartMinute] = useState("");
  const [customEndHour, setCustomEndHour] = useState("");
  const [customEndMinute, setCustomEndMinute] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      ActivityService.getActivities().then(res => setActivities(res.data || []));
      SpaceService.getSpaces().then(res => setSpaces(res.data || []));
      UserService.getTrainers().then(res => setTrainers(res.data || []));
    }, [])
  );
 
  const nextDays = () => setCurrentStartDate(d => addDays(d, 3));
  const prevDays = () => {
    const today = new Date();
    const newDate = subDays(currentStartDate, 3);
    if (newDate >= new Date(today.setHours(0, 0, 0, 0))) {
      setCurrentStartDate(newDate);
    }
  };

  const currentDays = Array.from({ length: 3 }, (_, i) => addDays(currentStartDate, i));

  const handleHourInput = (text, setter) => {
    const clean = text.replace(/[^0-9]/g, "");
    if (clean.length <= 2) {
      setter(clean);
    }
  };

  const createReservation = async (resource, type, day, schedule) => {
    const dateStr = format(day, "yyyy-MM-dd");
    let startTime, endTime;

    if (type === "activity") {
      startTime = schedule.startTime;
      endTime = schedule.endTime;
    } else {
      if (!customStartHour || !customStartMinute || !customEndHour || !customEndMinute) {
        Alert.alert("Error", "Por favor ingresa hora y minutos de inicio y fin");
        return;
      }

      startTime = `${customStartHour.padStart(2, "0")}:${customStartMinute.padStart(2, "0")}`;
      endTime = `${customEndHour.padStart(2, "0")}:${customEndMinute.padStart(2, "0")}`;

      const horaRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
      if (!horaRegex.test(startTime) || !horaRegex.test(endTime)) {
        Alert.alert("Error", "Introduce la hora en formato HH:mm válido (ej: 09:30)");
        return;
      }

      if (endTime <= startTime) {
        Alert.alert("Error", "La hora de fin debe ser mayor que la hora de inicio");
        return;
      }
    }

   
      const specificDate =  dateStr;

    try {
      const reservation = await ReservationService.createReservation(type, resource.id, specificDate, startTime, endTime);
      const reservationId = reservation.id;
      const reservationDateTime = new Date(`${specificDate}T${startTime}`);
      console.log(reservationDateTime.toString());
      // Notificación 15 minutos antes
      const notificationTime = new Date(reservationDateTime.getTime() - 15 * 60 * 1000);
      const now = new Date();
     
      
      console.log("Notificación programada para:", notificationTime.toString());
      console.log("Hora actual:", now.toString());
      const notificationTimes = new Date(2025, 6, 6, 21, 59);
        PushNotification.localNotificationSchedule({
          channelId: "default-channel-id", // asegúrate de crear este canal en Android
          title: "¡Recuerda tu reserva!",
          date: notificationTimes,
          allowWhileIdle: true,
        });
      

      Alert.alert("Reservado", "Reserva creada con éxito");
      setSelectedResourceKey(null);
      setCustomStartHour("");
      setCustomStartMinute("");
      setCustomEndHour("");
      setCustomEndMinute("");
    } catch (error) {
      console.error("Error al crear la reserva:", error);
      Alert.alert("Error", "No se pudo crear la reserva");
    }
  };

  const renderResource = (resource, schedule, type, day) => {
    const key = `${type}-${resource.id}-${format(day, "yyyy-MM-dd")}-${schedule.startTime}`;
    const isSelected = selectedResourceKey === key;

    return (
      <View
        key={key}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <TouchableOpacity
          onPress={() => setSelectedResourceKey(isSelected ? null : key)}
          style={styles.cardHeaderRow}
        >
          <Icon
            name={type === "activity" ? "run" : "office-building-marker"}
            size={28}
            color={type === "activity" ? "#6c63ff" : "#2563eb"}
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {type === "activity"
                ? resource.classname
                : `Espacio: ${resource.name}`}
            </Text>
            <Text style={styles.cardSub}>
              {schedule.startTime} - {schedule.endTime}
            </Text>
          </View>
          <Icon
            name={isSelected ? "chevron-up" : "chevron-down"}
            size={26}
            color="#6c63ff"
          />
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.cardDetails}>
            {type === "activity" && (
              <>
                <View style={styles.detailRow}>
                  <Icon name="map-marker" size={18} color="#6c63ff" />
                  <Text style={styles.detail}> {resource.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="text-box-outline" size={18} color="#6c63ff" />
                  <Text style={styles.detail}> {resource.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="account" size={18} color="#6c63ff" />
                  <Text style={styles.detail}> Monitor: {resource.monitor}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="account-group" size={18} color="#6c63ff" />
                  <Text style={styles.detail}> Capacidad: {resource.capacity}</Text>
                </View>
              </>
            )}
            {type === "space" && (
              <>
                <View style={styles.detailRow}>
                  <Icon name="office-building" size={18} color="#2563eb" />
                  <Text style={styles.detail}> Tipo: {resource.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="account-group" size={18} color="#2563eb" />
                  <Text style={styles.detail}> Capacidad: {resource.capacity}</Text>
                </View>
                <Text style={[styles.detail, { marginTop: 8 }]}>⏰ Hora de Inicio:</Text>
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="HH"
                    keyboardType="numeric"
                    maxLength={2}
                    value={customStartHour}
                    onChangeText={text => handleHourInput(text, setCustomStartHour)}
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="MM"
                    keyboardType="numeric"
                    maxLength={2}
                    value={customStartMinute}
                    onChangeText={text => handleHourInput(text, setCustomStartMinute)}
                  />
                </View>
                <Text style={styles.detail}>⏰ Hora de Fin:</Text>
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="HH"
                    keyboardType="numeric"
                    maxLength={2}
                    value={customEndHour}
                    onChangeText={text => handleHourInput(text, setCustomEndHour)}
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="MM"
                    keyboardType="numeric"
                    maxLength={2}
                    value={customEndMinute}
                    onChangeText={text => handleHourInput(text, setCustomEndMinute)}
                  />
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.reserveButton}
              onPress={() => createReservation(resource, type, day, schedule)}
            >
              <Icon name="calendar-check" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.reserveButtonText}>Reservar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const today = new Date();
  const minDate = new Date(today.setHours(0, 0, 0, 0));
  const isAtMinDate = currentStartDate <= minDate;

  const getSchedulesForDay = (resource, day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const weekdayStr = diasSemana[getDay(day)];
    return (resource.schedules || []).filter(s =>
      (s.isSingle && s.specificDate === dateStr) ||
      (!s.isSingle && s.dayOfWeek === weekdayStr)
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={prevDays}
          style={[styles.navButton, isAtMinDate && { opacity: 0.4 }]}
          disabled={isAtMinDate}
        >
          <Icon name="chevron-left" size={24} color="#6c63ff" />
        </TouchableOpacity>
        <Text style={styles.title}>Reservas Disponibles</Text>
        <TouchableOpacity onPress={nextDays} style={styles.navButton}>
          <Icon name="chevron-right" size={24} color="#6c63ff" />
        </TouchableOpacity>
      </View>

      {currentDays.map((day, idx) => (
        <View key={idx} style={styles.daySection}>
          <Text style={styles.dayTitle}>{format(day, "eeee dd/MM/yyyy")}</Text>

          <Text style={styles.sectionLabel}>🎯 Actividades</Text>
          {
            activities.flatMap(a =>
              getSchedulesForDay(a, day).map(schedule =>
                renderResource(a, schedule, "activity", day)
              )
            ).length === 0 ? (
              <Text style={styles.empty}>No hay actividades para este día</Text>
            ) : (
              activities.flatMap(a =>
                getSchedulesForDay(a, day).map(schedule =>
                  renderResource(a, schedule, "activity", day)
                )
              )
            )
          }

          <Text style={styles.sectionLabel}>🏢 Espacios</Text>
          {
            spaces.flatMap(s =>
              getSchedulesForDay(s, day).map(schedule =>
                renderResource(s, schedule, "space", day)
              )
            ).length === 0 ? (
              <Text style={styles.empty}>No hay espacios para este día</Text>
            ) : (
              spaces.flatMap(s =>
                getSchedulesForDay(s, day).map(schedule =>
                  renderResource(s, schedule, "space", day)
                )
              )
            )
          }
        </View>
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { backgroundColor: "#f5f7fa", flex: 1, padding: 0 },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  navButton: {
    padding: 10,
    backgroundColor: "#eaeaff",
    borderRadius: 10,
    elevation: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6c63ff",
    letterSpacing: 1,
    textAlign: "center",
  },
  daySection: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 10,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#22223b",
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#6c63ff",
    marginTop: 10,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#f7f7ff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardSelected: {
    borderColor: "#6c63ff",
    backgroundColor: "#eaeaff",
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    color: "#6c63ff",
    fontWeight: "600",
  },
  cardDetails: {
    marginTop: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 4,
  },
  reserveButton: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    elevation: 2,
  },
  reserveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    color: "#111827",
    backgroundColor: "#f9fafb"
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 2,
  },
  timeInput: {
    width: 40,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "#fff",
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 4,
  },
  empty: {
    color: "#bbb",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    marginTop: 2,
  },
});