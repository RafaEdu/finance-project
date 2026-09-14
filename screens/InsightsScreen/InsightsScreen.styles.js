import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textStrong,
    marginBottom: 16,
  },

  // Tag Picker
  tagPickerContainer: {
    marginBottom: 15,
  },
  tagPickerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
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
    borderColor: colors.text,
    elevation: 3,
    shadowColor: colors.black,
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
    backgroundColor: colors.segmentBackground,
    borderWidth: 2,
    borderColor: "transparent",
  },
  clearTagButtonActive: {
    borderColor: colors.text,
  },
  clearTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMedium,
  },
  noTagsText: {
    fontSize: 14,
    color: colors.textSubtle,
    textAlign: "center",
    marginTop: 10,
  },

  // Period Filter
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: colors.segmentBackground,
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
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  filterText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  activeFilterText: {
    color: colors.primary,
    fontWeight: "bold",
  },

  // Date Navigation
  dateNavContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dateNavButton: {
    padding: 5,
  },
  dateNavText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },

  // Summary Cards
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.income,
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.expense,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },

  // Net Balance Card
  netBalanceCard: {
    backgroundColor: colors.darkSurface,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  netBalanceLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  netBalanceValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
  },

  // All-Time Totals
  allTimeContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  allTimeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textStrong,
    marginBottom: 10,
  },
  allTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  allTimeLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  allTimeValue: {
    fontSize: 13,
    fontWeight: "bold",
  },

  // Transaction List
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textStrong,
    marginBottom: 10,
  },
  transactionCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    elevation: 1,
    shadowColor: colors.black,
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
    color: colors.textStrong,
    marginRight: 8,
  },
  installmentBadge: {
    backgroundColor: colors.expense,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  installmentText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  recurrenceBadge: {
    backgroundColor: colors.income,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  recurrenceText: {
    color: colors.white,
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
    color: colors.textSubtle,
  },
  transactionDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
    color: colors.textSubtle,
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
    color: colors.textSubtle,
    textAlign: "center",
    marginTop: 10,
  },
});
