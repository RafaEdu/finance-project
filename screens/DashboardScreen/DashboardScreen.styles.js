import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
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
    marginBottom: 4,
  },
  profileIcon: {
    marginRight: 15,
  },
  // Filtros
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
  // Navegação de Data
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
  // Resumo (Cards Pequenos)
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
    color: colors.textSecondary,
    marginRight: 5,
  },
  // Card de Saldo Grande
  balanceCard: {
    backgroundColor: colors.darkSurface,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
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
    color: colors.textStrong,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    color: colors.textSubtle,
    fontSize: 16,
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
