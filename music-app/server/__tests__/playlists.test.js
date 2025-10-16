const request = require("supertest");
const app = require("../server");
const { sequelize, User, Playlist, MusicList } = require("../models");
const { signToken } = require("../helpers/jwt");

let validToken;
let invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid";
let validToken2;
let playlistId1;
let playlistId2;
let musicId1;

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

  // Create test users
  const user1 = await User.create({
    email: "playlist.test1@mail.com",
    password: "password123",
  });

  const user2 = await User.create({
    email: "playlist.test2@mail.com",
    password: "password123",
  });

  // Generate tokens
  validToken = signToken({ id: user1.id, email: user1.email });
  validToken2 = signToken({ id: user2.id, email: user2.email });

  // Create initial playlists for testing
  const playlist1 = await Playlist.create({
    name: "User 1 Playlist",
    UserId: user1.id,
  });
  playlistId1 = playlist1.id;

  const playlist2 = await Playlist.create({
    name: "User 2 Playlist",
    UserId: user2.id,
  });
  playlistId2 = playlist2.id;
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

describe("GET /api/playlists", () => {
  test("200 success get playlists", (done) => {
    request(app)
      .get("/api/playlists")
      .set("authorization", "Bearer " + validToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(200);
        expect(Array.isArray(body)).toBeTruthy();
        expect(body.length).toBeGreaterThan(0);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 get playlists with invalid token", (done) => {
    request(app)
      .get("/api/playlists")
      .set("authorization", "Bearer " + invalidToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 get playlists without token", (done) => {
    request(app)
      .get("/api/playlists")
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

describe("POST /api/playlists", () => {
  test("201 success POST playlist", (done) => {
    request(app)
      .post("/api/playlists")
      .set("authorization", "Bearer " + validToken)
      .send({ name: "My Awesome Playlist" })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(201);
        expect(body).toHaveProperty("id", expect.any(Number));
        expect(body).toHaveProperty("name", "My Awesome Playlist");
        expect(body).toHaveProperty("UserId", expect.any(Number));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 POST playlist without name", (done) => {
    request(app)
      .post("/api/playlists")
      .set("authorization", "Bearer " + validToken)
      .send({})
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
        expect(body.message).toContain("kosong");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 POST playlist with empty name", (done) => {
    request(app)
      .post("/api/playlists")
      .set("authorization", "Bearer " + validToken)
      .send({ name: "   " })
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

  test("401 POST playlist with invalid token", (done) => {
    request(app)
      .post("/api/playlists")
      .set("authorization", "Bearer " + invalidToken)
      .send({ name: "Test Playlist" })
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

  test("401 POST playlist without token", (done) => {
    request(app)
      .post("/api/playlists")
      .send({ name: "Test Playlist" })
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

describe("POST /api/playlists/:id/music", () => {
  test("201 success POST music to playlist", (done) => {
    request(app)
      .post(`/api/playlists/${playlistId1}/music`)
      .set("authorization", "Bearer " + validToken)
      .send({
        spotifyId: "test_spotify_123",
        name: "Test Song",
        artist: "Test Artist",
        album: "Test Album",
        image: "http://test.com/image.jpg",
        spotify_url: "http://spotify.com/track/123",
      })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(201);
        expect(body).toHaveProperty("id", expect.any(Number));
        expect(body).toHaveProperty("spotifyId", "test_spotify_123");
        musicId1 = body.id;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 POST music without required fields", (done) => {
    request(app)
      .post(`/api/playlists/${playlistId1}/music`)
      .set("authorization", "Bearer " + validToken)
      .send({ spotifyId: "test_incomplete" })
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

  test("404 POST music to non-existent playlist", (done) => {
    request(app)
      .post(`/api/playlists/99999/music`)
      .set("authorization", "Bearer " + validToken)
      .send({
        spotifyId: "test_spotify_456",
        name: "Test Song",
        artist: "Test Artist",
        album: "Test Album",
      })
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

  test("401 POST music with invalid token", (done) => {
    request(app)
      .post(`/api/playlists/${playlistId1}/music`)
      .set("authorization", "Bearer " + invalidToken)
      .send({
        spotifyId: "test_spotify_789",
        name: "Test Song",
        artist: "Test Artist",
        album: "Test Album",
      })
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

  test("401 POST music without token", (done) => {
    request(app)
      .post(`/api/playlists/${playlistId1}/music`)
      .send({
        spotifyId: "test_spotify_abc",
        name: "Test Song",
        artist: "Test Artist",
        album: "Test Album",
      })
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

describe("PUT /api/playlists/:id", () => {
  test("200 success update playlist", (done) => {
    request(app)
      .put(`/api/playlists/${playlistId1}`)
      .set("authorization", "Bearer " + validToken)
      .send({ name: "Updated Playlist Name" })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(200);
        expect(body).toHaveProperty("message");
        expect(body.message).toContain("success");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("400 failed update playlist - name not provided", (done) => {
    request(app)
      .put(`/api/playlists/${playlistId1}`)
      .set("authorization", "Bearer " + validToken)
      .send({})
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

  test("404 update playlist not found", (done) => {
    request(app)
      .put(`/api/playlists/99999`)
      .set("authorization", "Bearer " + validToken)
      .send({ name: "Non-existent Playlist" })
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

  test("403 update playlist with unauthorized user", (done) => {
    request(app)
      .put(`/api/playlists/${playlistId1}`)
      .set("authorization", "Bearer " + validToken2)
      .send({ name: "Try to hack" })
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(403);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 update playlist with invalid token", (done) => {
    request(app)
      .put(`/api/playlists/${playlistId1}`)
      .set("authorization", "Bearer " + invalidToken)
      .send({ name: "Test Update" })
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

  test("401 update playlist without token", (done) => {
    request(app)
      .put(`/api/playlists/${playlistId1}`)
      .send({ name: "Test Update" })
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

describe("DELETE /api/playlists/:id/music/:musicId", () => {
  test("200 delete music from playlist success", (done) => {
    request(app)
      .delete(`/api/playlists/${playlistId1}/music/${musicId1}`)
      .set("authorization", "Bearer " + validToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(200);
        expect(body).toHaveProperty("message");
        expect(body.message).toContain("deleted");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("404 delete music not found", (done) => {
    request(app)
      .delete(`/api/playlists/${playlistId1}/music/99999`)
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

  test("403 delete music with unauthorized user", (done) => {
    // First add music to playlist1
    request(app)
      .post(`/api/playlists/${playlistId1}/music`)
      .set("authorization", "Bearer " + validToken)
      .send({
        spotifyId: "music_for_unauth_test",
        name: "UnAuth Song",
        artist: "UnAuth Artist",
        album: "UnAuth Album",
      })
      .then((res) => {
        const newMusicId = res.body.id;
        // Try to delete with different user
        request(app)
          .delete(`/api/playlists/${playlistId1}/music/${newMusicId}`)
          .set("authorization", "Bearer " + validToken2)
          .then((response) => {
            const { body, status } = response;

            expect(status).toBe(403);
            expect(body).toHaveProperty("message");
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

  test("401 delete music with invalid token", (done) => {
    request(app)
      .delete(`/api/playlists/${playlistId1}/music/1`)
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

  test("401 delete music without token", (done) => {
    request(app)
      .delete(`/api/playlists/${playlistId1}/music/1`)
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

describe("DELETE /api/playlists/:id", () => {
  test("200 delete playlist success", (done) => {
    // Create a new playlist first for deletion
    request(app)
      .post("/api/playlists")
      .set("authorization", "Bearer " + validToken)
      .send({ name: "Playlist to Delete" })
      .then((res) => {
        const playlistToDelete = res.body.id;
        // Now delete it
        request(app)
          .delete(`/api/playlists/${playlistToDelete}`)
          .set("authorization", "Bearer " + validToken)
          .then((response) => {
            const { body, status } = response;

            expect(status).toBe(200);
            expect(body).toHaveProperty("message");
            expect(body.message).toContain("deleted");
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

  test("404 delete playlist not found", (done) => {
    request(app)
      .delete(`/api/playlists/99999`)
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

  test("403 delete playlist with unauthorized user", (done) => {
    request(app)
      .delete(`/api/playlists/${playlistId2}`)
      .set("authorization", "Bearer " + validToken)
      .then((response) => {
        const { body, status } = response;

        expect(status).toBe(403);
        expect(body).toHaveProperty("message");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test("401 delete playlist with invalid token", (done) => {
    request(app)
      .delete(`/api/playlists/${playlistId2}`)
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

  test("401 delete playlist without token", (done) => {
    request(app)
      .delete(`/api/playlists/${playlistId2}`)
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
