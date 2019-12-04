const uuidv1 = require('uuid/v1'); // uuid timestamp
const {existsSync, mkdirSync} = require("fs");
const multer = require("multer");
const {FILES_FOLDER, UPLOAD_FOLDER} = require("./storage_paths");

// to check existence of given path
const exists = (dir) => {
    try {
        return existsSync(dir);
    } catch (e) {
        return false;
    }
};

module.exports = function () {
    // create if not exist yet this folder for multer ( temp storage )
    if (!exists(UPLOAD_FOLDER)) {
        mkdirSync(UPLOAD_FOLDER, { recursive: true });
    }
    // same for definitive storage
    if (!exists(FILES_FOLDER)) {
        mkdirSync(FILES_FOLDER, { recursive: true });
    }

    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, UPLOAD_FOLDER)
        },
        filename: function (req, file, cb) {
            // Since we only used zip , give unique
            const generate_unique_filename = "sources-" + uuidv1() + ".zip";
            cb(null, generate_unique_filename)
        }
    });
}

;