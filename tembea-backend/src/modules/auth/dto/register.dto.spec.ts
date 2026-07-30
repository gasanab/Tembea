/// <reference types="jest" />

import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterDto, RegistrationRole } from "./register.dto";

const validRegistration = {
  name: "Test User",
  email: "test@example.com",
  password: "TestPass123",
};

describe("RegisterDto", () => {
  it.each([RegistrationRole.CLIENT, RegistrationRole.PARTNER])(
    "allows the public %s role",
    async (role) => {
      const errors = await validate(
        plainToInstance(RegisterDto, { ...validRegistration, role }),
      );

      expect(errors).toHaveLength(0);
    },
  );

  it("rejects the ADMIN role", async () => {
    const errors = await validate(
      plainToInstance(RegisterDto, { ...validRegistration, role: "ADMIN" }),
    );

    expect(errors.some((error) => error.property === "role")).toBe(true);
  });
});
