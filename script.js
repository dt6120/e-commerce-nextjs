const detect = require("detect-file-type");

detect.fromBuffer(
  "https://ipfs.io/ipfs/QmddQwKp51S5JXC4wiNEZxYLBkQjq3L3k9UizWAj3RqSAd",
  (err, data) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(data);
    }
  }
);
