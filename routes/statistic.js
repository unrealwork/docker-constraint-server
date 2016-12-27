var express = require('express');
var router = express.Router();
var series = require('../utils/client').series;

const DEFAULT_ENTITY = 'docker-constraint';

var typeMetricDictionary = {
    'response-time': 'jmeter.mysql-response-time'
};

var tagStatisticDictionary = {
    avg: 'all.all.mean',
    min: 'all.all.min',
    max: 'all.all.max',
    pct90: 'all.all.pct90',
    pct95: 'all.all.pct95',
    pct99: 'all.all.pct99'
};

/**
 * get statistic samples
 */

router.post('/:name', function (req, res) {
    var name = req.params.name;
    var type = req.params.type;
    var period = req.body;


    if (typeMetricDictionary.hasOwnProperty(name)) {
        var payload = [{
            entity: DEFAULT_ENTITY,
            metric: typeMetricDictionary[name],
            tags: {
                id: tagStatisticDictionary[type]
            },
            startDate: period.start,
            endDate: period.end
        }];
        series.query(payload, function (err, response, body) {
            if (response.statusCode != 200) {
                res.status(400);
                res.json({
                    error: "Incorrect params of query"
                });
            } else {
                var result = [];
                for (var i in body) {
                    var s = body[i];
                    for (tag in tagStatisticDictionary) {
                        if (s.tags.id == tagStatisticDictionary[tag]) {
                            result.push(extractStatistic(series, tag));
                            break;
                        }
                    }
                }
                res.json(body[0].data)
            }
        })
    } else {
        res.status(400);
        res.body('Incorrect type of statistic');
    }
});


router.post('/:name/:type', function (req, res) {
    var name = req.params.name;
    var type = req.params.type;
    var period = req.body;


    if (typeMetricDictionary.hasOwnProperty(name)) {
        var payload = [{
            entity: DEFAULT_ENTITY,
            metric: typeMetricDictionary[name],
            tags: {
                id: tagStatisticDictionary[type]
            },
            startDate: period.start,
            endDate: period.end
        }];
        series.query(payload, function (err, response, body) {
            if (response.statusCode != 200) {
                res.status(400);
                res.json({
                    error: "Incorrect params of query"
                });
            } else {
                res.json(extractStatistic(body[0], type));
            }
        })
    } else {
        res.status(400);
        res.body('Incorrect type of statistic');
    }
});

function extractStatistic(series, type) {
    console.log(series);
    var samples = series.data;
    var result = {
        statistic: type,
        value: samples[~~(samples.length / 2)].v
    };
    return result;
}

module.exports = router;
