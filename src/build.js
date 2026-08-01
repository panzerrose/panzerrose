const fs = require("node:fs");
const path = require("node:path");

const rootDirectory = path.resolve(__dirname, "..");

const paths = {
  palette: path.join(__dirname, "palette.json"),
  ui: path.join(__dirname, "ui.json"),
  syntax: path.join(__dirname, "syntax.json"),
  output: path.join(
    rootDirectory,
    "themes",
    "Panzerrose-color-theme.json"
  )
};

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Could not read or parse:\n${filePath}`);
    throw error;
  }
}

const palette = readJson(paths.palette);
const ui = readJson(paths.ui);
const syntax = readJson(paths.syntax);

function resolvePaletteReference(value, location = "theme") {
  if (typeof value === "string" && value.startsWith("$")) {
    const colorName = value.slice(1);
    const resolvedColor = palette[colorName];

    if (!resolvedColor) {
      throw new Error(
        `Unknown palette color "${value}" used at ${location}.`
      );
    }

    return resolvedColor;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) =>
      resolvePaletteReference(item, `${location}[${index}]`)
    );
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        resolvePaletteReference(nestedValue, `${location}.${key}`)
      ])
    );
  }

  return value;
}

const theme = {
  name: "Panzerrose",
  type: "dark",
  colors: resolvePaletteReference(ui, "colors"),
  tokenColors: resolvePaletteReference(syntax, "tokenColors")
};

try {
  fs.writeFileSync(
    paths.output,
    `${JSON.stringify(theme, null, 2)}\n`,
    "utf8"
  );

  console.log("Panzerrose theme built successfully.");
  console.log(`Output: ${paths.output}`);
} catch (error) {
  console.error("Could not write the generated theme.");
  throw error;
}