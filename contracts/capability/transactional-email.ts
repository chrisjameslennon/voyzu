// File: capabilities/transactional-email.ts

export interface TransactionalEmailCapability {
  send(input: {
    to: string[];
    subject: string;

    html?: string;
    text?: string;

    from?: string;
    replyTo?: string;
  }): Promise<{
    messageId?: string;
  }>;
}

/*
await capabilities
  .use("platform.transactional-email")
  .send({
    to: ["customer@example.com"],
    subject: "Your invoice",
    html: "<p>Thanks for your business.</p>",
  });
  */