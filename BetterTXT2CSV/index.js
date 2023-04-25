const splitFile = require('split-file');
var fs = _interopRequireWildcard(require("fs"));
var _readline = _interopRequireDefault(require("readline"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

console.log(`..######..########..##.......####.########..........#######...........######...######..##.....##
.##....##.##.....##.##........##.....##............##.....##.........##....##.##....##.##.....##
.##.......##.....##.##........##.....##...................##.........##.......##.......##.....##
..######..########..##........##.....##.............#######..........##........######..##.....##
.......##.##........##........##.....##............##................##.............##..##...##.
.##....##.##........##........##.....##............##................##....##.##....##...##.##..
..######..##........########.####....##....#######.#########.#######..######...######.....###...`)
console.log(`\n------------------------ Ishfaq Ahmed ------------------------`);
console.log(`---------------- Github: @IshfaqAhmedProg --------------------\n\n\n`);
const rl = _readline.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const prompt = query => new Promise(resolve => rl.question(query, resolve));

async function listDir(dir) {
    let names;
    try {
        names = await fs.promises.readdir(dir);
    } catch (e) {
        console.log("e", e);
    }
    if (names === undefined) {
        return `No file found in ${dir} folder`;
    } else {
        return names;
    }
}
function splitFiles(inputFile, maxSize, name) {
    return new Promise((resolve) => {
        var dest = `./output/${name}`;
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        splitFile.splitFileBySize(inputFile, maxSize, dest)
            .then((names) => {
                console.log(names);
                resolve(true);
            })
            .catch((err) => {
                console.log('Error: ', err);
                resolve(false);
            });
    })
}
async function main() {
    var gotMaxSize = false;
    var maxSize;
    var gotTypeOf = false;
    var typeOfFile;
    while (!gotMaxSize) {
        maxSize = await prompt("\x1b[37m" + "\nEnter the maxSize for each part in bytes(eg. 100mb = 100000000): ");
        maxSize = Number(maxSize);
        console.log(typeof maxSize);
        if (typeof maxSize == 'number') {
            gotMaxSize = true;
        } else {
            console.log("\x1b[31m" + '\nIncorrect input. Please enter a number');
        }
    }
    while (!gotTypeOf) {
        typeOfFile = await prompt("\x1b[37m" + "\nEnter the typeOfFile you want to split(eg: csv, txt etc.): ");
        if (typeOfFile != null) {
            gotTypeOf = true;
        } else {
            console.log("\x1b[31m" + '\nIncorrect input. Please enter an extension');
        }
    }
    const FoldersToSplit = await listDir('input').catch(err => console.log(err));
    var outputDir = `./output`;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    for (let index = 0; index < FoldersToSplit.length; index++) {
        const name = FoldersToSplit[index];
        const inputFile = `input/${name}/${name}.${typeOfFile}`
        splitFiles(inputFile, maxSize, name).then(() => console.log(`split ${name}`))
    }
    console.log('Split all files!')
}
main();
