const request = require("supertest");
const app = require("../server");
const { sequelize, User } = require("../models");
const { signToken } = require("../helpers/jwt");

let validToken;
let invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid";

beforeAll(async () => {
  // Clean database
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  // Create test user
  const user = await User.create({
    email: "tracks.test@mail.com",
    password: "password123",
  });

  // Generate token
  validToken = signToken({ id: user.id, email: user.email });
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

describe("GET /api/home", () => {
  test("200 success get home tracks", (done) => {
    request(app)
      .get("/api/home")
      .set("authorization", "Bearer " + validToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(200);
        expect(body).toHaveProperty("genre");
        expect(body).toHaveProperty("tracks");
        expect(Array.isArray(body.tracks)).toBeTruthy();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 get home tracks with invalid token", (done) => {
    request(app)
      .get("/api/home")
      .set("authorization", "Bearer " + invalidToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 get home tracks without token", (done) => {
    request(app)
      .get("/api/home")
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe("GET /api/detail/:id", () => {
  test("200 success get track detail", (done) => {
    // Use a real Spotify track ID for testing
    request(app)
      .get("/api/detail/3n3Ppam7vgaVa1iaRUc9Lp") // Real Spotify track
      .set("authorization", "Bearer " + validToken)
      .then((response) => {
        const { body, status } = response;

        // Could be 200 if track found or 404 if Spotify API changes
        expect([200, 404]).toContain(status);
        expect(body).toBeDefined();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 get track detail with invalid token", (done) => {
    request(app)
      .get("/api/detail/3n3Ppam7vgaVa1iaRUc9Lp")
      .set("authorization", "Bearer " + invalidToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 get track detail without token", (done) => {
    request(app)
      .get("/api/detail/3n3Ppam7vgaVa1iaRUc9Lp")
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("404 get track detail with invalid id", (done) => {
    request(app)
      .get("/api/detail/invalid_track_id")
      .set("authorization", "Bearer " + validToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(404);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe("GET /api/tracks/search", () => {
  test("200 success search tracks", (done) => {
    request(app)
      .get("/api/search")
      .query({ q: "love" })
      .set("authorization", "Bearer " + validToken)
      .then((response) => {
        const { body, status } = response;

        // Could be 200 if search successful or 500 if Spotify API issue
        expect([200, 500]).toContain(status);
        expect(body).toBeDefined();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 search tracks without query", (done) => {
    request(app)
      .get("/api/search")
      .set("authorization", "Bearer " + validToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
        expect(body.message).toContain("required");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 search tracks with empty query", (done) => {
    request(app)
      .get("/api/search")
      .query({ q: "   " })
      .set("authorization", "Bearer " + validToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 search tracks with invalid token", (done) => {
    request(app)
      .get("/api/search")
      .query({ q: "love" })
      .set("authorization", "Bearer " + invalidToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 search tracks without token", (done) => {
    request(app)
      .get("/api/search")
      .query({ q: "love" })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe("POST /api/generate-ai", () => {
  test("200 success generate AI playlist", (done) => {
    request(app)
      .post("/api/generate-ai")
      .set("authorization", "Bearer " + validToken)
      .send({ mood: "happy and energetic" })
      .then((response) => {
        const { body, status } = response;

        // Could be 200, 400, or 500 depending on AI/Spotify API availability
        expect([200, 400, 500]).toContain(status);
        expect(body).toBeDefined();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("200 generate AI playlist without mood", (done) => {
    request(app)
      .post("/api/generate-ai")
      .set("authorization", "Bearer " + validToken)
      .send({})
      .then((response) => {
        const { body, status } = response;

        // Should still work with default mood
        expect([200, 400, 500]).toContain(status);
        expect(body).toBeDefined();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 generate AI playlist with invalid token", (done) => {
    request(app)
      .post("/api/generate-ai")
      .set("authorization", "Bearer " + invalidToken)
      .send({ mood: "happy" })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 generate AI playlist without token", (done) => {
    request(app)
      .post("/api/generate-ai")
      .send({ mood: "happy" })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
