const request = require("supertest");
const app = require("../server");
const { sequelize, User, Playlist, MusicList } = require("../models");
const { OAuth2Client } = require("google-auth-library");

jest.mock("google-auth-library");

let user1Id, user2Id;

beforeAll(async () => {
  await sequelize.queryInterface.bulkDelete("MusicLists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("Playlists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

afterAll(async () => {
  await sequelize.queryInterface.bulkDelete("MusicLists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("Playlists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

describe("POST /register - create new user", () => {
  test("201 Success register - should register user with valid email and password", (done) => {
    request(app)
      .post("/register")
      .send({
        email: "user1@mail.com",
        password: "user1",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(201);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("user");
        expect(body.user).toHaveProperty("id", expect.any(Number));
        expect(body.user).toHaveProperty("email", "user1@mail.com");
        expect(body).toHaveProperty("message", "Registration successful");
        user1Id = body.user.id;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed register - email is null", (done) => {
    request(app)
      .post("/register")
      .send({
        email: "",
        password: "user1",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        expect(body.message).toContain("wajib");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed register - password is null", (done) => {
    request(app)
      .post("/register")
      .send({
        email: "user2@mail.com",
        password: "",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        expect(body.message).toContain("wajib");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed register - both email and password are null", (done) => {
    request(app)
      .post("/register")
      .send({
        email: "",
        password: "",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed register - email already registered", (done) => {
    request(app)
      .post("/register")
      .send({
        email: "user1@mail.com",
        password: "user1",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        expect(body.message).toContain("digunakan");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed register - invalid email format", (done) => {
    request(app)
      .post("/register")
      .send({
        email: "invalidemailformat",
        password: "password123",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("201 Success register - second user should register successfully", (done) => {
    request(app)
      .post("/register")
      .send({
        email: "user2@mail.com",
        password: "user2",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(201);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("user");
        expect(body.user).toHaveProperty("id", expect.any(Number));
        expect(body.user).toHaveProperty("email", "user2@mail.com");
        user2Id = body.user.id;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe("POST /login - user login", () => {
  test("200 Success login", (done) => {
    request(app)
      .post("/login")
      .send({
        email: "user1@mail.com",
        password: "user1",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(200);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("access_token", expect.any(String));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed login - wrong email", (done) => {
    request(app)
      .post("/login")
      .send({
        email: "wrong@mail.com",
        password: "user1",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message");
        expect(body.message).toContain("salah");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed login - wrong password", (done) => {
    request(app)
      .post("/login")
      .send({
        email: "user1@mail.com",
        password: "wrongpassword",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message");
        expect(body.message).toContain("salah");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed login - email is null", (done) => {
    request(app)
      .post("/login")
      .send({
        email: "",
        password: "user1",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        expect(body.message).toContain("wajib");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed login - password is null", (done) => {
    request(app)
      .post("/login")
      .send({
        email: "user1@mail.com",
        password: "",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        expect(body.message).toContain("wajib");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed login - both email and password are null", (done) => {
    request(app)
      .post("/login")
      .send({
        email: "",
        password: "",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe("POST /login/google", () => {
  test("201 Success Google login - new user", (done) => {
    const mockVerifyIdToken = jest.fn().mockResolvedValue({
      getPayload: () => ({
        email: "newgoogleuser@gmail.com",
        email_verified: true,
      }),
    });

    OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

    request(app)
      .post("/login/google")
      .send({
        id_token: "mock_valid_google_token_new_user",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(201);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("access_token", expect.any(String));
        expect(body).toHaveProperty("message");
        expect(mockVerifyIdToken).toHaveBeenCalled();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("200 Success Google login - existing user", (done) => {
    const mockVerifyIdToken = jest.fn().mockResolvedValue({
      getPayload: () => ({
        email: "newgoogleuser@gmail.com",
      }),
    });

    OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

    request(app)
      .post("/login/google")
      .send({
        id_token: "mock_valid_google_token_existing_user",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(200);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("access_token", expect.any(String));
        expect(body).toHaveProperty("message");
        expect(mockVerifyIdToken).toHaveBeenCalled();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 Failed Google login - missing id_token", (done) => {
    request(app)
      .post("/login/google")
      .send({})
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        expect(body.message).toContain("required");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 Failed Google login - invalid token", (done) => {
    const mockVerifyIdToken = jest
      .fn()
      .mockRejectedValue(new Error("Invalid token"));

    OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

    request(app)
      .post("/login/google")
      .send({
        id_token: "invalid_google_token_here",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message", expect.any(String));
        expect(body.message).toContain("tidak valid");
        expect(mockVerifyIdToken).toHaveBeenCalled();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 Failed Google login - token verification fails", (done) => {
    const mockVerifyIdToken = jest
      .fn()
      .mockRejectedValue(new Error("Token verification failed"));

    OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

    request(app)
      .post("/login/google")
      .send({
        id_token: "another_invalid_token",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toBeInstanceOf(Object);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
