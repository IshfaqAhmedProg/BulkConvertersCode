"use strict"
var fs = _interopRequireWildcard(require("fs"));
var _promises = require("stream/promises");
var _zlib = _interopRequireDefault(require("zlib"));
var _xlsx = _interopRequireDefault(require("xlsx"));
var _lineByLine = _interopRequireDefault(require("line-by-line"));
var _json2csv = _interopRequireDefault(require("json2csv"));
const { performance } = require('perf_hooks');
var _readline = _interopRequireDefault(require("readline"));
const _cliProgress = require('cli-progress');
const _prependFile = require('prepend-file');
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const rl = _readline.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const prompt = query => new Promise(resolve => rl.question(query, resolve));
console.log(`
.########.....###....########....###...
.##.....##...##.##......##......##.##..
.##.....##..##...##.....##.....##...##.
.##.....##.##.....##....##....##.....##
.##.....##.#########....##....#########
.##.....##.##.....##....##....##.....##
.########..##.....##....##....##.....##
`)
console.log(`
..######..########...#######...######...######...######..##.....##.########..######..##....##
.##....##.##.....##.##.....##.##....##.##....##.##....##.##.....##.##.......##....##.##...##.
.##.......##.....##.##.....##.##.......##.......##.......##.....##.##.......##.......##..##..
.##.......########..##.....##..######...######..##.......#########.######...##.......#####...
.##.......##...##...##.....##.......##.......##.##.......##.....##.##.......##.......##..##..
.##....##.##....##..##.....##.##....##.##....##.##....##.##.....##.##.......##....##.##...##.
..######..##.....##..#######...######...######...######..##.....##.########..######..##....##
`)
console.log(`\n------------------------ Ishfaq Ahmed ------------------------`);
console.log(`---------------- Github: @IshfaqAhmedProg --------------------\n\n\n`);
var inputFilesHeaders = []
const userInputs = {
    refHeaderFound: false,
    refHeader: '',
    keepFalseFound: false,
    keepFalseInput: '',
    keepFalse: false,
    newHeader: '',
    splitHeaderFound: false,
    splitHeaderInput: '',
    splitHeaderName: '',
    splitHeader: false,
    addBackHeaderFound: false,
    addBackHeaderInput: '',
    addBackHeader: false,
}

