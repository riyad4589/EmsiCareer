import { MailtrapClient } from "mailtrap";
import { createPendingValidationEmailTemplate } from "../emails/emailTemplates.js";


const TOKEN = "3eeccd5a19961b71a0b4b51dea28effe";

const client = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};
const recipients = [
  {
    email: "riyadmaj100@gmail.com",
  }
];

client
  .send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    html: createPendingValidationEmailTemplate("Riyad","riyadmaj100@gmail.com"),
    category: "Integration Test",
  })
  .then(console.log, console.error);