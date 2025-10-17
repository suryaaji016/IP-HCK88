# Music App API Documentation

## Endpoints

List of Available Endpoints:

- `POST /register`
- `POST /login`
- `POST /login/google`
- `GET /api/home`
- `GET /api/detail/:id`
- `GET /api/search`
- `POST /api/generate-ai`
- `GET /api/playlists`
- `POST /api/playlists`
- `PUT /api/playlists/:id`
- `DELETE /api/playlists/:id`
- `POST /api/playlists/:id/music`
- `DELETE /api/playlists/:id/music/:musicId`

## 1. POST /register

### Description

- Create a new user account

### Request

- Headers

  ```json
  {
    "Content-Type": "application/json"
  }
  ```

- Body

  ```json
  {
    "email": "string (required)",
    "password": "string (required, min 5 characters)"
  }
  ```

### Response

#### _201 - Created_

```json
{
  "message": "Registration successful",
  "user": {
    "id": "integer",
    "email": "string"
  }
}
```

#### _400 - Bad Request_

```json
{
  "message": "Email & password wajib diisi"
}
OR
{
  "message": "Email sudah digunakan"
}
OR
{
  "message": "Validation error message"
}
```

#### _500 - Internal Server Error_

```json
{
  "message": "Internal Server Error"
}
```

---

## 2. POST /login

### Description

- Authenticate user and get access token

### Request

- Headers

  ```json
  {
    "Content-Type": "application/json"
  }
  ```

- Body

  ```json
  {
    "email": "string (required)",
    "password": "string (required)"
  }
  ```

### Response

#### _200 - OK_

```json
{
  "access_token": "string (JWT token)"
}
```

#### _400 - Bad Request_

```json
{
  "message": "Email & password wajib diisi"
}
OR
{
  "message": "Email atau password salah"
}
```

#### _500 - Internal Server Error_

```json
{
  "message": "Internal Server Error"
}
```

---

## 3. POST /login/google

### Description

- Authenticate user with Google OAuth and get access token

### Request

- Headers

  ```json
  {
    "Content-Type": "application/json"
  }
  ```

- Body

  ```json
  {
    "id_token": "string (required, Google OAuth token)"
  }
  ```

### Response

#### _200 - OK_ (existing user)

```json
{
  "message": "Login Google sukses",
  "access_token": "string (JWT token)"
}
```

#### _201 - Created_ (new user)

```json
{
  "message": "Login Google sukses",
  "access_token": "string (JWT token)"
}
```

#### _400 - Bad Request_

```json
{
  "message": "ID token required"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Token Google tidak valid"
}
```

---

## 4. GET /api/home

### Description

- Get random tracks for home page based on random genre

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>"
  }
  ```

- Query Parameters
  ```
  offset (optional): integer - pagination offset (default: random)
  ```

### Response

#### _200 - OK_

```json
{
  "genre": "string (random genre)",
  "tracks": [
    {
      "id": "string (Spotify track ID)",
      "name": "string",
      "artist": "string (comma-separated if multiple)",
      "album": "string",
      "image": "string (URL)",
      "spotify_url": "string (URL)"
    }
  ],
  "nextOffset": "integer",
  "hasMore": "boolean"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

#### _500 - Internal Server Error_

```json
{
  "message": "Failed to fetch home data"
}
```

---

## 5. GET /api/detail/:id

### Description

- Get detailed information about a specific track

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>"
  }
  ```

- Parameters
  ```
  id (required): string - Spotify track ID
  ```

### Response

#### _200 - OK_

```json
{
  "id": "string",
  "name": "string",
  "artist": "string",
  "album": "string",
  "image": "string (URL)",
  "spotify_url": "string (URL)"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

#### _404 - Not Found_

```json
{
  "message": "Track not found"
}
```

---

## 6. GET /api/search

### Description

- Search for tracks on Spotify

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>"
  }
  ```

- Query Parameters
  ```
  q (required): string - search query
  ```

### Response

#### _200 - OK_

```json
{
  "query": "string",
  "tracks": [
    {
      "id": "string",
      "name": "string",
      "artist": "string",
      "album": "string",
      "image": "string (URL)",
      "spotify_url": "string (URL)"
    }
  ],
  "total": "integer"
}
```

#### _400 - Bad Request_

```json
{
  "message": "Search query is required"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

#### _500 - Internal Server Error_

```json
{
  "message": "Search failed"
}
```

---

## 7. POST /api/generate-ai

### Description

- Generate AI-powered playlist based on mood/emotion analysis using Google Gemini AI

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>",
    "Content-Type": "application/json"
  }
  ```

- Body

  ```json
  {
    "prompt": "string (required, describe your mood or situation)"
  }
  ```

### Response

#### _200 - OK_

```json
{
  "analysis": {
    "mood": "string (detected mood in Indonesian)",
    "genre": "string (primary genre)",
    "genres": ["string"],
    "searchQuery": "string",
    "audioFeatures": {
      "energy": "number (0.0-1.0)",
      "valence": "number (0.0-1.0)",
      "tempo": "string (slow/medium/fast)"
    }
  },
  "tracks": [
    {
      "id": "string",
      "name": "string",
      "artist": "string",
      "album": "string",
      "image": "string (URL)",
      "spotify_url": "string (URL)"
    }
  ],
  "message": "string (description in Indonesian)"
}
```

#### _400 - Bad Request_

```json
{
  "message": "Prompt is required"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

#### _500 - Internal Server Error_

```json
{
  "message": "Failed to generate AI playlist"
}
```

---

## 8. GET /api/playlists

### Description

- Get all playlists for authenticated user

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>"
  }
  ```

### Response

#### _200 - OK_

```json
[
  {
    "id": "integer",
    "name": "string",
    "UserId": "integer",
    "createdAt": "string (datetime)",
    "updatedAt": "string (datetime)",
    "MusicLists": [
      {
        "id": "integer",
        "spotifyId": "string",
        "name": "string",
        "artist": "string",
        "album": "string",
        "image": "string (URL)",
        "spotify_url": "string (URL)",
        "PlaylistId": "integer",
        "createdAt": "string (datetime)",
        "updatedAt": "string (datetime)"
      }
    ]
  }
]
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

