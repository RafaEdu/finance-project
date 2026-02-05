import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
  },
  profileIcon: {
    marginRight: 15,
  },
  // Filtros
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeFilterButton: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  filterText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#0000ff",
    fontWeight: "bold",
  },
  // Navegação de Data
  dateNavContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  dateNavButton: {
    padding: 5,
  },
  dateNavText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  // Resumo (Cards Pequenos)
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  // Saldo Toggle
  balanceToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    padding: 5,
  },
  balanceToggleText: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  // Card de Saldo Grande
  balanceCard: {
    backgroundColor: "#34495e",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#bdc3c7",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  secondaryBalanceContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    width: "100%",
    alignItems: "center",
  },
  // Lista de Transações
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 40,
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 30,
  },
  emptyText: {
    color: "#95a5a6",
    fontSize: 16,
  },
  transactionCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconWrapper: {
    marginRight: 15,
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginRight: 8,
  },
  installmentBadge: {
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  installmentText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  recurrenceBadge: {
    backgroundColor: "#27ae60",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  recurrenceText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  transactionDate: {
    fontSize: 12,
    color: "#95a5a6",
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
});
