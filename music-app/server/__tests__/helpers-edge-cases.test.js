const request = require("supertest");
const app = require("../server");
const { sequelize, User, Playlist, MusicList } = require("../models");
const { signToken } = require("../helpers/jwt");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");

describe("Helper Functions Tests", () => {
  describe("bcrypt helper", () => {
    test("should hash password successfully", async () => {
      const password = "testpassword123";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(typeof hashedPassword).toBe("string");
    });

    test("should compare password successfully - matching passwords", async () => {
      const password = "testpassword123";
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePassword(password, hashedPassword);

      expect(isMatch).toBe(true);
    });

    test("should compare password successfully - non-matching passwords", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword456";
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hashedPassword);

      expect(isMatch).toBe(false);
    });

    test("should hash different passwords to different hashes", async () => {
      const password1 = "password1";
      const password2 = "password2";
      const hash1 = await hashPassword(password1);
      const hash2 = await hashPassword(password2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("JWT helper", () => {
    test("should sign token with payload", () => {
      const payload = { id: 1, email: "test@mail.com" };
      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    test("should create different tokens for different payloads", () => {
      const payload1 = { id: 1 };
      const payload2 = { id: 2 };
      const token1 = signToken(payload1);
      const token2 = signToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });
});

describe("Additional Playlist Edge Cases", () => {
  let validToken;
  let playlistId;
  let userId;

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

    // Create test user
    const user = await User.create({
      email: "edgecase.test@mail.com",
      password: "password123",
    });

    userId = user.id;
    validToken = signToken({ id: user.id });

    // Create test playlist
    const playlist = await Playlist.create({
      name: "Test Playlist",
      UserId: userId,
    });

    playlistId = playlist.id;
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

  describe("POST /api/playlists/:id/music - edge cases", () => {
    test("400 - should reject duplicate music in same playlist", (done) => {
      const musicData = {
        spotifyId: "duplicate_test_123",
        name: "Duplicate Song",
        artist: "Test Artist",
        album: "Test Album",
      };

      // Add music first time
      request(app)
        .post(`/api/playlists/${playlistId}/music`)
        .set("Authorization", `Bearer ${validToken}`)
        .send(musicData)
        .then(() => {
          // Try to add same music again
          request(app)
            .post(`/api/playlists/${playlistId}/music`)
            .set("Authorization", `Bearer ${validToken}`)
            .send(musicData)
            .then((response) => {
              expect(response.status).toBe(400);
              expect(response.body).toHaveProperty("message");
              expect(response.body.message).toContain("already");
              done();
            })
            .catch((err) => {
              done(err);
            });
        })
        .catch((err) => {
          done(err);
        });
    });

    test("400 - should reject music without spotifyId", (done) => {
      request(app)
        .post(`/api/playlists/${playlistId}/music`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "Song Without Spotify ID",
          artist: "Test Artist",
          album: "Test Album",
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("message");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("400 - should reject music without name", (done) => {
      request(app)
        .post(`/api/playlists/${playlistId}/music`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          spotifyId: "test_no_name",
          artist: "Test Artist",
          album: "Test Album",
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("message");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("400 - should reject music without artist", (done) => {
      request(app)
        .post(`/api/playlists/${playlistId}/music`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          spotifyId: "test_no_artist",
          name: "Song Without Artist",
          album: "Test Album",
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("message");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("400 - should reject music without album", (done) => {
      request(app)
        .post(`/api/playlists/${playlistId}/music`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          spotifyId: "test_no_album",
          name: "Song Without Album",
          artist: "Test Artist",
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("message");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /api/playlists - with MusicLists included", () => {
    test("200 - should return playlists with their music", (done) => {
      request(app)
        .get("/api/playlists")
        .set("Authorization", `Bearer ${validToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
          if (response.body.length > 0) {
            expect(response.body[0]).toHaveProperty("MusicLists");
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("PUT /api/playlists/:id - update with whitespace", () => {
    test("200 - should update playlist with name containing spaces", (done) => {
      request(app)
        .put(`/api/playlists/${playlistId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "  Playlist With Spaces  " })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty("message");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
