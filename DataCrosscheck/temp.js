if (userInputs.keepFalse) {
    if (crossCheckResults) {
        lineInCSV = lineInCSV + "true"
    }
    else {
        lineInCSV = lineInCSV + "false"
    }
    if (splitValueIndex != null) {
        splitWriteStreams[splitValueIndex].write(lineInCSV + '\n')
    }
    else {
        writeStream.write(lineInCSV + '\n')
    }
}
else {
    if (crossCheckResults) {
        const splitValueIndex = checkSplitValue(jsonObj, splitHeaderValues);
        if (splitValueIndex != null) {
            splitWriteStreams[splitValueIndex].write(lineInCSV + '\n')
        }
        else {
            writeStream.write(lineInCSV + '\n')
        }
    }
}

// __________________________________________________________________________________


lineCount += 1;
const jsonObj = JSON.parse(line);
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