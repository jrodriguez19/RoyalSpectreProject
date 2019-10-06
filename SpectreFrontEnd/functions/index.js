const functions = require('firebase-functions')
const os = require('os')
const path = require('path')
const cors = require('cors')({ origin: true })
const Busboy = require('busboy')
const fs = require('fs')

const {Storage} = require("@google-cloud/storage");
const gcconfig  ={
    projectId: "royalspectreproject",
    keyFilename: "royalspectreproject-firebase-adminsdk-zussx-c81c552705.json"
};

const gcs = new Storage(gcconfig);

 // This code is based on an tutorial from the user "Academind" on Youtube.com
  // See https://www.youtube.com/watch?v=YkvqLNcJz3Y

exports.uploadFile = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      if (req.method !== "POST") {
        return res.status(500).json({
          message: "Not allowed"
        });
      }
      const busboy = new Busboy({ headers: req.headers });
      let uploadData = null;
  
      busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        const filepath = path.join(os.tmpdir(), filename);
        uploadData = { file: filepath, type: mimetype };
        file.pipe(fs.createWriteStream(filepath));
      });
  
      busboy.on("finish", () => {
        const bucket = gcs.bucket("royalspectreproject.appspot.com");
        bucket
          .upload(uploadData.file, {
            uploadType: "media",
            metadata: {
              metadata: {
                contentType: uploadData.type
              }
            }
          })
          .then(() => {
            res.status(200).json({
              message: "It worked!"
            });
            throw new Error("It Doesn't work!");
          })
          .catch(err => {
            res.status(500).json({
              error: err
            });
          });
      });
      busboy.end(req.rawBody);
    });
  });
