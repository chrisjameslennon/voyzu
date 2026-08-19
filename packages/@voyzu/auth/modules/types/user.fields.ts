import Type from "typebox";

export const UserCode = Type.String({
  minLength: 1,
  maxLength: 20,
  pattern: "^[A-Z0-9_-]+$",
  description: "Capital letters, numbers, dashes, and underscores; maximum 20 characters.",
});

export const UserDisplayName = Type.String({
  maxLength: 50,
  pattern: "\\S",
  description: "Non-blank display name; maximum 50 characters.",
});

export const UserEmail = Type.Union([
  Type.String({
    pattern: "^\\S(?:.*\\S)?$",
    description: "A non-blank value without leading or trailing whitespace.",
  }),
  Type.Null(),
]);

export const UserPassword = Type.String({ minLength: 1 });
export const PositiveId = Type.Integer({ minimum: 1 });
export const NonBlankString = Type.String({ pattern: "\\S" });
