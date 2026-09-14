import { z } from "zod";
import { parseCurrency } from "./currency";

const emailField = z
  .string()
  .min(1, "Informe seu e-mail.")
  .email("E-mail inválido.");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z.object({
  email: emailField,
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const verifyCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "O código deve ter 6 dígitos."),
});

export const profileNameSchema = z.object({
  name: z.string().trim().min(1, "O nome não pode estar vazio."),
});

export const passwordSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export const tagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome da tag não pode estar vazio.")
    .max(30, "O nome deve ter no máximo 30 caracteres."),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida. Use #RRGGBB."),
});

// Schema do formulário de transação. `mode` e `areValuesDifferent` alteram a
// regra de valor; as mensagens vêm da configuração de receita/despesa.
export function createTransactionSchema({
  mode,
  areValuesDifferent = false,
  invalidValueMessage = "Insira um valor válido.",
  invalidRecurringValueMessage = "Insira um valor válido.",
} = {}) {
  return z
    .object({
      name: z.string().trim().min(1, "Preencha o nome."),
      description: z.string().optional(),
      singleValue: z.string().optional(),
      baseValue: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (mode === "single" && parseCurrency(data.singleValue) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["singleValue"],
          message: invalidValueMessage,
        });
      }

      if (
        mode === "recurring" &&
        parseCurrency(data.baseValue) <= 0 &&
        !areValuesDifferent
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["baseValue"],
          message: invalidRecurringValueMessage,
        });
      }
    });
}
