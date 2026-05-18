# Frontend

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Firebase Notifications

Firebase is used only for native mobile push notifications.

Android:

Place your Firebase config file here:

`frontend/android/app/google-services.json`

Backend:

Place your Firebase Admin service account file here:

`backend/firebase-service-account.json`

Then set this variable in `backend/.env`:

`FIREBASE_SERVICE_ACCOUNT_FILE=./firebase-service-account.json`
  
