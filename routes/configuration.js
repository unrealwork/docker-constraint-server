var express = require('express');
var _ = require('lodash');
var router = express.Router();
var properties = require('../utils/client').properties;
var timeConstants = require('../utils/atsd-constants').time;

var CONFIGURATION_ENTITY = "stressed-configurations";

router.get('/', function (req, res, next) {
    var type = req.query.type;
    if (type != null) {
        res.json({"type": type})
    } else {
        res.status(400);
        res.json({error: "You need to specify a configurationRoute type"});
    }
});


router.get('/types', function (req, res, next) {
    properties.getPropertyTypes(CONFIGURATION_ENTITY, function (error, response, body) {
        if (response.statusCode == 500) {
            res.json({error: "Failed to get property from connected ATSD"})
        } else {
            res.status(response.statusCode);
            res.json(body)
        }
    });
});

router.get('/types/:configurationType', function (req, res, next) {
    var type = req.params.configurationType;
    var payload = [{
        type: type,
        entity: CONFIGURATION_ENTITY,
        startDate: timeConstants.MIN_QUERIED_DATE,
        endDate: timeConstants.MAX_QUERIED_DATE
    }];
    properties.query(payload, function (error, response, body) {
        if (response.statusCode == 500) {
            res.json({error: "Failed to get property from connected ATSD"})
        } else {
            res.status(response.statusCode);
            if (response.statusCode == 200) {
                res.json(_.map(body, propertyToConfiguration));
            } else {
                res.json(body);
            }
        }
    });
});


router.get('/types/:configurationType/ids', function (req, res, next) {
    var type = req.params.configurationType;
    var payload = [{
        type: type,
        entity: CONFIGURATION_ENTITY,
        startDate: timeConstants.MIN_QUERIED_DATE,
        endDate: timeConstants.MAX_QUERIED_DATE
    }];
    properties.query(payload, function (error, response, body) {
        if (response.statusCode == 500) {
            res.json({error: "Failed to get property from connected ATSD"})
        } else {
            res.status(response.statusCode);
            if (response.statusCode == 200) {
                var ids = [];
                body.forEach(function (element) {
                    ids.push(element.key.id)
                });
                res.json(ids);
            } else {
                res.json(body)
            }
        }
    });
});


router.get('/types/:configurationType/ids/:id', function (req, res, next) {
    var type = req.params.configurationType;
    var key = req.params.id;
    var payload = [{
        type: type,
        entity: CONFIGURATION_ENTITY,
        startDate: timeConstants.MIN_QUERIED_DATE,
        endDate: timeConstants.MAX_QUERIED_DATE,
        key: {
            id: key
        }
    }];
    properties.query(payload, function (error, response, body) {
        if (response.statusCode == 500) {
            res.json({error: "Failed to get property from connected ATSD"})
        } else {
            res.status(response.statusCode);
            if (response.statusCode == 200) {
                if (body.length == 0) {
                    res.status(404);
                    res.json({
                        error: "Configuration with type: " + type + " and id: " + key + " not found"
                    })
                } else {
                    if (body.length == 1) {
                        res.json(propertyToConfiguration(body[0]))
                    } else {
                        res.statusCode(400);
                        res.json({
                            error: "Too many configurations with type: " + type + " and id:" + id
                        })
                    }
                }
            } else {
                res.json(body)
            }
        }
    });
});

function propertyToConfiguration(property) {
    return {
        type: property.type,
        options: property.tags.options,
        period: {
            start: property.tags["start_time"],
            end: property.tags["end_time"]
        }
    }
}

module.exports = router;