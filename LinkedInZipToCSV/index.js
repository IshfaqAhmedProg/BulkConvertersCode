"use strict";

var fs = _interopRequireWildcard(require("fs"));
var _promises = require("stream/promises");
var _zlib = _interopRequireDefault(require("zlib"));
var _xlsx = _interopRequireDefault(require("xlsx"));
var _lineByLine = _interopRequireDefault(require("line-by-line"));
var _json2csv = require("json2csv");
var _readline = _interopRequireDefault(require("readline"));
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
function processLineByLine(file, referenceList, header, checkFor, countryList) {
  console.log(`Processing ${file}. please wait...`)
  return new Promise(resolve => {
    var startTime = performance.now()
    //read from temp
    var lr = new _lineByLine.default(`output/temp.json`, {
      skipEmptyLines: true
    });
    var lineCount = 0;
    var lineInCSV = "";
    const countryWriteStreams = [];
    for (let index = 0; index < countryList.length; index++) {
      const country = countryList[index];
      var dir = `./output/${country}`
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      countryWriteStreams.push(fs.createWriteStream(`output/${country}/${file.substr(0, file.lastIndexOf('.'))}.csv`))
    }
    var nocountrydir = `./output/noCountry`
    if (!fs.existsSync(nocountrydir)) {
      fs.mkdirSync(nocountrydir);
    }
    const writeStream = fs.createWriteStream(`output/noCountry/${file.substr(0, file.lastIndexOf('.'))}.csv`);
    lr.on('error', function (err) {
      console.log(err);
      resolve(err);
    });
    lr.on('line', function (line) {
      //check if line has the element from referenceList

      lineCount += 1;
      const jsonObj = JSON.parse(line);
      const fields = Object.keys(jsonObj);
      fields.push(checkFor)
      const opts = {
        fields,
        header: false
      };
      try {
        lineInCSV = (0, _json2csv.parse)(jsonObj, opts);
      } catch (err) {
        console.error(err);
      }
      const chineseLastName = checkChinese(jsonObj, referenceList);
      if (chineseLastName) {
        lineInCSV = lineInCSV + "true"
      }
      else {
        lineInCSV = lineInCSV + "false"
      }
      const countryFound = checkCountry(jsonObj, countryList);
      if (countryFound != null) {
        countryWriteStreams[countryFound].write(lineInCSV + '\n')
      }
      else {
        writeStream.write(lineInCSV + '\n')
      }
      // 'line' contains the current line without the trailing newline character.
    });
    lr.on('end', function () {
      var stopTime = performance.now()
      console.log(`Processed ${file}. Took ${stopTime - startTime}ms, average time per line ${(stopTime - startTime) / lineCount}ms`)
      resolve();
      // All lines are read, file is closed now.
    });
  });
}
function getListOfCountries() {
  console.log(`Getting list of countries`);
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
      console.log(`Got list of countries. Took ${endTime - startTime}ms`)
      resolve(uniqueList);
      // All lines are read, file is closed now.
    });
  });
}
function checkChinese(line, referenceList) {
  const index = referenceList.indexOf(line.last_name);
  if (index != -1) {
    return true
  }
  return false
}
function checkCountry(line, countryList) {
  const index = countryList.indexOf(line.location_country);
  if (index != -1) {
    return index
  }
  return null
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
        header = await prompt("\x1b[37m" + "\nEnter the header from ref.xlsx you want to crosscheck: ");
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
        const file = inputFilesAll[i];
        //unzip one input file
        await unzipFile(file).then(async () => {
          //check temp against reference
          const listOfCountries = await getListOfCountries();
          console.log(`${listOfCountries.length} countries found`)
          await processLineByLine(file, referenceList, header, checkFor, listOfCountries).then(async () => {
            //delete temp;
            try {
              await fs.promises.unlink("output/temp.json");
              // console.log(`Successfully deleted output/temp.json`);
            } catch (error) {
              console.error('There was an error:', error.message);
            }
          });
        });
      }
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