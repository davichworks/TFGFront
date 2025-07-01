import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ReservationService from '../services/reservation.service';
import { useFocusEffect } from '@react-navigation/native';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchReservations();
    }, [])
  );

  const fetchReservations = async () => {
    try {
      const response = await ReservationService.getReservation();
      setReservations(response.data || []);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Eliminar reserva',
      '¿Estás seguro de que deseas eliminar esta reserva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ReservationService.deleteReservation(id);
              setReservations((prev) => prev.filter((res) => res.id !== id));
              Alert.alert('Eliminada', 'La reserva fue eliminada correctamente.');
            } catch (error) {
              console.error('Error al eliminar reserva:', error);
              Alert.alert('Error', 'No se pudo eliminar la reserva.');
            }
          },
        },
      ]
    );
  };

  const renderReservation = ({ item }) => {
    const isActivity = item.reservableType === 'activity';
    const reservable = isActivity ? item.activity : item.space;

    if (!reservable ) return null;

    const isCancelled = item.state === 'cancelada';

    return (
      <View style={[styles.card, isCancelled && styles.cancelledCard]}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons
              name={isActivity ? "run" : "office-building-marker"}
              size={22}
              color={isActivity ? "#6c63ff" : "#2563eb"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.title, isCancelled && styles.cancelledText]}>
              {isActivity ? reservable.classname : reservable.name}
            </Text>
          </View>
          {!isCancelled && (
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Feather name="trash-2" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="tag-outline" size={16} color="#6c63ff" />
          <Text style={[styles.detail, isCancelled && styles.cancelledText]}>
            {isActivity ? 'Actividad' : 'Espacio'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="map-marker" size={16} color="#2563eb" />
          <Text style={[styles.detail, isCancelled && styles.cancelledText]}>
            {reservable.location}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="clock-outline" size={16} color="#2563eb" />
          <Text style={[styles.detail, isCancelled && styles.cancelledText]}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>
        {item.specificDate && (
          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-check" size={16} color="#4caf50" />
            <Text style={[styles.detail, isCancelled && styles.cancelledText]}>
              Fecha específica: {item.specificDate}
            </Text>
          </View>
        )}
        <View style={styles.stateRow}>
          <MaterialIcons
            name={isCancelled ? "close-circle-outline" : "clock-check-outline"}
            size={16}
            color={isCancelled ? "#9ca3af" : "#2563eb"}
          />
          <Text style={[styles.state, isCancelled ? styles.cancelledState : styles.pendingState]}>
            Estado: {item.state}
          </Text>
        </View>
      </View>
    );
  };

  const filteredReservations = reservations
    .filter((r) => showHistory ? r.state === 'cancelada' : r.state !== 'cancelada')
    .sort((a, b) => b.id - a.id);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10 }}>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Ver historial de reservas</Text>
        <Switch
          value={showHistory}
          onValueChange={setShowHistory}
          thumbColor={showHistory ? "#2563eb" : "#9ca3af"}
          trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
        />
      </View>

      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReservation}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {showHistory ? 'No hay reservas canceladas.' : 'No tienes reservas pendientes.'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: '#fff',
    minHeight: 200,
  },
  card: {
    backgroundColor: '#f7f7ff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
    shadowColor: '#6c63ff',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cancelledCard: {
    backgroundColor: '#f3f4f6',
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22223b',
  },
  detail: {
    fontSize: 14,
    color: '#374151',
  },
  state: {
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  pendingState: {
    color: '#2563eb',
  },
  cancelledState: {
    color: '#9ca3af',
  },
  cancelledText: {
    color: '#9ca3af',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f5f7fa",
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    color: '#6b7280',
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    padding: 6,
    marginLeft: 8,
    elevation: 1,
  },
});

export default MyReservations;
