const request = require("supertest");
const app = require("../server");
const { sequelize, User } = require("../models");
const { signToken } = require("../helpers/jwt");

let validToken;
let validUserId;

beforeAll(async () => {
  // Clean database
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

  // Create test user for authentication tests
  const user = await User.create({
    email: "middleware.test@mail.com",
    password: "password123",
  });

  validUserId = user.id;
  validToken = signToken({ id: user.id });
});

afterAll(async () => {
  // Clean database
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

describe("Authentication Middleware Tests", () => {
  describe("Valid authentication scenarios", () => {
    test("200 - should allow access with valid Bearer token", (done) => {
      request(app)
        .get("/api/playlists")
        .set("Authorization", `Bearer ${validToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("200 - should work with lowercase 'authorization' header", (done) => {
      request(app)
        .get("/api/playlists")
        .set("authorization", `Bearer ${validToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Invalid authentication scenarios", () => {
    test("401 - should reject request without Authorization header", (done) => {
      request(app)
        .get("/api/playlists")
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty("message", "Invalid token");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("401 - should reject request with invalid token format (no Bearer)", (done) => {
      request(app)
        .get("/api/playlists")
        .set("Authorization", validToken) // Missing "Bearer " prefix
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty("message", "Invalid token");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("401 - should reject request with malformed token", (done) => {
      request(app)
        .get("/api/playlists")
        .set("Authorization", "Bearer invalid.token.here")
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty("message", "Invalid token");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("401 - should reject request with expired/invalid JWT", (done) => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OTksImlhdCI6MTYwMDAwMDAwMH0.invalid";
      request(app)
        .get("/api/playlists")
        .set("Authorization", `Bearer ${invalidToken}`)
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty("message", "Invalid token");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("401 - should reject request with token for non-existent user", (done) => {
      const nonExistentUserToken = signToken({ id: 99999 });
      request(app)
        .get("/api/playlists")
        .set("Authorization", `Bearer ${nonExistentUserToken}`)
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty("message", "Invalid token");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("401 - should reject empty Bearer token", (done) => {
      request(app)
        .get("/api/playlists")
        .set("Authorization", "Bearer ")
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty("message", "Invalid token");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("401 - should reject Bearer with only spaces", (done) => {
      request(app)
        .get("/api/playlists")
        .set("Authorization", "Bearer    ")
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty("message", "Invalid token");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Different endpoints with authentication", () => {
    test("200 - should authenticate for POST /api/playlists", (done) => {
      request(app)
        .post("/api/playlists")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "Test Playlist" })
        .then((response) => {
          expect(response.status).toBe(201);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("401 - should reject POST /api/playlists without auth", (done) => {
      request(app)
        .post("/api/playlists")
        .send({ name: "Test Playlist" })
        .then((response) => {
          expect(response.status).toBe(401);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("200 - should authenticate for GET /api/home", (done) => {
      request(app)
        .get("/api/home")
        .set("Authorization", `Bearer ${validToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("401 - should reject GET /api/home without auth", (done) => {
      request(app)
        .get("/api/home")
        .then((response) => {
          expect(response.status).toBe(401);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