function processLineByLine(file, referenceList, splitHeaderValues, ext) {
    console.log("\x1b[37m" + `Processing ${file}. please wait...`)
    switch (ext) {
        case 'txt':
        case 'csv':
            return new Promise((resolve, reject) => {
                var startTime = performance.now()
                var lr = new _lineByLine.default(`input/${file}`, {
                    skipEmptyLines: true
                });
                var lineCount = 0;
                var lineInCSV = '';
                var outputdir = `./output`
                if (!fs.existsSync(outputdir)) {
                    fs.mkdirSync(outputdir);
                }
                lr.on('error', function (err) {
                    console.log("\x1b[31m" + err);
                    resolve(err);
                });
                //if user told to split header---------------*********************
                if (userInputs.splitHeader) {
                    const splitWriteStreams = [];
                    //create multiple writestreams
                    for (let index = 0; index < splitHeaderValues.length; index++) {
                        const splitHeader = splitHeaderValues[index];
                        var dir = `./output/${splitHeader}`
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                        }
                        splitWriteStreams.push(fs.createWriteStream(`output/${splitHeader}/${file.substr(0, file.lastIndexOf('.'))}.csv`))
                    }
                    var noMatch = `./output/noMatch`
                    if (!fs.existsSync(noMatch)) {
                        fs.mkdirSync(noMatch);
                    }
                    const noMatchWriteStream = fs.createWriteStream(`output/noMatch/${file.substr(0, file.lastIndexOf('.'))}.csv`);
                    lr.on('line', function (line) {
                        lineCount += 1
                        if (lineCount > 1) {
                            const jsonObj = parseLineToJSON(line, ext)
                            const crossCheckResult = crossCheck(jsonObj, referenceList);
                            const splitValueIndex = checkSplitValue(jsonObj, splitHeaderValues);
                            if (userInputs.keepFalse) {
                                lineInCSV = convertJSONToCSV(jsonObj);
                                if (crossCheckResult) {
                                    lineInCSV = lineInCSV + "true"
                                }
                                else {
                                    lineInCSV = lineInCSV + "false"
                                }
                                if (splitValueIndex != null) {
                                    //matches split value
                                    splitWriteStreams[splitValueIndex].write(lineInCSV + '\n')
                                }
                                else {
                                    //doesnt match any split value
                                    noMatchWriteStream.write(lineInCSV + '\n')
                                }
                            }
                            //if user doesnt want the false values
                            else {
                                if (crossCheckResult) {
                                    lineInCSV = convertJSONToCSV(jsonObj);
                                    if (splitValueIndex != null) {
                                        //matches split value
                                        splitWriteStreams[splitValueIndex].write(lineInCSV + '\n')
                                    }
                                    else {
                                        //doesnt match any split value
                                        noMatchWriteStream.write(lineInCSV + '\n')
                                    }
                                }
                            }
                        }
                    })
                    lr.on('end', function () {
                        splitWriteStreams.forEach(writeStream => {
                            writeStream.end()
                        });
                        noMatchWriteStream.end()
                    })
                }
                else {
                    const writeStream = fs.createWriteStream(`output/${file.substr(0, file.lastIndexOf('.'))}.csv`);
                    lr.on('line', function (line) {
                        lineCount += 1;
                        if (lineCount > 1) {
                            const jsonObj = parseLineToJSON(line, ext)
                            const crossCheckResult = crossCheck(jsonObj, referenceList);
                            //if user wants the false values
                            if (userInputs.keepFalse) {
                                lineInCSV = convertJSONToCSV(jsonObj);
                                if (crossCheckResult) {
                                    lineInCSV = lineInCSV + "true"
                                }
                                else {
                                    lineInCSV = lineInCSV + "false"
                                }
                                writeStream.write(lineInCSV + '\n')
                            }
                            //if user doesnt want the false values
                            else {
                                if (crossCheckResult) {
                                    lineInCSV = convertJSONToCSV(jsonObj);
                                    //doesnt match any split value
                                    writeStream.write(lineInCSV + '\n')
                                }
                            }
                        }
                    });
                    lr.on('end', function () {
                        writeStream.end()
                    })
                }
                lr.on('end', function () {
                    var stopTime = performance.now()
                    console.log("\x1b[32m" + `Processed ${file}. Took ${stopTime - startTime}ms, average time per line ${(stopTime - startTime) / lineCount}ms`)
                    resolve();
                    // All lines are read, file is closed now.
                });
            })
            break;
        case 'gz':
            {
                return new Promise(resolve => {
                    var startTime = performance.now()
                    //read from temp
                    var lr = new _lineByLine.default(`output/temp.json`, {
                        skipEmptyLines: true
                    });
                    lr.on('error', function (err) {
                        console.log("\x1b[31m" + err);
                        resolve(err);
                    });
                    var lineCount = 0;
                    var lineInCSV = "";
                    //if user told to split header---------------*********************
                    if (userInputs.splitHeader) {
                        const splitWriteStreams = [];
                        for (let index = 0; index < splitHeaderValues.length; index++) {
                            const splitHeader = splitHeaderValues[index];
                            var dir = `./output/${splitHeader}`
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir);
                            }
                            splitWriteStreams.push(fs.createWriteStream(`output/${splitHeader}/${file.substr(0, file.lastIndexOf('.'))}.csv`))
                        }
                        var noMatch = `./output/noMatch`
                        if (!fs.existsSync(noMatch)) {
                            fs.mkdirSync(noMatch);
                        }
                        const noMatchWriteStream = fs.createWriteStream(`output/noMatch/${file.substr(0, file.lastIndexOf('.'))}.csv`);
                        lr.on('line', function (line) {
                            lineCount += 1;
                            //converting string to obj
                            const jsonObj = JSON.parse(line);
                            const crossCheckResult = crossCheck(jsonObj, referenceList);
                            const splitValueIndex = checkSplitValue(jsonObj, splitHeaderValues);
                            //if user wants the false values
                            if (userInputs.keepFalse) {
                                lineInCSV = convertJSONToCSV(jsonObj);
                                if (crossCheckResult) {
                                    lineInCSV = lineInCSV + "true"
                                }
                                else {
                                    lineInCSV = lineInCSV + "false"
                                }
                                if (splitValueIndex != null) {
                                    //matches split value
                                    splitWriteStreams[splitValueIndex].write(lineInCSV + '\n')
                                }
                                else {
                                    //doesnt match any split value
                                    noMatchWriteStream.write(lineInCSV + '\n')
                                }
                            }
                            //if user doesnt want the false values
                            else {
                                if (crossCheckResult) {
                                    lineInCSV = convertJSONToCSV(jsonObj);
                                    if (splitValueIndex != null) {
                                        //matches split value
                                        splitWriteStreams[splitValueIndex].write(lineInCSV + '\n')
                                    }
                                    else {
                                        //doesnt match any split value
                                        noMatchWriteStream.write(lineInCSV + '\n')
                                    }
                                }
                            }
                        });
                        lr.on('end', function () {
                            splitWriteStreams.forEach(writeStream => {
                                writeStream.end()
                            });
                            noMatchWriteStream.end()
                        })
                    }
                    else {
                        const writeStream = fs.createWriteStream(`output/${file.substr(0, file.lastIndexOf('.'))}.csv`);
                        lr.on('line', function (line) {
                            lineCount += 1;
                            const jsonObj = JSON.parse(line);
                            const crossCheckResult = crossCheck(jsonObj, referenceList);
                            //if user wants the false values
                            if (userInputs.keepFalse) {
                                lineInCSV = convertJSONToCSV(jsonObj);
                                if (crossCheckResult) {
                                    lineInCSV = lineInCSV + "true"
                                }
                                else {
                                    lineInCSV = lineInCSV + "false"
                                }
                                writeStream.write(lineInCSV + '\n')
                            }
                            //if user doesnt want the false values
                            else {
                                if (crossCheckResult) {
                                    lineInCSV = convertJSONToCSV(jsonObj);
                                    //doesnt match any split value
                                    writeStream.write(lineInCSV + '\n')
                                }
                            }
                        });
                        lr.on('end', function () {
                            writeStream.end()
                        })
                    }
                    lr.on('end', function () {
                        var stopTime = performance.now()
                        console.log("\x1b[32m" + `Processed ${file}. Took ${stopTime - startTime}ms, average time per line ${(stopTime - startTime) / lineCount}ms`)
                        resolve();
                        // All lines are read, file is closed now.
                    });
                });
            }
            break;

        default:
            break;
    }
}
function parseLineToJSON(line, ext) {
    var dataArray =
        ext == 'txt' ?
            line.replace(/['"]+/g, '').split('\t')
            :
            line.replace(/['"]+/g, '').split(',')
    const jsonObj = {}
    for (let data = 0; data < dataArray.length; data++) {
        jsonObj[inputFilesHeaders[data]] = dataArray[data];
    }
    return jsonObj;
}
function convertJSONToCSV(jsonObj) {
    var lineInCSV = '';
    const fields = Object.keys(jsonObj);
    if (userInputs.newHeader != '')
        fields.push(userInputs.newHeader)
    const opts = {
        fields,
        header: false
    };
    try {
        lineInCSV = _json2csv.parse(jsonObj, opts);
    } catch (err) {
        console.error(err);
    }
    return lineInCSV;
}
function crossCheck(line, referenceList) {
    const index = referenceList.indexOf(line[userInputs.refHeader]);
    if (index != -1) {
        return true
    }
    return false
}
function checkSplitValue(line, countryList) {
    const index = countryList.indexOf(line[userInputs.splitHeaderName]);
    if (index != -1) {
        return index
    }
    return null
}
function getReferenceList() {
    try {
        const workbook = _xlsx.default.readFile("ref.xlsx");
        const column = _xlsx.default.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        return column;
    } catch (error) {
        console.log("\x1b[31m" + "Error reading ref.xlsx", error)
        return false;
    }
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
async function unzipFile(file) {
    const unzip = _zlib.default.createUnzip();
    const input = fs.createReadStream(`input/${file}`);
    //check if directory exists
    var dir = './output';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const output = fs.createWriteStream("output/temp.json");
    console.log("\x1b[37m" + `Unzipping ${file}`)
    var startTime = performance.now()
    await (0, _promises.pipeline)(input, unzip, output);
    var endTime = performance.now()
    console.log("\x1b[32m" + `Succesfully Unzipped ${file}. Took ${endTime - startTime}ms`);
}
async function getUserInput(stage, referenceList) {
    switch (stage) {
        case 0:
            {

            }
            break;
        case 1:
            {
                while (!userInputs.refHeaderFound) {
                    userInputs.refHeader = await prompt("\x1b[37m" + "\nEnter the header from ref.xlsx you want to crosscheck: ");
                    if (Object.keys(referenceList[0]).includes(userInputs.refHeader)) {
                        console.log("\x1b[32m" + `Running query on "${userInputs.refHeader}"`);
                        userInputs.refHeaderFound = true;
                    } else {
                        console.log("\x1b[31m" + 'Incorrect input. Please check for lowercase, uppercase and special characters');
                    }
                }
                while (!userInputs.keepFalseFound) {
                    userInputs.keepFalseInput = await prompt("\x1b[37m" + "\nDo you want to keep both false and true values? Y/N: ");
                    if (userInputs.keepFalseInput.match(/^[YNyn]$/)) {
                        if (userInputs.keepFalseInput.match(/^[Yy]$/)) {
                            console.log("\x1b[32m" + `Both values will be kept, a new column will be created with TRUE/FALSE values!"`);
                            userInputs.keepFalse = true;
                        }
                        else if (userInputs.keepFalseInput.match(/^[Nn]$/)) {
                            console.log("\x1b[32m" + `After crosschecking only true values will be output.\nIf no true values are found output file will be empty!`);
                            userInputs.keepFalse = false;
                        }
                        userInputs.keepFalseFound = true;
                    }
                    else {
                        console.log("\x1b[31m" + 'Incorrect input. Please input y/Y or n/N');
                    }
                }
                if (userInputs.keepFalse) {
                    userInputs.newHeader = await prompt("\x1b[37m" + `\nEnter the name of the new column: `);
                    console.log("\x1b[32m" + `New column header will be "${userInputs.newHeader}"`);

                }
                while (!userInputs.splitHeaderFound) {
                    userInputs.splitHeaderInput = await prompt("\x1b[37m" + "\nDo you want to split output data to multiple folders \naccording to any header in 'input' data? Y/N: ");
                    if (userInputs.splitHeaderInput.match(/^[YNyn]$/)) {
                        if (userInputs.splitHeaderInput.match(/^[Yy]$/)) {
                            console.log("\x1b[32m" + `Data will be split to multiple folders, checking for headers in input data`);
                            userInputs.splitHeader = true;
                        }
                        else if (userInputs.splitHeaderInput.match(/^[Nn]$/)) {
                            console.log("\x1b[32m" + `Data will be output to single folder`);
                            userInputs.splitHeader = false;
                        }
                        userInputs.splitHeaderFound = true;
                    }
                    else {
                        console.log("\x1b[31m" + '\nIncorrect input. Please input y/Y or n/N');
                    }
                }
            }
            break;
        case 2:
            {
                userInputs.splitHeaderFound = false
                while (!userInputs.splitHeaderFound) {
                    userInputs.splitHeaderName = await prompt("\x1b[37m" + "\nSelect the header to split the data: ");
                    if (referenceList.includes(userInputs.splitHeaderName)) {
                        console.log("\x1b[32m" + 'Split by ' + `${userInputs.splitHeaderName}`);
                        userInputs.splitHeaderFound = true;
                    }
                    else {
                        console.log("\x1b[31m" + 'Incorrect input. Please check for lowercase, uppercase and special characters' + `${userInputs.splitHeaderName}`);
                    }
                }
            }
            break;
        case 3:
            {
                while (!userInputs.addBackHeaderFound) {
                    userInputs.addBackHeaderInput = await prompt("\x1b[37m" + "Check if output files have headers.\nIf not, do you want to add back headers?\nNOTE* this will also delete any empty files Y/N: ");
                    if (userInputs.addBackHeaderInput.match(/^[YNyn]$/)) {
                        if (userInputs.addBackHeaderInput.match(/^[Yy]$/)) {
                            console.log("\n\x1b[32m" + `Adding headers to all files`);
                            userInputs.addBackHeader = true;
                        }
                        else if (userInputs.addBackHeaderInput.match(/^[Nn]$/)) {
                            console.log("\x1b[32m" + `No headers added, You're good to go hit CTRL+C to exit!`);
                            userInputs.addBackHeader = false;
                        }
                        userInputs.addBackHeaderFound = true;
                    }
                    else {
                        console.log("\x1b[31m" + 'Incorrect input. Please input y/Y or n/N');
                    }
                }
            }
            break;

        default:
            break;
    }
    return userInputs;
}
async function getInputFiles() {
    const inputFiles = {
        files: [],
        ext: ''
    }
    const listInputFiles = await listDir('input').catch(err => console.log("\x1b[31m" + err));
    const listInputExt = listInputFiles.map((file) => file.substr(file.indexOf('.') + 1, file.length))
    if (listInputExt.every((val, i, arr) => val === arr[0])) {
        inputFiles.files = listInputFiles;
        inputFiles.ext = listInputExt[0]
        return inputFiles;
    }
    else {
        throw new Error("\x1b[31m" + 'All files in folder "input" dont have the same type!')
    }
}
async function getInputHeaders(firstFile, ext) {
    switch (ext) {
        case 'txt':
        case 'csv':
            {
                return new Promise((resolve) => {
                    var lr = new _lineByLine.default(`input/${firstFile}`, {
                        skipEmptyLines: true
                    });
                    var delimiter = ext == 'txt' ? '\t' : ','
                    var headersInInput = []
                    var lineCount = 0;
                    lr.on('error', function (err) {
                        console.log("\x1b[31m" + err);
                        resolve(err);
                    });
                    lr.on('line', function (line) {
                        lineCount += 1
                        if (lineCount == 1) {
                            headersInInput = (line.replace(/['"]+/g, '').split(delimiter))
                            lr.close()
                        }
                    })
                    lr.on('end', function () {
                        var uniqueList = headersInInput.filter((v, i, a) => a.indexOf(v) === i || a.indexOf(v) == null);
                        uniqueList = uniqueList.filter(n => n)
                        resolve(uniqueList);
                    })
                })
            }
            break;
        case 'gz':
            {
                await unzipFile(firstFile)
                return new Promise((resolve) => {
                    var lr = new _lineByLine.default(`output/temp.json`, {
                        skipEmptyLines: true
                    });
                    var headersInInput = []
                    var lineCount = 0;
                    lr.on('error', function (err) {
                        console.log("\x1b[31m" + err);
                        resolve(err);
                    });
                    lr.on('line', function (line) {
                        lineCount += 1
                        if (lineCount == 1) {
                            const jsonObj = JSON.parse(line);
                            headersInInput = Object.keys(jsonObj);
                            lr.close()
                        }
                    })
                    lr.on('end', function () {
                        resolve(headersInInput);
                    })
                })
            }
            break;
        default:
            {
                throw new Error("File type not txt,csv or gz")
            }
            break;
    }


}
function getSplitHeaderValuesForGZ(splitHeaderName) {
    console.log("\x1b[37m" + `Getting list of ${splitHeaderName}`);
    var startTime = performance.now()
    return new Promise(resolve => {
        //read from temp
        var lr = new _lineByLine.default(`output/temp.json`, {
            skipEmptyLines: true
        });
        var listOfSplitHeaderValues = []
        lr.on('error', function (err) {
            console.log("\x1b[31m" + err);
            resolve(err);
        });
        lr.on('line', function (line) {
            //check if line has the element from referenceList
            var lineInJSON = JSON.parse(line);
            listOfSplitHeaderValues.push(lineInJSON[splitHeaderName]);
            // 'line' contains the current line without the trailing newline character.
        });
        lr.on('end', function () {
            var uniqueList = listOfSplitHeaderValues.filter((v, i, a) => a.indexOf(v) === i);
            uniqueList = uniqueList.filter(n => n)
            var endTime = performance.now()
            console.log("\x1b[32m" + `Got list of ${splitHeaderName}. Took ${endTime - startTime}ms`)
            resolve(uniqueList);
            // All lines are read, file is closed now.
        });
    });
}
function getSplitHeaderValuesForOthers(splitHeaderName, file, ext, allHeadersFound) {
    console.log("\x1b[37m" + `Getting list of ${splitHeaderName} from ${file}. Please wait...`);
    var startTime = performance.now()
    return new Promise((resolve, reject) => {
        var lr = new _lineByLine.default(`input/${file}`, {
            skipEmptyLines: true
        });
        var listOfSplitHeaderValues = []
        var lineCount = 0;
        const indexOfSplitHeader = allHeadersFound.indexOf(splitHeaderName);
        lr.on('error', function (err) {
            console.log("\x1b[31m" + err);
            resolve(err);
        });

        lr.on('line', function (line) {
            lineCount += 1;
            if (lineCount != 1) {
                var lineAsArray =
                    ext == 'txt' ?
                        line.split('\t')
                        :
                        line.split(',')
                var newItem = lineAsArray[indexOfSplitHeader].replace(/['"]+/g, '')
                if (listOfSplitHeaderValues.indexOf(newItem) === -1) {
                    listOfSplitHeaderValues.push(newItem);
                }
            }
        })

        lr.on('end', function () {

            var endTime = performance.now()
            console.log("\x1b[32m" + `Got list of ${splitHeaderName}. Took ${endTime - startTime}ms`)
            resolve(listOfSplitHeaderValues);
            // All lines are read, file is closed now.
        });
    })
}
async function prependHeaders(path) {
    var headersAsCSV = inputFilesHeaders.toString() + '\n'
    var sTime = performance.now()
    await _prependFile(`${path}`, headersAsCSV)
        .then(() => {
            var eTime = performance.now()
        })
        .catch(err => console.log(err))
}
function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}
async function cleanEmpty(path) {
    if (getFilesizeInBytes(path) == 0) {
        try {
            await fs.promises.unlink(`${path}`);
            // console.log(`Successfully deleted ${path}`);
            return true;
        } catch (error) {
            console.error('There was an error:', error.message);
        }
    }
    else { return false }

}
async function main() {
    try {
        var referenceList = getReferenceList();
        if (referenceList != false) {
            console.log("\x1b[37m" + 'Headers found in ref.xlsx:', Object.keys(referenceList[0]));
            //get all user inputs
            await getUserInput(1, referenceList);
            //check file type in input
            const inputFiles = await getInputFiles();
            inputFilesHeaders = await getInputHeaders(inputFiles.files[0], inputFiles.ext);
            if (userInputs.splitHeader) {
                //get headers by reading first line of first file and process txt or csv
                console.log("\x1b[37m" + `Headers found in ${inputFiles.files[0]}`);
                console.log(inputFilesHeaders)
                await getUserInput(2, inputFilesHeaders);
            }
            //push the new header to list of input headers
            if (userInputs.keepFalse) {
                inputFilesHeaders.push(userInputs.newHeader)
            }
            referenceList = referenceList.map((element) => { return element[userInputs.refHeader] })
            for (let i = 0; i < inputFiles.files.length; i++) {
                const file = inputFiles.files[i];
                if (inputFiles.ext == 'txt' || inputFiles.ext == 'csv') {
                    //process txt csv
                    if (userInputs.splitHeader) {
                        const splitHeaderValues = await getSplitHeaderValuesForOthers(userInputs.splitHeaderName, file, inputFiles.ext, inputFilesHeaders);
                        console.log("\x1b[37m" + `${splitHeaderValues.length} number of data found, Splitting to ${splitHeaderValues.length} Folders `)
                        await processLineByLine(file, referenceList, splitHeaderValues, inputFiles.ext)
                    }
                    else {
                        await processLineByLine(file, referenceList, null, inputFiles.ext)
                    }
                }
                else if (inputFiles.ext == 'gz') {
                    //unzip one input file
                    if (i != 0) {
                        await unzipFile(file).then(async () => {
                            //check temp against reference
                            if (userInputs.splitHeader) {
                                const splitHeaderValues = await getSplitHeaderValuesForGZ(userInputs.splitHeaderName);
                                console.log("\x1b[37m" + `${splitHeaderValues.length} different types of data found, Splitting to ${splitHeaderValues.length} Folders `)
                                await processLineByLine(file, referenceList, splitHeaderValues, inputFiles.ext).then(async () => {
                                    //delete temp;
                                    try {
                                        await fs.promises.unlink("output/temp.json");
                                        // console.log(`Successfully deleted output/temp.json`);
                                    } catch (error) {
                                        console.error('There was an error:', error.message);
                                    }
                                });
                            }
                            else {
                                await processLineByLine(file, referenceList, null, inputFiles.ext).then(async () => {
                                    //delete temp;
                                    try {
                                        await fs.promises.unlink("output/temp.json");
                                        // console.log(`Successfully deleted output/temp.json`);
                                    } catch (error) {
                                        console.error('There was an error:', error.message);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        if (userInputs.splitHeader) {
                            const splitHeaderValues = await getSplitHeaderValuesForGZ(userInputs.splitHeaderName);
                            console.log("\x1b[37m" + `${splitHeaderValues.length} different types of data found, Splitting to ${splitHeaderValues.length} Folders `)
                            await processLineByLine(file, referenceList, splitHeaderValues, inputFiles.ext).then(async () => {
                                //delete temp;
                                try {
                                    await fs.promises.unlink("output/temp.json");
                                    // console.log(`Successfully deleted output/temp.json`);
                                } catch (error) {
                                    console.error('There was an error:', error.message);
                                }
                            });
                        }
                        else {
                            await processLineByLine(file, referenceList, null, inputFiles.ext).then(async () => {
                                //delete temp;
                                try {
                                    await fs.promises.unlink("output/temp.json");
                                    // console.log(`Successfully deleted output/temp.json`);
                                } catch (error) {
                                    console.error('There was an error:', error.message);
                                }
                            });
                        }
                    }

                }

            }
            console.log("\x1b[32m" + '\nProcessed all files!')
            //add back headers
            await getUserInput(3, null);
            if (userInputs.addBackHeader) {
                const outputAll = await listDir('output').catch(err => console.log(err));
                const appendProgress = new _cliProgress.SingleBar({}, _cliProgress.Presets.shades_classic);
                appendProgress.start(outputAll.length, 0);
                if (userInputs.splitHeader) {
                    //if there are folders inside output
                    for (let folder = 0; folder < outputAll.length; folder++) {
                        const outputFolder = outputAll[folder];
                        appendProgress.update(folder + 1)
                        const filesInOutputFolder = await listDir(`output/${outputFolder}`).catch(err => console.log(err))
                        for (let file = 0; file < filesInOutputFolder.length; file++) {
                            const fileInOutputFolder = filesInOutputFolder[file];
                            const path = `output/${outputFolder}/${fileInOutputFolder}`
                            const cleaned = await cleanEmpty(path)
                            if (!cleaned)
                                await prependHeaders(path)
                        }
                        if (folder == outputAll.length - 1) {
                            appendProgress.stop();
                        }
                    }
                }
                else {
                    //if there are files in output
                    for (let file = 0; file < outputAll.length; file++) {
                        appendProgress.update(file + 1)
                        const outputFile = outputAll[file];
                        const path = `output/${outputFile}`
                        const cleaned = await cleanEmpty(path)
                        if (!cleaned)
                            await prependHeaders(path)
                        if (file == outputAll.length - 1) {
                            appendProgress.stop();
                        }
                    }
                }
            }
            console.log("\x1b[32m" + '\nAdded Headers to all files! press CTRL+C to exit')
        }
        else {
            console.log("\x1b[31m" + `No ref.xlsx found or no data found in ref.xlsx,\n Please check the name, extension, data of the file if a custom ref.xlsx has been created!`)
        }
    } catch (error) {
        console.log("\x1b[31m" + "Main function", error)
    }
}
main();