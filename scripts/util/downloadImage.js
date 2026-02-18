const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

function downloadImage(url, itemDir, fileName) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const client = parsed.protocol === "https:" ? https : http;

        fileName = fileName || path.basename(parsed.pathname);
        const filePath = path.join(itemDir, fileName);

        fs.mkdirSync(itemDir, { recursive: true });

        const file = fs.createWriteStream(filePath);

        const request = client.get(url, response => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(filePath, () => {});
                return reject(new Error(`Failed: ${response.statusCode}`));
            }

            response.pipe(file);

            file.on("finish", () => {
                file.close(() => resolve(filePath));
            });
        });

        request.on("error", err => {
            file.close();
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
}

module.exports = downloadImage;