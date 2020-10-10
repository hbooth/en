var ss = require('./struct-schema')

const recordSize = 64;
const headerSize = 96;
// set-up header sentinel
const zeros = Buffer.alloc(32);
zeros.fill(0);

const uSound = new ss.StructSchema([
  {
    key: 'n',
    type: 'uint8',
    littleEndian: true
  },
  {
    key: 'left',
    type: 'uint16',
    littleEndian: true
  },
  {
    key: 'left_iqr',
    type: 'uint16',
    littleEndian: true
  },
  {
    key: 'right',
    type: 'uint16',
    littleEndian: true
  },
  {
    key: 'right_iqr',
    type: 'uint16',
    littleEndian: true
  },
])

const encounterRecord = new ss.StructSchema([
  {
    key: 'minute',
    type: 'uint32',
    length: 1,
    littleEndian: true
  },
  {
    key: 'mac',
    type: 'uint8',
    length: 6,
    littleEndian: true
  },
  {
    key: 'version',
    type: 'uint8',
    length: 1,
    littleEndian: true
  },
  {
    key: 'usound_data',
    type: uSound,
    length: 1,
    littleEndian: true
  },
  {
    key: 'rssi_values',
    type: 'int8',
    length: 12
  },
  {
    key: 'encounter_id',
    type: 'uint8',
    length: 32,
    littleEndian: true
  }
])

function data2hex(uint8array) {
    // https://stackoverflow.com/questions/40031688/javascript-arraybuffer-to-hex
    return Array.prototype.map.call(uint8array, x => ('00' + x.toString(16)).slice(-2)).join('');
}

/*
function convertToCsv(data) {
  return JSON.stringify(data)
    .replace(/],\[/g, '\n')
    .replace(/]]/g, '')
    .replace(/\[\[/g, '')
    // in JSON, double quotes are escaped, but in CSV they need to be
    // escaped by another double quote
    .replace(/\\"/g, '""');
}

function isZero(n){ return n === 0 }

function getCSVData(data) {

  let rssi = Math.min(...data.rssi_data.map(e => e.mean))

  let [mean37, n37, min37, max37, std237] = [data.rssi_data[0].mean, data.rssi_data[0].n, data.rssi_data[0].min, data.rssi_data[0].max, data.rssi_data[0].var]
  let [mean38, n38, min38, max38, std238] = [data.rssi_data[1].mean, data.rssi_data[1].n, data.rssi_data[1].min, data.rssi_data[1].max, data.rssi_data[1].var]
  let [mean39, n39, min39, max39, std239] = [data.rssi_data[2].mean, data.rssi_data[2].n, data.rssi_data[2].min, data.rssi_data[2].max, data.rssi_data[2].var]

  return {
    date_string: data.timestamp,
    epoch_minute: data.minute,
    first: data.first_time,
    last: data.last_time,
    mean37, n37, min37, max37, std237,
    mean38, n38, min38, max38, std238,
    mean39, n39, min39, max39, std239,
    flag: data.flag, flag2: data.flag2,
    id: data.clientKey, rssi
  }
}
*/

function getDataFromView(arrayView) {
  let parsed = encounterRecord.read(arrayView)

  // convert from minute to milliseconds
  let d = new Date(parsed.minute * 60 * 1000)
  // create the timestamp -- UTC
  let timestamp = d.toISOString()

  parsed.encounter_id = data2hex(parsed.encounter_id)
  parsed.mac = data2hex(parsed.mac)
  let encounterId = parsed.encounter_id
  delete parsed.encounter_id
  return {
    ...parsed,
    timestamp,
    encounterId
  }
}

function compareBytes(buf1, offset1, buf2, offset2, length) {
  let cursor1 = offset1, cursor2 = offset2
  for (var i = 0; i < length; i++) {
    if (cursor1 >= buf1.byteLength ||
      cursor2 >= buf2.byteLength ||
      buf1[cursor1] !== buf2[cursor2]) {
      return false;
    }
    cursor1++
    cursor2++
  }
  return true;
}

function bytesToData(raw){
  // let last_mark = 0
  // console.log('numBlocks: '+numBlocks);
  // for (let index = 0; index < numBlocks; index++) {
  //   let view = new Uint32Array(raw.buffer, index * BLOCK_SIZE, BLOCK_SIZE / 4)

  //   if (view.every(isZero)) {
  //     last_mark = index
  //   }
  // }

  // let last_start = last_mark + 2
  let data = []
  let cursor = 0
  while ((cursor + recordSize) < raw.byteLength) {
    if (compareBytes(raw.buffer, cursor, zeros, 0, zeros.length)) {
      cursor += headerSize
    } else {
      let row = new DataView(raw.buffer, cursor, recordSize)
      let entry = getDataFromView(row)
      data.push(entry)
      cursor += recordSize
    }
  }
  return data
}

module.exports = {bytesToData}
// Comment the stuff below ... not needed yet
// function getPaths(obj){
//   return _toPairs(obj).reduce((ret, [key, value]) => {
//     if (_isObject(value)) {
//       return ret.concat(getPaths(obj).map(k => key + '.' + k))
//     }
//
//     ret.push(key)
//     return ret
//   }, [])
// }
//
// export function bytesToCsv(raw) {
//   // Should check that last_mark is < numBlocks
//   let data = bytesToData(raw).map(getCSVData)
//
//   let paths = getPaths(data[0])
//   let header = paths.map(_startCase)
//   let rows = data.map(entry =>
//     paths.map(p => _get(entry, p))
//   )
//
//   rows.unshift(header)
//   return convertToCsv(rows)
// }