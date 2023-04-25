"use strict"
var fs = _interopRequireWildcard(require("fs"));
var _promises = require("stream/promises");
var _readline = _interopRequireDefault(require("readline"));
const { performance } = require('perf_hooks');
var _lineByLine = _interopRequireDefault(require("line-by-line"));
var _json2csv = _interopRequireDefault(require("json2csv"));
const _cliProgress = require('cli-progress');
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const rl = _readline.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const prompt = query => new Promise(resolve => rl.question(query, resolve));
const bar = new _cliProgress.SingleBar({}, _cliProgress.Presets.shades_classic);
var inputFileHeaders = []
const userInputs = {
    hasHeaderFound: false,
    hasHeaderInput: '',
    hasHeader: false,
    convertToCSVFound: false,
    convertToCSVInput: '',
    convertToCSV: false,
    startProcessFound: false,
    startProcessInput: '',
    startProcess: false,
    restartProcessFound: false,
    restartProcessInput: '',
    restartProcess: false,
    outputLineCountFound: false,
    outputLineCount: '',
    splitFileCount: 0,
    outputFileFormat: '',
    inputDelimiter: [],
    objectTypeFile: false
}
async function getUserInput(stage, condition) {
    switch (stage) {
        case 1:
            {
                while (!userInputs.hasHeaderFound) {
                    userInputs.hasHeaderInput = await prompt("\x1b[37m" + "\nDo the file(s) you want to process have headers on the first line? Y/N: ");
                    if (userInputs.hasHeaderInput.match(/^[YNyn]$/)) {
                        if (userInputs.hasHeaderInput.match(/^[Yy]$/)) {
                            console.log("\x1b[32m" + `Headers will be added to each processed file.`)
                            userInputs.hasHeader = true;
                        }
                        else if (userInputs.hasHeaderInput.match(/^[Nn]$/)) {
                            console.log("\x1b[32m" + `No headers will be added to the processed file(s), and they will remain as is.\nUnless they are object type file!`)
                            userInputs.hasHeader = false;
                        }
                        userInputs.hasHeaderFound = true;
                    }
                    else {
                        console.log("\x1b[31m" + 'Incorrect input. Please input y/Y or n/N');
                    }
                }
            }
            if (userInputs.hasHeader) {
                {
                    while (!userInputs.convertToCSVFound) {
                        userInputs.convertToCSVInput = await prompt("\x1b[37m" + "\nConvert to CSV format? Y/N: ");
                        if (userInputs.convertToCSVInput.match(/^[YNyn]$/)) {
                            if (userInputs.convertToCSVInput.match(/^[Yy]$/)) {
                                userInputs.convertToCSV = true;
                                userInputs.outputFileFormat = 'csv'
                                console.log("\x1b[32m" + `File(s) will be converted to CSV format.`)

                            }
                            else if (userInputs.convertToCSVInput.match(/^[Nn]$/)) {
                                userInputs.convertToCSV = false;
                                console.log("\x1b[32m" + `File(s) will be kept in its original format.`)
                            }
                            userInputs.convertToCSVFound = true;
                        }
                        else {
                            console.log("\x1b[31m" + 'Incorrect input. Please input y/Y or n/N');
                        }
                    }
                }
            }

            break;

        case 2:
            {
                while (!userInputs.outputLineCountFound) {
                    userInputs.outputLineCount = await prompt("\x1b[37m" + "\nSplit files to how many lines?: ");
                    userInputs.outputLineCount = Number(userInputs.outputLineCount);
                    if (userInputs.outputLineCount > 20 && userInputs.outputLineCount < condition) {
                        userInputs.splitFileCount = Math.ceil(condition / userInputs.outputLineCount);
                        userInputs.outputLineCountFound = true;
                    }
                    else {
                        console.log("\x1b[31m" + 'Please input a number more than 20' + ` or less than ${condition}`);
                    }
                }
            }

            break;
        case 'Initialise': {
            console.log(`
            ██████  ██████  ███    ██ ██    ██ ███████ ██████  ████████ 
            ██      ██    ██ ████   ██ ██    ██ ██      ██   ██    ██    
            ██      ██    ██ ██ ██  ██ ██    ██ █████   ██████     ██    
            ██      ██    ██ ██  ██ ██  ██  ██  ██      ██   ██    ██    
             ██████  ██████  ██   ████   ████   ███████ ██   ██    ██    
                                                                         
                                                                         
                                       ██                                
                                       ██                                
                                    ████████                             
                                    ██  ██                               
                                    ██████                               
                                                                         
                                                                         
                        ███████ ██████  ██      ██ ████████              
                        ██      ██   ██ ██      ██    ██                 
                        ███████ ██████  ██      ██    ██                 
                             ██ ██      ██      ██    ██                 
                        ███████ ██      ███████ ██    ██                             
            `)
            console.log(`\n\x1b[1m------------------------------\x1b[33mIshfaq Ahmed\x1b[37m--------------------------------`);
            console.log(`-----------------------\x1b[33mGithub: @IshfaqAhmedProg\x1b[37m---------------------------\x1b[0m\n\n\n`);
            console.log("\x1b[1mConvert multiple large utf-8 encoded or plain-text file to CSV\nand split the output to desired amount of lines!\n")
            console.log(`File Types accepted: .csv,.txt\n`);
            console.log(`Make sure to check what kind of data is inside!\x1b[0m\n
1)\x1b[32m Make sure all files in input directory is the same type of file.\x1b[37m\n
2)\x1b[32m If the data is seperated into lines.\x1b[37m\n
3)\x1b[32m If the data has header or not.\x1b[37m\n
4)\x1b[32m Data has delimiters.
    Delimiters: \x1b[37m","\x1b[32m  => abc,dfg,hij
                \x1b[37m";"\x1b[32m  => abc;dfg;hij
                \x1b[37m":"\x1b[32m  => abc:dfg:hij
                \x1b[37m"|"\x1b[32m  => abc|dfg|hij
                \x1b[37m"/t"\x1b[32m => abc   dfg   hij\x1b[37m\n
5)\x1b[32m Type of data in lines are either an object or seperated by delimiters.
    Data type:  \x1b[37mObject type data\x1b[32m     => {"a":"bc","d":"fg"}
                \x1b[37mDelimitter type data\x1b[32m => abc,dfg,hij
            `);
        }
            break;
        case 'restart':
            {
                while (!userInputs.restartProcessFound) {
                    userInputs.restartProcessInput = await prompt("\x1b[37m" + "\nDo you want to restart the script? Y/N: ");
                    if (userInputs.restartProcessInput.match(/^[YNyn]$/)) {
                        if (userInputs.restartProcessInput.match(/^[Yy]$/)) {
                            console.log(`\x1b[32mRestarting script!.`)
                            const initialValues = {
                                hasHeaderFound: false,
                                hasHeaderInput: '',
                                hasHeader: false,
                                convertToCSVFound: false,
                                convertToCSVInput: '',
                                convertToCSV: false,
                                startProcessFound: false,
                                startProcessInput: '',
                                startProcess: false,
                                restartProcessFound: false,
                                restartProcessInput: '',
                                restartProcess: false,
                                outputLineCountFound: false,
                                outputLineCount: '',
                                splitFileCount: 0,
                                outputFileFormat: '',
                                inputDelimiter: [],
                                objectTypeFile: false
                            }
                            Object.keys(userInputs).forEach((k) => userInputs[k] = initialValues[k])
                        }
                        else if (userInputs.restartProcessInput.match(/^[Nn]$/)) {
                            console.log(`\x1b[32mPress CTRL+C to close.`)
                            userInputs.restartProcess = false;
                            rl.close();
                        }
                        userInputs.restartProcessFound = true;
                    }
                    else {
                        console.log("\x1b[31m" + 'Incorrect input. Please input y/Y or n/N');
                    }
                }
            }
            break;
        case 'start':
            {
                while (!userInputs.startProcessFound) {
                    console.log(`\n\x1b[32mProcess will be started with these settings`)
                    console.log(`\x1b[37mInput files have header:\x1b[32m${userInputs.hasHeader}\x1b[37m`)
                    console.log(`Convert to CSV:\x1b[32m${userInputs.convertToCSV}\x1b[37m`)
                    userInputs.inputDelimiter.length != 0 ?
                        console.log(`Delimiter detected, check if this is the correct delimiter:\x1b[32m${userInputs.inputDelimiter}\x1b[37m`) : ''
                    console.log(`Max no of lines in chunk:\x1b[32m${userInputs.outputLineCount}\x1b[37m`)
                    console.log(`To \x1b[32m${userInputs.splitFileCount}\x1b[37m chunk(s)`)
                    userInputs.startProcessInput = await prompt("\x1b[37m" + `\nStart the process for \x1b[32m${condition}?\x1b[37m Y/N: `);
                    if (userInputs.startProcessInput.match(/^[YNyn]$/)) {
                        if (userInputs.startProcessInput.match(/^[Yy]$/)) {
                            userInputs.startProcess = true;
                        }
                        else if (userInputs.hasHeaderInput.match(/^[Nn]$/)) {
                            userInputs.startProcess = false;
                        }
                        userInputs.startProcessFound = true;
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
function createDir(path) {
    var dir = `./${path}`
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}
function splitFile(file, totalLines) {
    console.log(`\nSplitting ${file}!`)
    return new Promise((resolve) => {
        bar.start(totalLines, 0)
        var lr = new _lineByLine.default(`input/${file}`, {
            skipEmptyLines: true
        });
        var linesRead = 0;
        var linesWritten = 0;
        var writingToFile = 0;
        var lineToWrite = '';
        const splitWriteStreams = [];
        createDir('output')
        //create multiple streams according to the splitfilecount
        for (let index = 0; index < userInputs.splitFileCount; index++) {
            createDir(`output/${file}`);
            var writeStreamPath = `output/${file}/${file.substr(0, file.lastIndexOf('.')) + index}.${userInputs.outputFileFormat}`
            splitWriteStreams.push(fs.createWriteStream(writeStreamPath));
        }
        lr.on('error', function (err) {
            console.log("\x1b[31m" + err);
            resolve(err);
        });
        lr.on('line', function (line) {
            linesRead += 1;
            bar.update(linesRead);
            if (writingToFile <= userInputs.splitFileCount) {
                linesWritten += 1
                //for convert to csv false
                lineToWrite = line;
                //for convert to csv true
                if (userInputs.convertToCSV) {
                    //convert line to jsonObj
                    var jsonObj = userInputs.objectTypeFile ? JSON.parse(lineToWrite) : parseLineToJSON(lineToWrite);

                    var lineInCSV = convertJSONToCSV(jsonObj);
                    if ((linesWritten == 1 && linesRead > 1) || (linesWritten == 1 && userInputs.objectTypeFile)) {
                        //add back the header if writing to new file but skip the first file
                        lineToWrite = inputFileHeaders.toString() + '\n' + lineInCSV;
                    }
                    else {
                        //if writing to same file
                        lineToWrite = lineInCSV;
                    }
                }
                splitWriteStreams[writingToFile].write(lineToWrite + '\n');
                if (linesWritten == userInputs.outputLineCount) {
                    writingToFile += 1;
                    linesWritten = 0;
                }
            }
        })
        lr.on('end', function () {
            splitWriteStreams.forEach(writeStream => {
                writeStream.end();
            });
            bar.stop();
            resolve();
        })
    })
}
function parseLineToJSON(line) {
    var dataArray = line.replace(/['"]+/g, '').split(userInputs.inputDelimiter);
    const jsonObj = {}
    for (let data = 0; data < dataArray.length; data++) {
        jsonObj[inputFileHeaders[data]] = dataArray[data];
    }
    return jsonObj;
}
function convertJSONToCSV(jsonObj) {
    var lineInCSV = '';
    const fields = inputFileHeaders;
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
function getTotalLines(file) {
    console.log(`\nCounting total number of lines in ${file}, please wait...`)
    return new Promise((resolve) => {
        var lr = new _lineByLine.default(`input/${file}`, {
            skipEmptyLines: true
        });
        var lineCount = 0;
        lr.on('error', function (err) {
            console.log("\x1b[31m" + err);
            resolve(err);
        });
        lr.on('line', function (line) {
            lineCount += 1
            if (lineCount == 1) {
                if (userInputs.hasHeader) {
                    userInputs.inputDelimiter = guessDelimiters(line);
                    inputFileHeaders = line.replace(/["']/g, '').split(userInputs.inputDelimiter);
                }
                else if (line.startsWith('{') && line.endsWith('}')) {
                    userInputs.inputDelimiter = ['Object type file']
                    userInputs.objectTypeFile = true;
                    userInputs.convertToCSV = true;
                    userInputs.outputFileFormat = 'csv'
                }
            }
            if (userInputs.objectTypeFile) {
                const jsonObj = JSON.parse(line);
                inputFileHeaders = [...new Set([...inputFileHeaders, ...Object.keys(jsonObj)])];
            }
        })
        lr.on('end', function () {
            console.log("\x1b[37m" + `Object type file detected! Headers Found:` + "\x1b[32m", inputFileHeaders)
            resolve(lineCount);
        })
    })
}
function guessDelimiters(text, possibleDelimiters = ['\t', ',', '|', ';']) {
    return possibleDelimiters.filter(weedOut);
    function weedOut(delimiter) {
        var cache = -1;
        return text.split('\n').every(checkLength);

        function checkLength(line) {
            if (!line) {
                return true;
            }

            var length = line.split(delimiter).length;
            if (cache < 0) {
                cache = length;
            }
            return cache === length && length > 1;
        }
    }
}
async function main() {
    await getUserInput('Initialise')
    try {
        for (; ;) {
            while (!userInputs.restartProcess) {
                await getUserInput(1);//does files have header
                const filesInInput = await listDir('input').catch(err => console.log(err))
                for (let file = 0; file < filesInInput.length; file++) {
                    const fileInInput = filesInInput[file];
                    if (!userInputs.convertToCSV) {//if user doesnt want to convert to csv then keep original format
                        userInputs.outputFileFormat = fileInInput.split('.')[1];
                    }
                    const totalLines = await getTotalLines(fileInInput);
                    console.log(`Total lines found in ${fileInInput}:\x1b[32m${totalLines}\x1b[37m`)
                    await getUserInput(2, totalLines);
                    await getUserInput('start', fileInInput)
                    if (userInputs.startProcess) {
                        await splitFile(fileInInput, totalLines);
                        if (file === filesInInput.length - 1)
                            userInputs.restartProcess = true
                    }
                    else {
                        userInputs.restartProcess = true;
                    }
                }
            }
            await getUserInput('restart');
        }

    } catch (error) {
        console.log('Main function:', error)
    }
}
main()
rl.on('close', () => process.exit(0));