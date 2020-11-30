
CORS policy for storage file access

* Set web app domain name(s) as origin in cors.json. Add a localhost entry for testing with emulators
* Run this command, substituting your storage domain name:

`gsutil cors set cors.json gs://trustedsetup-a86f4.appspot.com`

See https://groups.google.com/g/firebase-talk/c/oSPWMS7MSNA/m/RnvU6aqtFwAJ?pli=1
