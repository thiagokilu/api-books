import { app } from "./src/server";

async function check() {
  await app.ready();

  const signUpRes = await app.inject({
    method: "POST", url: "/sign-up",
    payload: { name: "Test", email: "e2echecktest2@email.com", password: "senha123" },
  });
  console.log("sign-up:", signUpRes.statusCode, JSON.stringify(signUpRes.json()));

  const signInRes = await app.inject({
    method: "POST", url: "/sign-in",
    payload: { email: "e2echecktest2@email.com", password: "senha123" },
  });
  console.log("sign-in:", signInRes.statusCode, JSON.stringify(signInRes.json()));
  const { accessToken } = signInRes.json();

  const addWithToken = await app.inject({
    method: "POST", url: "/add-book-shelf",
    headers: { authorization: `Bearer ${accessToken}` },
    payload: { title: "Clean Code", author_name: "Robert", cover_i: 123 },
  });
  console.log("add WITH token:", addWithToken.statusCode, JSON.stringify(addWithToken.json()));

  const addNoAuth = await app.inject({
    method: "POST", url: "/add-book-shelf",
    payload: { title: "Clean Code", author_name: "Robert", cover_i: 123 },
  });
  console.log("add WITHOUT token:", addNoAuth.statusCode, JSON.stringify(addNoAuth.json()));

  await app.close();
}
check().catch(console.error);
