import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.borderStrong,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.white,
  },
  emailText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 15,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  section: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    // Sombra leve para destacar o cartão
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.textMedium,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 5,
  },
  label: {
    marginBottom: 5,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: colors.surfaceMuted,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  logoutContainer: {
    marginTop: "auto", // Empurra para o final se houver espaço
  },
  tagsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  tagsButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent,
    marginLeft: 10,
  },
});
