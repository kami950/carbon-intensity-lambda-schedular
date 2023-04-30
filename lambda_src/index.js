const AWS = require('aws-sdk');
const dataCollection = require('dataCollection.js');

var eventbridge = new AWS.EventBridge({apiVersion: '2015-10-07'});

exports.handler = async (event) => {
    const region_code = process.env.AWS_REGION;
    var tomorrowDateString = getTomorrowDateString();

    var regionData = await dataCollection.getCarbonIntensityData(tomorrowDateString);
    var leastIntensivetTime = getLeastIntensiveTime(regionData);
    await adjustSchedule(leastIntensivetTime);

    var body = {
        region: region_code,
        tomorrowDateString: tomorrowDateString,
        leastIntensivetTime: leastIntensivetTime
    };

    const response = {
        statusCode: 200,
        body: body
    };
    return response;
}

function getTomorrowDateString() {
    var date = new Date();
    date.setDate(date.getDate() + 1);

    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yyyy = date.getFullYear();

    var tomorrowDateString = yyyy + '-' + mm + '-' + dd + 'T00:00Z';

    return tomorrowDateString;
}

function getLeastIntensiveTime(regionData) {
    var lowestForecastDateTime = regionData.data.data[0].from;
    var lowestForcastValue = regionData.data.data[0].intensity.forecast;

    for (let i = 0; i < regionData.data.data.length; i ++) {
        let d = regionData.data.data[i];

        if (d.intensity.forecast < lowestForcastValue) {
            lowestForecastDateTime = d.from;
            lowestForcastValue = d.intensity.forecast;
        }
    }
    console.log(`Lowest Forecast Time: ${lowestForecastDateTime}`);
    console.log(`Lowest Forecast Value: ${lowestForcastValue}`);

    return lowestForecastDateTime;
}

async function adjustSchedule(time) {
    console.log("Got time: " + time);
    var date = new Date(time);
    // date.setDate(time);

    console.log(JSON.stringify(date));

    var mins = String(date.getMinutes());
    var hours = String(date.getHours());
    var day = String(date.getDate());
    var month = String(date.getMonth() + 1);
    var year = date.getFullYear();

    var cronRule = `cron(${mins} ${hours} ${day} ${month} ? ${year})`;
    console.log('CRON RULE: ' + cronRule);

    let params = {
        Name: process.env.SCHEDULED_EVENT_RULE_NAME,
        ScheduleExpression: cronRule
    };

    return new Promise(async function(resolve, reject) {
        eventbridge.putRule(params, (error, data) => {
            if(error) {
                let message = "Error adjusting event rule: " + error;
                console.log(message);
                reject(message)
            }
            console.log("Successfully adjusted event rule");
            resolve(data);
        });
    });
}
