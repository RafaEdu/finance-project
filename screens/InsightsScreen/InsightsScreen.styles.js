import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Layout
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
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },

  // Tag Picker
  tagPickerContainer: {
    marginBottom: 15,
  },
  tagPickerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  tagScrollContent: {
    paddingRight: 10,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tagChipSelected: {
    borderColor: "#333",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  clearTagButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#e0e0e0",
    borderWidth: 2,
    borderColor: "transparent",
  },
  clearTagButtonActive: {
    borderColor: "#333",
  },
  clearTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  noTagsText: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
    marginTop: 10,
  },

  // Period Filter
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

  // Date Navigation
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

  // Summary Cards
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

  // Net Balance Card
  netBalanceCard: {
    backgroundColor: "#34495e",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  netBalanceLabel: {
    fontSize: 14,
    color: "#bdc3c7",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  netBalanceValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  // All-Time Totals
  allTimeContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  allTimeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  allTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  allTimeLabel: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  allTimeValue: {
    fontSize: 13,
    fontWeight: "bold",
  },

  // Transaction List
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
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
  tagBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  tagBadgeText: {
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
  },

  // Empty States
  emptyState: {
    alignItems: "center",
    marginTop: 30,
  },
  emptyText: {
    color: "#95a5a6",
    fontSize: 16,
    textAlign: "center",
  },
  noTagSelectedContainer: {
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 30,
  },
  noTagSelectedText: {
    fontSize: 16,
    color: "#95a5a6",
    textAlign: "center",
    marginTop: 10,
  },
});
