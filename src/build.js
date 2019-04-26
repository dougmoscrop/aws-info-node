'use strict';

const fs = require('fs');

const aws = require('aws-sdk');
const chunk = require('chunk');
const dread = require('dread');

const ssm = new aws.SSM({
    region: 'us-east-1',
});

const retry = dread();

async function getParametersByPath(path, nextToken) {
    const params = {
        Path: path,
        MaxResults: 10,
        NextToken: nextToken,
        Recursive: false
    };

    const { Parameters, NextToken } = await retry(() => ssm.getParametersByPath(params).promise());

    if (NextToken) {
        const next = await getParametersByPath(path, NextToken);
        return Parameters.concat(next);
    }

    return Parameters;
}

async function getParameters(names) {
    const parameters = [];

    const chunks = chunk(names, 10);

    for (const chunk of chunks) {
        const { Parameters } = await retry(() => {
            const params = {
                Names: chunk,
            };
            return ssm.getParameters(params).promise();
        });

        parameters.push(...Parameters);
    }

    return parameters;
}

async function getServiceRegions(service) {
    const path = `/aws/service/global-infrastructure/services/${service}/regions`;
    const result = await getParametersByPath(path);
    const regions = result.reduce((memo, { Value }) => {
        memo[Value] = {};
        return memo;
    }, {});

    return regions;
}

async function getRegions() {
    const path = '/aws/service/global-infrastructure/regions';
    const result = await getParametersByPath(path);
    return result.map(parameter => parameter.Value);
}

async function getServices() {
    const path = '/aws/service/global-infrastructure/services';
    const result = await getParametersByPath(path);
    return result.map(parameter => parameter.Value);
}

async function getEndpoints(service, regions) {
    const endpointParameters = Object.keys(regions).reduce((memo, region) => {
        const name = `/aws/service/global-infrastructure/services/${service}/regions/${region}/endpoint`;
        memo[name] = region;
        return memo;
    }, {});

    const names = Object.keys(endpointParameters);

    const result = await getParameters(names);

    return result.reduce((memo, { Name, Value }) => {
        const region = endpointParameters[Name];

        return Object.assign(memo, {
            [region]: Value,
        });
    }, {});
}

async function getServiceInfo() {
    const services = await getServices();

    const details = await Promise.all(services.map(async service => {
        const regions = await getServiceRegions(service);
        const endpoints = await getEndpoints(service, regions);
        
        return { service, endpoints };
    }));
 
    return details.reduce((memo, { service, endpoints }) => {
        memo[service] = { endpoints };
        return memo;
    }, {});
}

async function getRegionInfo() {
    const regions = await getRegions();

    const longNameParameters = regions.reduce((memo, region) => {
        const name = `/aws/service/global-infrastructure/regions/${region}/longName`;
        memo[name] = region;
        return memo;
    }, {});

    const names = Object.keys(longNameParameters);

    const result = await getParameters(names);

    return result.reduce((memo, { Name, Value }) => {
        const region = longNameParameters[Name];

        return Object.assign(memo, {
            [region]: { name: Value },
        });
    }, {});
}

async function get() {
    const services = await getServiceInfo();
    const regions = await getRegionInfo();

    return { services, regions };
}

fs.writeFileSync('./data.tmp.json', '');

get()
    .then(result => {
        fs.writeFileSync('./data.tmp.json', JSON.stringify(result, null, 2));
    })
    .catch(e => {
        console.error(e);
        process.exitCode = -1;
    });