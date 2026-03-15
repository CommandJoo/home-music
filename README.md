# 🎵 Home Music
Home Music is a simple self-hosted Music streaming and archiving service

## ✨ Features

- **Music Streaming** - Stream your personal music library from anywhere
- **Music Archiving** - Download and archive music via YouTube
- **Internet Radio** - Listen to radio stations
- **Playlists** - Create and manage playlists of your favorite songs

## 🚀 Usage
### Prerequisites
- **Git**
- **Node.js**
- **yt-dlp**

### Configuration

The backend needs to be configured to use the project <br/>
In order to do that you will need to create a config.json file  <br/>
in the root directory of backend. <br/>
You will need to provide an api key for the "youtube data api" and specify a port <br/>
The json file needs to look like this

```json
{
  "port": 3300,
  "youtube-api-key": "some-api-key"
}
```

### Running
To start home-music clone the project and run the the `start.sh` script in the root directory
```sh
git clone https://github.com/you/home-music
cd home-music
./start.sh
```

This will build and host the project. <br/>
The App will be available at `http://localhost:3300/`

## Todo

### Homepage
- [ ] Home (Personal layout (playlists, pinned songs, pinned artists) search only able to run) -> links to everything,
  no direct run button + songs clickable
- [ ] Recommendations

### Library Page
- [ ] button for creating playlists + modal for adding details like name, description and cover

## Queue
- [ ] Add Queue Editor (Move songs around, reshuffle)

## Server Mode

- [ ] Controll the Audio via the Web frontend, play it on the server for good home music integration

## License
Distributed under the **GNU GPL v3** License. See [`LICENSE`](./LICENSE.md) for more information.
