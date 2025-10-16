# 🎵 MusicApp API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require authentication using JWT Bearer token in headers:

```javascript
Authorization: Bearer <access_token>
```

---

## 📋 Table of Contents

- [Authentication](#authentication-endpoints)
- [Tracks](#tracks-endpoints)
- [Playlists](#playlists-endpoints)

---

# Authentication Endpoints

## 1. POST /auth/register

**Description:**

- Register a new user account

**Request:**

- Body:

```json
{
  "email": "string (required, must be valid email)",
  "password": "string (required, min 5 characters)"
}
```

**Response (201 - Created):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Email sudah terdaftar"
}
```

OR

```json
{
  "message": "Validation error message"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
// Using fetch
const response = await fetch("http://localhost:3001/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});
const data = await response.json();
```

---

## 2. POST /auth/login

**Description:**

- Login with email and password

**Request:**

- Body:

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200 - OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Email atau password salah"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid email or password"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const response = await fetch("http://localhost:3001/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});
const data = await response.json();
localStorage.setItem("access_token", data.access_token);
```

---

## 3. POST /auth/login/google

**Description:**

- Login using Google OAuth 2.0

**Request:**

- Body:

```json
{
  "id_token": "string (required, Google credential token)"
}
```

**Response (200 - OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Invalid Google token"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
// After Google Sign-In
function handleCredentialResponse(response) {
  fetch("http://localhost:3001/api/auth/login/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: response.credential,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      localStorage.setItem("access_token", data.access_token);
    });
}
```

---

# Tracks Endpoints

## 4. GET /tracks/home

**Description:**

- Get paginated list of tracks for home page

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
```

- Query Parameters:

```javascript
?page=1&limit=20
```

| Parameter | Type   | Required | Default | Description                |
| --------- | ------ | -------- | ------- | -------------------------- |
| page      | number | No       | 1       | Page number for pagination |
| limit     | number | No       | 20      | Number of tracks per page  |

**Response (200 - OK):**

```json
{
  "tracks": [
    {
      "id": "spotify_track_id",
      "name": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "image": "https://i.scdn.co/image/...",
      "spotify_url": "https://open.spotify.com/track/..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "hasMore": true
  }
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const response = await fetch(
  "http://localhost:3001/api/tracks/home?page=1&limit=20",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const data = await response.json();
```

---

## 5. GET /tracks/detail/:id

**Description:**

- Get detailed information about a specific track

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
```

- Parameters:

```javascript
:id = spotify_track_id (required)
```

**Response (200 - OK):**

```json
{
  "id": "spotify_track_id",
  "name": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "image": "https://i.scdn.co/image/...",
  "spotify_url": "https://open.spotify.com/track/...",
  "duration_ms": 240000,
  "release_date": "2024-01-15",
  "popularity": 85,
  "preview_url": "https://p.scdn.co/mp3-preview/..."
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Track not found"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const trackId = "3n3Ppam7vgaVa1iaRUc9Lp";
const response = await fetch(
  `http://localhost:3001/api/tracks/detail/${trackId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const track = await response.json();
```

---

## 6. GET /tracks/search

**Description:**

- Search for tracks by query (live search with debouncing)

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
```

- Query Parameters:

```javascript
?q=search_query
```

| Parameter | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| q         | string | Yes      | Search query (song name, artist, etc) |

**Response (200 - OK):**

```json
{
  "results": [
    {
      "id": "spotify_track_id",
      "name": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "image": "https://i.scdn.co/image/...",
      "spotify_url": "https://open.spotify.com/track/..."
    }
  ],
  "total": 50
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Search query is required"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const query = "lose yourself";
const response = await fetch(
  `http://localhost:3001/api/tracks/search?q=${encodeURIComponent(query)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const results = await response.json();
```

---

## 7. POST /tracks/generate-ai

**Description:**

- Generate AI-powered playlist based on mood analysis

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
Content-Type: application/json
```

- Body:

```json
{
  "mood": "string (required, e.g., 'happy', 'sad', 'energetic')"
}
```

**Response (200 - OK):**

```json
{
  "playlist": [
    {
      "id": "spotify_track_id",
      "name": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "image": "https://i.scdn.co/image/...",
      "spotify_url": "https://open.spotify.com/track/...",
      "mood_score": 0.85
    }
  ],
  "mood": "happy",
  "total_tracks": 20
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Mood parameter is required"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const response = await fetch("http://localhost:3001/api/tracks/generate-ai", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mood: "energetic",
  }),
});
const aiPlaylist = await response.json();
```

---

# Playlists Endpoints

## 8. GET /playlists

**Description:**

- Get all playlists for the authenticated user

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
```

**Response (200 - OK):**

```json
[
  {
    "id": 1,
    "name": "My Favorites",
    "UserId": 1,
    "createdAt": "2024-10-15T10:30:00.000Z",
    "updatedAt": "2024-10-15T10:30:00.000Z",
    "MusicLists": [
      {
        "id": 1,
        "spotifyId": "spotify_track_id",
        "name": "Song Title",
        "artist": "Artist Name",
        "album": "Album Name",
        "image": "https://i.scdn.co/image/...",
        "spotify_url": "https://open.spotify.com/track/..."
      }
    ]
  }
]
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const response = await fetch("http://localhost:3001/api/playlists", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const playlists = await response.json();
```

---

## 9. POST /playlists

**Description:**

- Create a new playlist

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
Content-Type: application/json
```

- Body:

```json
{
  "name": "string (required, playlist name)"
}
```

**Response (201 - Created):**

```json
{
  "id": 1,
  "name": "My Favorites",
  "UserId": 1,
  "createdAt": "2024-10-15T10:30:00.000Z",
  "updatedAt": "2024-10-15T10:30:00.000Z"
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Playlist name is required"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const response = await fetch("http://localhost:3001/api/playlists", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "My Chill Vibes",
  }),
});
const newPlaylist = await response.json();
```

---

## 10. PUT /playlists/:id

**Description:**

- Update playlist name

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
Content-Type: application/json
```

- Parameters:

```javascript
:id = playlist_id (required)
```

- Body:

```json
{
  "name": "string (required, new playlist name)"
}
```

**Response (200 - OK):**

```json
{
  "message": "Playlist updated successfully",
  "playlist": {
    "id": 1,
    "name": "Updated Playlist Name",
    "UserId": 1,
    "updatedAt": "2024-10-15T11:00:00.000Z"
  }
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Playlist name is required"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (403 - Forbidden):**

```json
{
  "message": "You are not authorized to update this playlist"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Playlist not found"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const playlistId = 1;
const response = await fetch(
  `http://localhost:3001/api/playlists/${playlistId}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "My Updated Playlist",
    }),
  }
);
const result = await response.json();
```

---

## 11. DELETE /playlists/:id

**Description:**

- Delete a playlist and all its music entries

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
```

- Parameters:

```javascript
:id = playlist_id (required)
```

**Response (200 - OK):**

```json
{
  "message": "Playlist deleted successfully"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (403 - Forbidden):**

```json
{
  "message": "You are not authorized to delete this playlist"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Playlist not found"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const playlistId = 1;
const response = await fetch(
  `http://localhost:3001/api/playlists/${playlistId}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const result = await response.json();
```

---

## 12. POST /playlists/:id/music

**Description:**

- Add a song/track to a playlist

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
Content-Type: application/json
```

- Parameters:

```javascript
:id = playlist_id (required)
```

- Body:

```json
{
  "spotifyId": "string (required, Spotify track ID)",
  "name": "string (required, track name)",
  "artist": "string (required, artist name)",
  "album": "string (optional, album name)",
  "image": "string (optional, image URL)",
  "spotify_url": "string (optional, Spotify URL)"
}
```

**Response (201 - Created):**

```json
{
  "id": 5,
  "PlaylistId": 1,
  "spotifyId": "3n3Ppam7vgaVa1iaRUc9Lp",
  "name": "Lose Yourself",
  "artist": "Eminem",
  "album": "8 Mile",
  "image": "https://i.scdn.co/image/...",
  "spotify_url": "https://open.spotify.com/track/...",
  "createdAt": "2024-10-15T12:00:00.000Z",
  "updatedAt": "2024-10-15T12:00:00.000Z"
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Missing required fields: spotifyId, name, or artist"
}
```

OR

```json
{
  "message": "Lagu sudah ada di playlist ini"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (403 - Forbidden):**

```json
{
  "message": "You are not authorized to add music to this playlist"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Playlist not found"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const playlistId = 1;
const response = await fetch(
  `http://localhost:3001/api/playlists/${playlistId}/music`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      spotifyId: "3n3Ppam7vgaVa1iaRUc9Lp",
      name: "Lose Yourself",
      artist: "Eminem",
      album: "8 Mile",
      image: "https://i.scdn.co/image/ab67616d0000b2731ad77916ff7c5e87a3b8ae72",
      spotify_url: "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp",
    }),
  }
);
const musicEntry = await response.json();
```

---

## 13. DELETE /playlists/:playlistId/music/:musicId

**Description:**

- Remove a song/track from a playlist

**Authentication:** Required

**Request:**

- Headers:

```javascript
Authorization: Bearer <access_token>
```

- Parameters:

```javascript
:playlistId = playlist_id (required)
:musicId = music_entry_id (required, NOT spotifyId)
```

**Response (200 - OK):**

```json
{
  "message": "Music removed from playlist successfully"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (403 - Forbidden):**

```json
{
  "message": "You are not authorized to remove music from this playlist"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Playlist or music not found"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal Server Error"
}
```

**Example:**

```javascript
const token = localStorage.getItem("access_token");
const playlistId = 1;
const musicId = 5; // This is the MusicList.id, not spotifyId
const response = await fetch(
  `http://localhost:3001/api/playlists/${playlistId}/music/${musicId}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const result = await response.json();
```

---

## 🔒 Error Responses Summary

### Common Error Status Codes:

| Status Code | Name                  | Description                                    |
| ----------- | --------------------- | ---------------------------------------------- |
| 400         | Bad Request           | Invalid request format or validation error     |
| 401         | Unauthorized          | Missing or invalid authentication token        |
| 403         | Forbidden             | User doesn't have permission for this resource |
| 404         | Not Found             | Resource doesn't exist                         |
| 500         | Internal Server Error | Unexpected server error                        |

### Error Response Format:

```json
{
  "message": "Error description"
}
```

---

## 📊 Database Models

### User Model

```javascript
{
  id: INTEGER (PK, Auto-increment),
  email: STRING (Unique, Not Null),
  password: STRING (Not Null, Hashed),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Playlist Model

```javascript
{
  id: INTEGER (PK, Auto-increment),
  name: STRING (Not Null),
  UserId: INTEGER (FK → User.id),
  createdAt: DATE,
  updatedAt: DATE
}
```

### MusicList Model

```javascript
{
  id: INTEGER (PK, Auto-increment),
  PlaylistId: INTEGER (FK → Playlist.id),
  spotifyId: STRING (Not Null),
  name: STRING (Not Null),
  artist: STRING (Not Null),
  album: STRING,
  image: STRING,
  spotify_url: STRING,
  createdAt: DATE,
  updatedAt: DATE
}
```

---

## 🧪 Testing Guide

### Using cURL:

**Register:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Login:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Playlists:**

```bash
curl -X GET http://localhost:3001/api/playlists \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Playlist:**

```bash
curl -X POST http://localhost:3001/api/playlists \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"My New Playlist"}'
```

**Add Song to Playlist:**

```bash
curl -X POST http://localhost:3001/api/playlists/1/music \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "spotifyId":"3n3Ppam7vgaVa1iaRUc9Lp",
    "name":"Lose Yourself",
    "artist":"Eminem",
    "album":"8 Mile",
    "image":"https://i.scdn.co/image/...",
    "spotify_url":"https://open.spotify.com/track/..."
  }'
```

---

## 🔗 Postman Collection

Import this JSON to Postman for easy testing:

```json
{
  "info": {
    "name": "MusicApp API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{access_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3001/api"
    },
    {
      "key": "access_token",
      "value": ""
    }
  ]
}
```

---
