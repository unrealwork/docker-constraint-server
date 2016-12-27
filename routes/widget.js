var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/response-time', function (req, res, next) {
    var period = req.body;
    if (period == null) {
        res.status(400);
        res.json({
            error: "Incorrect widget params, you need to specify start and end time"
        })
    } else {
        res.status(200);
        try {
            var startMs = Date.parse(period.start);
            var endMs = Date.parse(period.end);
        } catch (e) {
            console.log("Failed to parse start or period date");
            res.status()
        }

        var config = {
            initSize: {width: 1600, height: 600},
            timespan: (endMs - startMs - 15000) + ' millisecond',
            timezone: "UTC",
            displaypanels: 'true',
            endtime: period.end,
            minrange: 0,
            series: [{
                entity: 'docker-constraint',
                metric: 'jmeter.mysql-response-time',
                tags: {
                    id: 'all.all.max'
                }
            }],
            url: "http://localhost:4000"
        };
        res.json(config)
    }
    res.sendFile(path.join(__dirname + 'public/index.html'));
});

module.exports = router;
