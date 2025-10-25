# rock-art-game
Magdalenian rock art game
 
## Run locally

This is a static HTML/JS/CSS project. Open `index.html` in a browser to run locally. For best results use a modern browser (Chrome/Edge/Firefox).

Optional: serve via a simple static server (from PowerShell):

```powershell
# start a simple static server using Python (if available)
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

## What changed (recent updates)
- Fixed Stage 3 wall selection bug (SVG texture overlay no longer blocks clicks).
- Improved drawing UX:
	- Brush size and opacity sliders
	- Smoother pointer-based drawing with quadratic smoothing
	- Undo (last several snapshots)
- Visual improvements:
	- Dynamic lamplight flicker overlay (CSS + canvas)
	- Dust particle overlay for atmospheric depth
	- Dynamic spotlight that follows the cursor
- Ambient synthesized audio (toggle in Stage 5) using WebAudio for subtle lamp hum and crackle.
 - Ambient synthesized audio (toggle in Stage 5) using WebAudio for subtle lamp hum and crackle. You can replace the synth with real audio files later.
 - New tools: Eraser and Export PNG (download your artwork).

If anything doesn't work in your environment, tell me which browser and version you're using and I'll adapt the implementation.
