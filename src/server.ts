import 'temporal-polyfill/full/global';
import fastify from "fastify";
import { signUpRoute } from "./routes/sign-up-route";

const app = fastify();

app.register(signUpRoute);

app.listen({ port: 3333, host: "0.0.0.0" }, () => {
  console.log("Server is running on http://localhost:3333");
});
