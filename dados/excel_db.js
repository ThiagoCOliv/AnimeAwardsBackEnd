const XLSX = require("xlsx");
require('dotenv').config()

const filePath = process.env.FILE_PATH;
const workbook = XLSX.readFile(filePath);

module.exports = { workbook, XLSX, filePath }