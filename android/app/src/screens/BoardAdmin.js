import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
} from "react-native";
import AdminService from "../services/admin.service";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

export default function BoardAdmin() {
  const [content, setContent] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterBlocked, setFilterBlocked] = useState(false);
  const [filterTrainer, setFilterTrainer] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    refreshContent();
  }, []);

  const refreshContent = () => {
    AdminService.getAdminBoard()
      .then((response) => {
        setContent(response.data || []);
        setError(null);
      })
      .catch((err) => {
        const errMsg =
          (err.response && err.response.data && err.response.data.message) ||
          err.message ||
          "Error al cargar los usuarios.";
        setError(errMsg);
      });
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirmar",
      "¿Seguro que quieres eliminar este usuario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            AdminService.deleteUser(id)
              .then(() => {
                setSuccess("Usuario eliminado con éxito");
                refreshContent();
              })
              .catch((err) => {
                const errMsg =
                  (err.response &&
                    err.response.data &&
                    err.response.data.message) ||
                  err.message ||
                  "Error al eliminar usuario.";
                setError(errMsg);
              });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleBlock = (id) => {
    AdminService.blockUser(id)
      .then(() => {
        setSuccess("Usuario bloqueado/desbloqueado con éxito");
        refreshContent();
      })
      .catch((err) => {
        const errMsg =
          (err.response && err.response.data && err.response.data.message) ||
          err.message ||
          "Error al bloquear usuario.";
        setError(errMsg);
      });
  };

  const handleCreateTrainer = (id) => {
    AdminService.createTrainer(id)
      .then(() => {
        setSuccess("Usuario actualizado como entrenador");
        refreshContent();
      })
      .catch((err) => {
        const errMsg =
          (err.response && err.response.data && err.response.data.message) ||
          err.message ||
          "Error al asignar entrenador.";
        setError(errMsg);
      });
  };

  const filteredContent = content
    .filter((user) =>
      user.username.toLowerCase().startsWith(filterName.toLowerCase())
    )
    .filter((user) =>
      user.email.toLowerCase().startsWith(filterEmail.toLowerCase())
    )
    .filter((user) => (!filterBlocked ? true : user.emailBlocked))
    .filter(
      (user) => (!filterTrainer ? true : user.roles.some((r) => r.name === "trainer"))
    );

  const sortedContent = filteredContent.sort((a, b) => {
    if (a.emailBlocked && !b.emailBlocked) {
      return 1;
    } else if (!a.emailBlocked && b.emailBlocked) {
      return -1;
    }
    return 0;
  });

  const renderRoleBadges = (roles) => (
    <View style={styles.roleBadgeRow}>
      {roles.map((role, idx) => (
        <View key={idx} style={styles.roleBadge}>
          <Icon name="verified-user" size={14} color="#fff" />
          <Text style={styles.roleBadgeText}>
            {role.name === "trainer" ? "Entrenador" : role.name}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Usuarios</Text>

      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Filtros</Text>
        <View style={styles.filterRow}>
          <View style={styles.inputGroup}>
            <Icon name="person-search" size={18} color="#6c63ff" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Filtrar por usuario"
              placeholderTextColor="#999"
              value={filterName}
              onChangeText={setFilterName}
              autoCapitalize="none"
              keyboardAppearance="default"
            />
          </View>
          <View style={styles.inputGroup}>
            <Icon name="alternate-email" size={18} color="#6c63ff" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Filtrar por email"
              placeholderTextColor="#999"
              value={filterEmail}
              onChangeText={setFilterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              keyboardAppearance="default"
            />
          </View>
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Solo bloqueados</Text>
            <Switch
              value={filterBlocked}
              onValueChange={setFilterBlocked}
              thumbColor={filterBlocked ? "#6c63ff" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#b3b0ff" }}
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Solo entrenadores</Text>
            <Switch
              value={filterTrainer}
              onValueChange={setFilterTrainer}
              thumbColor={filterTrainer ? "#6c63ff" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#b3b0ff" }}
            />
          </View>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>{success}</Text>}

      <FlatList
        data={sortedContent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={[styles.userCard, item.emailBlocked && styles.userCardBlocked]}>
            <View style={styles.userHeader}>
              <Icon name="account-circle" size={38} color={item.emailBlocked ? "#ff9800" : "#6c63ff"} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
                {renderRoleBadges(item.roles)}
              </View>
              {item.emailBlocked && (
                <View style={styles.blockedBadge}>
                  <Icon name="block" size={16} color="#fff" />
                  <Text style={styles.blockedText}>Bloqueado</Text>
                </View>
              )}
            </View>
            <View style={styles.actions}>
              <View style={{ flex: 1, flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.roles.some((r) => r.name === "trainer")
                      ? styles.trainerActive
                      : null,
                    { flex: 1 },
                  ]}
                  onPress={() => handleCreateTrainer(item.id)}
                >
                  <Icon
                    name="fitness-center"
                    size={22}
                    color={item.roles.some((r) => r.name === "trainer") ? "#6c63ff" : "#222"}
                  />
                  <Text style={styles.actionText}>
                    {item.roles.some((r) => r.name === "trainer")
                      ? "Quitar entrenador"
                      : "Asignar entrenador"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#f44336", borderColor: "#f44336", flex: 1 },
                  ]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Icon name="delete" size={22} color="white" />
                  <Text style={[styles.actionText, { color: "white" }]}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: item.emailBlocked ? "#ff9800" : "#6c63ff",
                    borderColor: item.emailBlocked ? "#ff9800" : "#6c63ff",
                    marginTop: 8,
                    width: "100%",
                  },
                ]}
                onPress={() => handleBlock(item.id)}
              >
                <Icon name="block" size={22} color="white" />
                <Text style={[styles.actionText, { color: "white" }]}>
                  {item.emailBlocked ? "Desbloquear" : "Bloquear"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay usuarios</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: "#f5f7fa",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#6c63ff",
    marginTop: 24,
    marginBottom: 10,
    letterSpacing: 1,
    textAlign: "center",
  },
  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    width: width * 0.95,
    alignSelf: "center",
    elevation: 2,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c63ff",
    marginBottom: 10,
    letterSpacing: 1,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: "#222",
    backgroundColor: "transparent",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: "#555",
    marginRight: 4,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    width: width * 0.95,
    alignSelf: "center",
    elevation: 2,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  userCardBlocked: {
    borderColor: "#ff9800",
    borderWidth: 2,
    backgroundColor: "#fff7e6",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  blockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff9800",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  blockedText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 4,
  },
  roleBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
    flexWrap: "wrap",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6c63ff",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginTop: 2,
  },
  roleBadgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "column",
    marginTop: 10,
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6c63ff",
    backgroundColor: "#fff",
    marginHorizontal: 2,
    elevation: 1,
  },
  trainerActive: {
    borderColor: "#6c63ff",
    backgroundColor: "#eaeaff",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#222",
    fontWeight: "600",
  },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
  success: { color: "green", textAlign: "center", marginBottom: 10 },
  empty: { textAlign: "center", marginTop: 30, fontSize: 16, color: "#999" },
});
