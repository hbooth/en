import http from 'http'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

// need to send each request and wait to avoid overloading the server
async function postEncounters(host, port, rows, status = 'NONE', batchSize = 50) {
    var added = 0;
    var processed = 0;
    while (processed < rows.length) {
        let submission = { encounters: [] };
        // process batchSize at a time
        for (; processed < rows.length && submission.encounters.length < batchSize; processed++) {
            var entry = rows[processed];
            submission.encounters.push({
                status: status,
                encounterId: entry.encounterId,
                timestamp: entry.timestamp,
                _meta: {
                    mac: entry.mac,
                    rssi_values: entry.rssi_values,
                    usound_data: entry.usound_data
                }
            });
        }
        // now send off to the server
        let data = JSON.stringify(submission);
        const options = {
            hostname: host,
            port: port,
            path: '/api/encounters/debug',
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
            }
        };
        try {
            let http_promise = createHttpRequestPromise(options, data);
            // wait to http request to finish
            await http_promise;
            added = added + submission.encounters.length;
        } catch(error) {
            console.log(`error while sending data: ${data}`);
            console.log(error);
        }
    }
    return added;
}

async function getEncounters(host, port) {
    var currentPage = 0, totalPages = 1;
    var result = [];
    // cutoff for the last two weeks
    let cutoff = dayjs().subtract(2, 'week').utc().format();
    while (currentPage < totalPages) {
        const options = {
            hostname: host,
            port: port,
            path: '/api/encounters/debug?page=' + currentPage + '&status=POSITIVE&timestamp[$gte]=' + cutoff,
            method: 'GET',
            headers: { 'Access-Control-Allow-Headers': 'X-Pages', 'Access-Control-Expose-Headers': 'X-Pages'}
        };
        let http_promise = createHttpRequestPromise(options);
        // wait to http request to finish
        let response = await http_promise;
        totalPages = response.pages;
        let entries = JSON.parse(response.body);
        for (var entry of entries.data.encounters) {
            result.push(entry);
        }
        currentPage++;
    }
    return result;
}

// function returns a Promise
function createHttpRequestPromise(options, data) {
	return new Promise((resolve, reject) => {
		const request = http.request(options, (response) => {
            let chunks_of_data = [];
            
			response.on('data', (fragments) => {
				chunks_of_data.push(fragments);
			});
			response.on('end', () => {
                let response_body = Buffer.concat(chunks_of_data);
                if (response.statusCode >=200 && response.statusCode < 300) {
                    resolve({body: response_body.toString(), pages: response.headers['x-pages'] ? response.headers['x-pages'] : 1});
                } else {
                    reject(new Error(response_body.toString()));
                }
			});
        });
        request.on('error', error => {
            reject(new Error(error));
        });
        if (data) {
            request.write(data);
        }
        request.end();
	});
}

export {postEncounters, getEncounters}