<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d908a6fe-34e7-4bf9-9159-eec0886f00a8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Realistic emotion portraits

Emotions use **real expression photos** of each avatar, not pixel warping. Without portraits the avatar still reacts through natural head motion, blinking, subtle color mood and voice tone.

To generate portraits automatically:

1. Get a free Gemini API key from AI Studio.
2. Add `GEMINI_API_KEY="..."` to `.env` (or `.env.local`) and restart the app.
3. Select an avatar, choose an emotion, and press **Generate portraits** in the Emotion panel.

You can also upload your own photo for any emotion with the **Upload … photo** button. Generated/uploaded files are stored in `data/expressions/` (git-ignored).
