import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  profileNameSchema,
  passwordSchema,
  tagSchema,
  createTransactionSchema,
} from "../validators";

describe("loginSchema", () => {
  it("aceita dados válidos", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "x" }).success,
    ).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    expect(
      loginSchema.safeParse({ email: "nao-email", password: "x" }).success,
    ).toBe(false);
  });

  it("rejeita senha vazia", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("registerSchema", () => {
  it("exige senha com pelo menos 6 caracteres", () => {
    expect(
      registerSchema.safeParse({ email: "a@b.com", password: "12345" }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ email: "a@b.com", password: "123456" })
        .success,
    ).toBe(true);
  });
});

describe("forgotPasswordSchema", () => {
  it("valida o e-mail", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(
      true,
    );
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("verifyCodeSchema", () => {
  it("aceita exatamente 6 dígitos", () => {
    expect(verifyCodeSchema.safeParse({ code: "123456" }).success).toBe(true);
  });

  it("rejeita tamanho diferente ou caracteres não numéricos", () => {
    expect(verifyCodeSchema.safeParse({ code: "12345" }).success).toBe(false);
    expect(verifyCodeSchema.safeParse({ code: "12345a" }).success).toBe(false);
  });
});

describe("profileNameSchema", () => {
  it("rejeita nome vazio", () => {
    expect(profileNameSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("remove espaços das pontas", () => {
    const result = profileNameSchema.safeParse({ name: "  João  " });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe("João");
  });
});

describe("passwordSchema", () => {
  it("exige senha com pelo menos 6 caracteres", () => {
    expect(passwordSchema.safeParse({ password: "12345" }).success).toBe(false);
    expect(passwordSchema.safeParse({ password: "123456" }).success).toBe(true);
  });
});

describe("tagSchema", () => {
  it("aceita nome e cor válidos", () => {
    expect(
      tagSchema.safeParse({ name: "Casa", color: "#2980b9" }).success,
    ).toBe(true);
  });

  it("rejeita cor inválida", () => {
    expect(tagSchema.safeParse({ name: "Casa", color: "azul" }).success).toBe(
      false,
    );
  });

  it("rejeita nome vazio", () => {
    expect(tagSchema.safeParse({ name: "   ", color: "#2980b9" }).success).toBe(
      false,
    );
  });
});

describe("createTransactionSchema", () => {
  it("modo único exige nome e valor maior que zero", () => {
    const schema = createTransactionSchema({ mode: "single" });
    expect(schema.safeParse({ name: "", singleValue: "10,00" }).success).toBe(
      false,
    );
    expect(schema.safeParse({ name: "X", singleValue: "0,00" }).success).toBe(
      false,
    );
    expect(schema.safeParse({ name: "X", singleValue: "10,00" }).success).toBe(
      true,
    );
  });

  it("recorrente exige valor base quando as parcelas são iguais", () => {
    const schema = createTransactionSchema({
      mode: "recurring",
      areValuesDifferent: false,
    });
    expect(schema.safeParse({ name: "X", baseValue: "0,00" }).success).toBe(
      false,
    );
    expect(schema.safeParse({ name: "X", baseValue: "50,00" }).success).toBe(
      true,
    );
  });

  it("recorrente dispensa valor base quando as parcelas são diferentes", () => {
    const schema = createTransactionSchema({
      mode: "recurring",
      areValuesDifferent: true,
    });
    expect(schema.safeParse({ name: "X", baseValue: "0,00" }).success).toBe(
      true,
    );
  });

  it("usa as mensagens informadas", () => {
    const schema = createTransactionSchema({
      mode: "single",
      invalidValueMessage: "Valor personalizado.",
    });
    const result = schema.safeParse({ name: "X", singleValue: "0,00" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Valor personalizado.");
  });
});
