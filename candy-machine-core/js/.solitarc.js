// @ts-check
const path = require('path');
const programDir = path.join(__dirname, '..', 'program');
const idlDir = path.join(__dirname, 'idl');
const sdkDir = path.join(__dirname, 'src', 'generated');
const binaryInstallDir = path.join(__dirname, '.crates');

module.exports = {
    idlGenerator: 'anchor',
    programName: 'candy_machine_core',
    programId: 'CMv3YQQ7nbhFUjArAcGuRcDa6avoYN1a72HRZMvJ6WnU',
    idlDir,
    sdkDir,
    binaryInstallDir,
    programDir,
};
