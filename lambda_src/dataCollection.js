const request = require('request');

module.exports = {
    getCarbonIntensityData: getCarbonIntensityData
};

async function getCarbonIntensityData(dateString) {
    var url = process.env.CARBON_INTENSITY_API + '/regional/intensity/' + dateString + '/fw24h/regionid/'
        + process.env.CARBON_INTENSITY_API_REGION_ID;

    const requestOptions = {
        url: url,
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    };

    console.log(`Sending request to: ${url}`);

    return new Promise(async function (resolve, reject) {
        request(requestOptions, function (err, res, body) {
            if (err) {
                let message = "Error collecting data: " + err;
                console.log(message);
                reject(message)
            }

            if (res.statusCode !== 200) {
                let message = "Received status: " + res.statusCode + " with body: " + body;
                console.log(message);
                reject(message)
            }
            let jsonBody = JSON.parse(body);
            resolve(jsonBody)
        });
    });
}
