const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DOWNLOADS_DIR = path.join(__dirname, "downloads");

if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR);
}

app.post("/download", async (req, res) => {
    try {
        const { url, type } = req.body;

        if (!url) {
            return res.status(400).json({
                error: "URL is required",
            });
        }

        const filename = `media_${Date.now()}`;

        let command;

        if (type === "audio") {
            command = `yt-dlp -x --audio-format mp3 -o "downloads/${filename}.%(ext)s" "${url}"`;
        } else {
            command = `yt-dlp -t mp4 -o "downloads/${filename}.%(ext)s" "${url}"`;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);

                return res.status(500).json({
                    error: "Download failed",
                });
            }

            const files = fs.readdirSync(DOWNLOADS_DIR);

            const foundFile = files.find((file) => file.startsWith(filename));

            if (!foundFile) {
                return res.status(404).json({
                    error: "File not found",
                });
            }

            res.json({
                success: true,
                download: `/file/${foundFile}`,
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "An error occurred while processing your request",
        });
    }
});

app.get("/file/:name", (req, res) => {
    const filePath = path.join(DOWNLOADS_DIR, req.params.name);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    res.download(filePath);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
