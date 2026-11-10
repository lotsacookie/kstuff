# EXEmu

Load a Unity Windows game in the browser. Upload a `.zip` of the game folder (the `.exe` and its `<name>_Data` folder) and EXEmu rebuilds its scenes with WebGL.

Open `index.html` through any static host (GitHub Pages works) and drop the zip on the page.

## What it does

- Reads the zip locally, nothing is uploaded
- Detects the Unity version, scripting backend and exe architecture
- Parses `globalgamemanagers`, `levelN`, `sharedassetsN.assets`, `.resS` and uncompressed or LZ4 `data.unity3d` bundles
- Rebuilds each scene: transform hierarchy, meshes, materials, textures (RGBA32, RGB24, ARGB32, BGRA32, RGB565, 4444, Alpha8, DXT1, DXT5)
- Fly camera, starting from the scene's own camera

## Limits

The `.exe` is not executed. C# scripts (Mono and IL2CPP), physics, audio, UI, lightmaps, skinning, shaders and compressed meshes are not supported, so you get the static world rather than a playable game. LZMA bundles and ETC/ASTC/BC7/crunched textures are not decoded yet.
