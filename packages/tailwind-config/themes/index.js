/**
 * Theme Exports
 *
 * Import themes as:
 * - import { starter } from "@app/tailwind-config/themes"
 * - import { sample } from "@app/tailwind-config/themes"
 *
 * CUSTOMIZATION: Add your own themes by creating a new file
 * and exporting it here.
 */

const starter = require("./starter");
const sample = require("./sample");
const defaultTheme = require("./default");

module.exports = {
  starter,
  sample,
  default: defaultTheme,
};
