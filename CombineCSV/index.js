var fs = _interopRequireWildcard(require("fs"));
const { performance } = require('perf_hooks');
var _promises = require("stream/promises");
const headersFile = require('./headers.json');
const _prependFile = require('prepend-file');
const csv = require('fast-csv')
const splitFile = require('split-file');
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
console.log(`
..######...#######..##.....##.########..####.##....##.########
.##....##.##.....##.###...###.##.....##..##..###...##.##......
.##.......##.....##.####.####.##.....##..##..####..##.##......
.##.......##.....##.##.###.##.########...##..##.##.##.######..
.##.......##.....##.##.....##.##.....##..##..##..####.##......
.##....##.##.....##.##.....##.##.....##..##..##...###.##......
..######...#######..##.....##.########..####.##....##.########
`)
console.log(`
.##.....##.########....###....########..########.########.
.##.....##.##.........##.##...##.....##.##.......##.....##
.##.....##.##........##...##..##.....##.##.......##.....##
.#########.######...##.....##.##.....##.######...########.
.##.....##.##.......#########.##.....##.##.......##...##..
.##.....##.##.......##.....##.##.....##.##.......##....##.
.##.....##.########.##.....##.########..########.##.....##
`)
console.log(`...................######...######..##.....##.................
..................##....##.##....##.##.....##.................
..................##.......##.......##.....##.................
..................##........######..##.....##.................
..................##.............##..##...##..................
..................##....##.##....##...##.##...................
...................######...######.....###....................
`)
console.log(`\n------------------------ Ishfaq Ahmed ------------------------`);
console.log(`---------------- Github: @IshfaqAhmedProg --------------------\n\n\n`);

//add headers to the csv
function addHeaders() {

}

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
async function prependHeaders(inputFolder, filesInInputFolder, headersAsCSV) {
    for (let file = 0; file < 1; file++) {
        const fileInInputFolder = filesInInputFolder[file];
        var sTime = performance.now()
        await _prependFile(`input/${inputFolder}/${fileInInputFolder}`, headersAsCSV)
            .then(() => {
                var eTime = performance.now()

                console.log("\x1B[34m" + `Done prepending headers to input/${inputFolder}/${fileInInputFolder}. Took ${eTime - sTime}ms `)
            })
            .catch(err => console.log(err))
    }
}
function concatFiles(filesAbsolutePath, outputDest, inputFolder) {
    return new Promise((resolve) => {
        //create ouput country dir
        var outputDir = `./output/${inputFolder}`
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        splitFile.mergeFiles(filesAbsolutePath, outputDest).then(() => {
            console.log("\x1b[32m" + `Done concatenating ${inputFolder}!`);
            fs.rmSync(`input/${inputFolder}`, { recursive: true, force: true });
            console.log("\x1b[31m" + `Deleted ${inputFolder}!`);
            resolve(true)
        })
    })
}
//main app function
async function main() {
    try {
        //TODO get headers from headers.json
        const headers = headersFile.headers;
        //TODO list of each file in each folder
        const headersAsCSV = headers.toString() + '\n';
        //create output dir
        var outputDir = `./output`
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        const inputFoldersAll = await listDir('input').catch(err => console.log(err));
        console.log("inputFoldersAll", inputFoldersAll.length)
        for (let folder = 0; folder < inputFoldersAll.length; folder++) {
            const inputFolder = inputFoldersAll[folder];
            const filesInInputFolder = await listDir(`input/${inputFolder}`).catch(err => console.log(err))
            const filesAbsolutePath = filesInInputFolder.map((file) => `input/${inputFolder}/` + file)

            //TODO prepend headers
            await prependHeaders(inputFolder, filesInInputFolder, headersAsCSV).then(() => {
                console.log("\x1b[32m" + `Prepended headers for all files in ${inputFolder}`)

                //TODO concatenate filesInInputFolder
                concatFiles(filesAbsolutePath, `output/${inputFolder}/${inputFolder}.csv`, inputFolder)
            })
        }
    } catch (error) {
        console.log("main function error", error)
    }
}
main()