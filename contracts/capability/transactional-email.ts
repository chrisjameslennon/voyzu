import Type from "typebox";
export const transactionalEmailCapability = {
  send: {
    input: Type.Object({
      to: Type.Array(Type.String()), subject: Type.String(),
      html: Type.Optional(Type.String()), text: Type.Optional(Type.String()),
      from: Type.Optional(Type.String()), replyTo: Type.Optional(Type.String()),
    }, { additionalProperties: false }),
    output: Type.Object({ messageId: Type.Optional(Type.String()) }, { additionalProperties: false }),
  },
} as const;