#### _500 - Internal Server Error_

```json
{
  "message": "Error message"
}
```

---

## 9. POST /api/playlists

### Description

- Create a new playlist

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>",
    "Content-Type": "application/json"
  }
  ```

- Body

  ```json
  {
    "name": "string (required, cannot be empty)"
  }
  ```

### Response

#### _201 - Created_

```json
{
  "id": "integer",
  "name": "string",
  "UserId": "integer",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)"
}
```

#### _400 - Bad Request_

```json
{
  "message": "Nama playlist tidak boleh kosong"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

---

## 10. PUT /api/playlists/:id

### Description

- Update playlist name

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>",
    "Content-Type": "application/json"
  }
  ```

- Parameters

  ```
  id (required): integer - playlist ID
  ```

- Body

  ```json
  {
    "name": "string (required)"
  }
  ```

### Response

#### _200 - OK_

```json
{
  "message": "Playlist updated successfully"
}
```

#### _400 - Bad Request_

```json
{
  "message": "Name is required"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

#### _403 - Forbidden_

```json
{
  "message": "Unauthorized"
}
```

#### _404 - Not Found_

```json
{
  "message": "Playlist not found"
}
```

---

## 11. DELETE /api/playlists/:id

### Description

- Delete a playlist

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>"
  }
  ```

- Parameters
  ```
  id (required): integer - playlist ID
  ```

### Response

#### _200 - OK_

```json
{
  "message": "Playlist deleted"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

#### _403 - Forbidden_

```json
{
  "message": "Unauthorized"
}
```

#### _404 - Not Found_

```json
{
  "message": "Playlist not found"
}
```

#### _500 - Internal Server Error_

```json
{
  "message": "Error message"
}
```

---

## 12. POST /api/playlists/:id/music

### Description

- Add a music track to a playlist

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>",
    "Content-Type": "application/json"
  }
  ```

- Parameters

  ```
  id (required): integer - playlist ID
  ```

- Body

  ```json
  {
    "spotifyId": "string (required)",
    "name": "string (required)",
    "artist": "string (required)",
    "album": "string (required)",
    "image": "string (optional, URL)",
    "spotify_url": "string (optional, URL)"
  }
  ```

### Response

#### _201 - Created_

```json
{
  "id": "integer",
  "spotifyId": "string",
  "name": "string",
  "artist": "string",
  "album": "string",
  "image": "string (URL)",
  "spotify_url": "string (URL)",
  "PlaylistId": "integer",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)"
}
```

#### _400 - Bad Request_

```json
{
  "message": "Missing required fields"
}
OR
{
  "message": "Song already in playlist"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

#### _404 - Not Found_

```json
{
  "message": "Playlist not found or unauthorized"
}
```

#### _500 - Internal Server Error_

```json
{
  "message": "Failed to add song",
  "error": "string"
}
```

---

## 13. DELETE /api/playlists/:id/music/:musicId

### Description

- Remove a music track from a playlist

### Request

- Headers

  ```json
  {
    "Authorization": "Bearer <access_token>"
  }
  ```

- Parameters
  ```
  id (required): integer - playlist ID
  musicId (required): integer - music ID
  ```

### Response

#### _200 - OK_

```json
{
  "message": "Music deleted"
}
```

#### _401 - Unauthorized_

```json
{
  "message": "Invalid token"
}
```

#### _403 - Forbidden_

```json
{
  "message": "Unauthorized"
}
```

#### _404 - Not Found_

```json
{
  "message": "Music not found"
}
```

#### _500 - Internal Server Error_

```json
{
  "message": "Error message"
}
```

---

## Global Error Responses

### _401 - Unauthorized_

Returned when:

- No Authorization header provided
- Invalid or expired JWT token
- User not found

```json
{
  "message": "Invalid token"
}
```

### _500 - Internal Server Error_

Returned when an unexpected error occurs on the server

```json
{
  "message": "Internal server error"
}
```

---
