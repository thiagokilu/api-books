import 'temporal-polyfill/full/global';
import fastify from "fastify";
import { signUpRoute } from "./infra/http/routes/sign-up-route";
import { signInRoute } from "./infra/http/routes/sign-in-route";
import { getUserProfileRoute } from "./infra/http/routes/get-user-profile-route";


const app = fastify();

app.register(signUpRoute);
app.register(signInRoute);
app.register(getUserProfileRoute);

app.listen({ port: 3333, host: "0.0.0.0" }, () => {
  console.log("Server is running on http://localhost:3333");
});
