'use strict';

const data= require('./data.json');

const { services, regions } = data;

module.exports.data = data;

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

module.exports.regionName = (regionNameShort) => {
    const region = regions[regionNameShort.toLowerCase()];

    if (region) {
        return region.name;
    }

    throw new Error(`aws-info: ${regionNameShort} is not a known region short name`);
};