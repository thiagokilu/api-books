import "temporal-polyfill/full/global";
import fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Swagger from "@fastify/swagger";
import SwaggerUI from "@fastify/swagger-ui";
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { signUpRoute } from "./infra/http/routes/sign-up-route";
import { signInRoute } from "./infra/http/routes/sign-in-route";
import { getUserProfileRoute } from "./infra/http/routes/get-user-profile-route";
import { refreshTokenRoute } from "./infra/http/routes/refresh-token-route";
import { forgotPasswordRoute } from "./infra/http/routes/forgot-password-route";
import { requestPasswordRoute } from "./infra/http/routes/request-password-route";
import { logoutRoute } from "./infra/http/routes/logout-route";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const typedApp = app.withTypeProvider<ZodTypeProvider>();

typedApp.register(cors, {
  origin: "*",
});

typedApp.register(cookie);

typedApp.register(Swagger, {
  openapi: {
    info: {
      title: "API Books",
      version: "1.0.0",
      description: "API de livros",
    },
    tags: [
      {
        name: "Auth",
      },
      {
        name: "Books",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  transform: jsonSchemaTransform,
});

typedApp.register(SwaggerUI, {
  routePrefix: "/docs",
});

typedApp.register(signUpRoute);
typedApp.register(signInRoute);
typedApp.register(getUserProfileRoute);
typedApp.register(refreshTokenRoute);
typedApp.register(forgotPasswordRoute);
typedApp.register(requestPasswordRoute);
typedApp.register(logoutRoute);

const start = async () => {
  try {
    await app.listen({
      port: 3333,
      host: "0.0.0.0",
    });
    console.log("Server is running on http://localhost:3333");
  } catch (err) {
    app.log.error(err);
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
