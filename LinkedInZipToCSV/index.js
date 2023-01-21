"use strict";

var fs = _interopRequireWildcard(require("fs"));
var _promises = require("stream/promises");
var _zlib = _interopRequireDefault(require("zlib"));
var _xlsx = _interopRequireDefault(require("xlsx"));
var _lineByLine = _interopRequireDefault(require("line-by-line"));
var _json2csv = require("json2csv");
var _readline = _interopRequireDefault(require("readline"));
var _cliProgress = _interopRequireDefault(require("cli-progress"));
var csv = require("fast-csv");
const { performance } = require('perf_hooks');
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
console.log(`
..######...########.####.########...........#######...........######...######..##.....##
.##....##.......##...##..##.....##.........##.....##.........##....##.##....##.##.....##
.##............##....##..##.....##................##.........##.......##.......##.....##
.##...####....##.....##..########...........#######..........##........######..##.....##
.##....##....##......##..##................##................##.............##..##...##.
.##....##...##.......##..##................##................##....##.##....##...##.##..
..######...########.####.##........#######.#########.#######..######...######.....###...`);
console.log(`\n-------------------------------- Ishfaq Ahmed --------------------------------`);
console.log(`------------------------- Github: @IshfaqAhmedProg ---------------------------\n\n\n`);
const rl = _readline.default.createInterface({
  input: process.stdin,
  output: process.stdout
});
const prompt = query => new Promise(resolve => rl.question(query, resolve));

