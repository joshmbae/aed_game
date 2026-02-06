<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1kGtWQagcFCB028QCcUIRSO_HijWXw3hj

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Desktop Build (Tauri)

**Prerequisites:** Node.js, Rust toolchain (via [rustup](https://rustup.rs)), Xcode command line tools on macOS.

1. Install dependencies if you have not already:
   `npm install`
2. Run the desktop app in a windowed shell:
   `npm run tauri:dev`
3. Produce a signed desktop bundle:
   `npm run tauri:build`
