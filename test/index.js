'use strict';

const test = require('ava');

const info = require('..');

test('endpoint() throws on unknown service', t => {
    t.throws(() => info.endpoint('unknown', 'us-east-1'));
});

test('endpoint() throws on unknown region', t => {
    t.throws(() => info.endpoint('s3', 'low-earth-orbit'));
});

test('endpoint() service is case-insensitive', t => {
    t.deepEqual(info.endpoint('s3', 'us-east-1'), info.endpoint('S3', 'us-east-1'));
});

test('endpoint() region is case-insensitive', t => {
    t.deepEqual(info.endpoint('s3', 'US-east-1'), info.endpoint('S3', 'US-EAST-1'));
});

test('regionName() throws on unknown service', t => {
    t.throws(() => info.regionName('unknown'), 'aws-info: unknown is not a known region short name');
});

test('regionName() region is case-insensitive', t => {
    t.deepEqual(info.regionName('US-EAST-1'), info.regionName('us-east-1'));
});