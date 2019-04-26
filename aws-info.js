'use strict';

const { services } = require('./data.json');

module.exports.endpoint = (serviceName, regionName) => {
    const service = services[serviceName.toLowerCase()];

    if (service) {
        const endpoint = service.endpoints[regionName.toLowerCase()];

        if (endpoint) {
            return endpoint;
        }

        throw new Error(`aws-info: ${serviceName} has no known endpoints in ${regionName}`);
    }

    throw new Error(`aws-info: ${serviceName} is unknown`);
};