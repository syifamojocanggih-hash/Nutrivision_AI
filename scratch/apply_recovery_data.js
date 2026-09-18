const fs = require('fs');
const path = require('path');
const { recoveryProfiles, recoveryTaxonomyRegistry } = require('./generate_recovery_profiles');

const dataJsPath = path.join(__dirname, '../js/data.js');
let dataContent = fs.readFileSync(dataJsPath, 'utf8');

// Format recoveryProfiles and recoveryTaxonomies as nicely formatted JS
const formattedProfiles = JSON.stringify(recoveryProfiles, null, 2);
const formattedTaxonomies = JSON.stringify(recoveryTaxonomyRegistry, null, 2);

// Find the start of recoveryProfiles: { and end before indonesianFoodDatabase: [
const startMarker = '  // Profil Pemulihan Bawaan Klinis Berbasis Protokol Medis\r\n  recoveryProfiles: {';
const startMarkerLf = '  // Profil Pemulihan Bawaan Klinis Berbasis Protokol Medis\n  recoveryProfiles: {';
const endMarker = '  // Basis Data Bahan Makanan & Minuman Pemulihan Klinis';

let startIndex = dataContent.indexOf(startMarker);
let isCrLf = true;
if (startIndex === -1) {
  startIndex = dataContent.indexOf(startMarkerLf);
  isCrLf = false;
}

const endIndex = dataContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers in js/data.js! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

const newline = isCrLf ? '\r\n' : '\n';

const replacement = `  // Profil Pemulihan Bawaan Klinis Berbasis Protokol Medis (12 Taksonomi Internasional + Integrasi API)` + newline +
  `  recoveryTaxonomies: ` + formattedTaxonomies + `,` + newline + newline +
  `  recoveryProfiles: ` + formattedProfiles + `,` + newline + newline;

const updatedContent = dataContent.substring(0, startIndex) + replacement + dataContent.substring(endIndex);

fs.writeFileSync(dataJsPath, updatedContent, 'utf8');
console.log('Successfully updated js/data.js with 12 recovery profiles and taxonomy registry!');