async function unzipFile(file) {
  const unzip = _zlib.default.createUnzip();
  const input = fs.createReadStream(`input/${file}`);
  //check if directory exists
  var dir = './output';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const output = fs.createWriteStream("output/temp.json");
  console.log(`Unzipping ${file}`)
  var startTime = performance.now()
  await (0, _promises.pipeline)(input, unzip, output);
  var endTime = performance.now()
  console.log(`Succesfully Unzipped ${file}. Took ${endTime - startTime}ms`);
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

function getReferenceList() {
  try {
    const workbook = _xlsx.default.readFile("ref.xlsx");
    const column = _xlsx.default.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    return column;
  } catch (error) {
    return false;
  }
}
function processLineByLine(folder, file, referenceList, header, checkFor) {
  var startTime = performance.now()
  return new Promise(resolve => {
    //read from temp
    console.log(`processing ${file}...`)
    var lr = new _lineByLine.default(`output/temp.json`, {
      skipEmptyLines: true
    });
    var lineCountCountry = 0;
    var lineCountNoCountry = 0;
    var lineCount = 0;
    var lineInCSV = "";
    var dir = `./output/${folder}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    var noCountrydir = `./output/noCountry`;
    if (!fs.existsSync(noCountrydir)) {
      fs.mkdirSync(noCountrydir);
    }
    const noCountryStream = fs.createWriteStream(`output/noCountry/${file.substr(0, file.lastIndexOf('.'))}.csv`)
    const writeStream = fs.createWriteStream(`output/${folder}/${file.substr(0, file.lastIndexOf('.'))}.csv`);
    lr.on('error', function (err) {
      console.log(err);
      resolve(err);
    });
    lr.on('line', function (line) {
      // var startTime = performance.now();
      lineCount += 1
      //check if line has the element from referenceList
      const jsonObj = JSON.parse(line);
      const country = checkCountry(jsonObj, folder);
      if (country) {
        lineCountCountry += 1;
        const fields = Object.keys(jsonObj);
        fields.push(checkFor)
        const chineseLastName = checkChinese(jsonObj, referenceList, header);
        const opts = {
          fields,
          header: lineCountCountry == 1 ? true : false
        };
        try {
          lineInCSV = _json2csv.parse(jsonObj, opts);
        } catch (err) {
          console.error(err);
        }
        if (chineseLastName) {
          lineInCSV = lineInCSV + "true"
        }
        else {
          lineInCSV = lineInCSV + "false"
        }
        // console.log("line", lineCountCountry, lineInCSV);
        writeStream.write(lineInCSV + '\n');

      }
      // else {
      //   lineCountNoCountry += 1;
      //   const fields = Object.keys(jsonObj);
      //   fields.push(checkFor)
      //   const chineseLastName = checkChinese(line, referenceList, header);
      //   const opts = {
      //     fields,
      //     header: lineCountNoCountry == 1 ? true : false
      //   };
      //   try {
      //     lineInCSV = _json2csv.parse(jsonObj, opts);
      //   } catch (err) {
      //     console.error(err);
      //   }
      //   if (chineseLastName) {
      //     lineInCSV = lineInCSV + "true"
      //   }
      //   else {
      //     lineInCSV = lineInCSV + "false"
      //   }
      //   // console.log("line", lineCountNoCountry, lineInCSV);
      //   noCountryStream.write(lineInCSV + '\n');

      // }
      // var endTime = performance.now()
      // console.log(`line ${lineCount} took ${endTime - startTime}ms`)
      // 'line' contains the current line without the trailing newline character.
    });
    lr.on('end', function () {
      var endTime = performance.now()

      console.log(`${file} read complete for ${folder} took ${endTime - startTime}ms`)
      resolve();
      // All lines are read, file is closed now.
    });
  });
}
function getListOfCountries() {
  console.log("getting list of countries");
  var startTime = performance.now()

  return new Promise(resolve => {
    //read from temp
    var lr = new _lineByLine.default(`output/temp.json`, {
      skipEmptyLines: true
    });
    var listOfCountries = []
    lr.on('error', function (err) {
      console.log(err);
      resolve(err);
    });
    lr.on('line', function (line) {
      //check if line has the element from referenceList
      var lineInJSON = JSON.parse(line);
      listOfCountries.push(lineInJSON.location_country);
      // 'line' contains the current line without the trailing newline character.
    });
    lr.on('end', function () {
      var uniqueList = listOfCountries.filter((v, i, a) => a.indexOf(v) === i);
      uniqueList = uniqueList.filter(n => n)
      var endTime = performance.now()
      console.log(`time taken ${endTime - startTime}ms`)
      resolve(uniqueList);
      // All lines are read, file is closed now.
    });
  });
}
function checkChinese(line, referenceList, header) {
  const index = referenceList.indexOf(line.last_name);
  if (index != -1) {
    return true
  }
  return false
}
function checkCountry(line, folder) {
  if (line.location_country == folder) {
    return true;
  }
  return false;
}

function concatCSVAndOutput(csvFilePaths, outputFilePath) {
  const promises = csvFilePaths.map((path) => {
    return new Promise((resolve) => {
      const dataArray = [];
      return csv
        .parseFile(path, { headers: true })
        .on('data', function (data) {
          dataArray.push(data);
        })
        .on('end', function () {
          resolve(dataArray);
        });
    });
  });

  return Promise.all(promises)
    .then((results) => {

      const csvStream = csv.format({ headers: true });
      const writableStream = fs.createWriteStream(outputFilePath);

      writableStream.on('finish', function () {
        console.log("\x1b[32m" + `Done concatenating ${outputFilePath}!`);
      });

      csvStream.pipe(writableStream);
      results.forEach((result) => {
        result.forEach((data) => {
          csvStream.write(data);
        });
      });
      csvStream.end();

    });
}
async function main() {
  try {
    var referenceList = getReferenceList();
    // var progressBar = new _cliProgress.default.SingleBar({}, _cliProgress.default.Presets.shades_classic);
    if (referenceList != false) {
      console.log('Headers found in ref.xlsx:', Object.keys(referenceList[0]));
      var headerFound = false;
      var header;
      var checkFor;
      while (!headerFound) {
        header = await prompt("\x1b[37m" + "\nEnter the header you want to run query on: ");
        if (Object.keys(referenceList[0]).includes(header)) {
          console.log("\x1b[32m" + `\nRunning query on "${header}"`);
          headerFound = true;
        } else {
          console.log("\x1b[31m" + '\nIncorrect input. Please check for lowercase, uppercase and special characters');
        }
      }
      checkFor = await prompt("\x1b[37m" + `\nEnter the column header you want for the output (eg. "chinese_last_name" if you want to check for chinese names): `);
      // get all the input files in an array
      const inputFilesAll = await listDir('input').catch(err => console.log(err));
      referenceList = referenceList.map((element) => { return element[header] })
      // progressBar.start(inputFilesAll.length, 0);
      for (let i = 0; i < inputFilesAll.length; i++) {
        var processingComplete = false;
        // progressBar.update(i + 1);
        const file = inputFilesAll[i];
        //unzip one input file
        await unzipFile(file).then(async () => {
          //getList of countries

          const listOfCountries = await getListOfCountries();
          console.log("total countries", listOfCountries.length)
          for (let i = 0; i < listOfCountries.length; i++) {
            const folder = listOfCountries[i];
            //check temp against reference
            await processLineByLine(folder, file, referenceList, header, checkFor);
            if (i == listOfCountries.length - 1) {
              processingComplete = true;
            }
          }
          if (processingComplete) {
            //delete temp;
            try {
              await fs.promises.unlink("output/temp.json");
              console.log(`Successfully deleted output/temp.json`);
            } catch (error) {
              console.error('There was an error:', error.message);
            }
          }

        });
      }
      // console.log("combining output .csv files")
      // const outputFoldersAll = await listDir('output').catch(err => console.log(err));
      // console.log("outputFoldersAll", outputFoldersAll.length)
      // for (let index = 0; index < outputFoldersAll.length; index++) {
      //   const outputFolder = outputFoldersAll[index];
      //   const filesInOutputFolder = await listDir(`output/${outputFolder}`).catch(err => console.log(err))
      //   if (filesInOutputFolder.length != 1) {
      //     var completeConcate = false;
      //     const fileAbsolutePath = filesInOutputFolder.map((file) => `output/${outputFolder}/` + file)
      //     await concatCSVAndOutput(fileAbsolutePath, `output/${outputFolder}/${outputFolder}.csv`).then(() => {
      //       completeConcate = true
      //     })
      //     if (completeConcate) {
      //       for (let file = 0; file < fileAbsolutePath.length; file++) {
      //         fs.unlink(fileAbsolutePath[file], err => {
      //           if (err) throw err;
      //           console.log("\x1b[31m" + `${fileAbsolutePath[file]} was deleted!`);
      //         })
      //       }
      //     }
      //   }
      // }

    } else {
      console.log("No references found!");
    }

    rl.close();
  } catch (e) {
    console.error("Unable to prompt", e);
  }
}
main();
rl.on('close', () => process.exit(0));