const express = require("express");
const multer = require("multer");
const { SVG, convertSVGToMask } = require("@iconify/tools");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index", { result: null });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);
    const svgContent = fs.readFileSync(filePath, "utf8");

    // Replace unexpected colors with black
    const cleanedSvgContent = replaceColorsWithBlack(svgContent);

    const svg = new SVG(cleanedSvgContent);
    const result = convertSVGToMask(svg, { force: true });

    fs.unlinkSync(filePath);

    res.render("index", {
      result: result ? svg.toString() : "Error while converting",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

function replaceColorsWithBlack(svgContent) {
  return svgContent.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g, (match) => {
    if (match.toLowerCase() !== "#000000" && match.toLowerCase() !== "#000") {
      console.log(`Unexpected color: ${match}`);
      return "#000000";
    }
    return match;
  });
}

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
