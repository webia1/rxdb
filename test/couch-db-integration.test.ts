/**
 * this test checks the integration with couchdb
 * run 'npm run test:couchdb' to use it
 * You need a running couchdb-instance on port 5984
 * Run 'npm run couch:start' to spawn a docker-container
 */
import assert from 'assert';
import { waitUntil } from 'async-test-util';

import {
    addRxPlugin,
    randomCouchString
} from '../';
addRxPlugin(require('pouchdb-adapter-memory'));
addRxPlugin(require('pouchdb-adapter-http'));
import request from 'request-promise-native';

import * as humansCollection from './helper/humans-collection';
import * as schemaObjects from './helper/schema-objects';

describe('couchdb-db-integration.test.js', () => {
    const COUCHDB_URL = 'http://127.0.0.1:5984/';

    it('reach couchdb server', async function () {
        /**
         * After the couchdb container is started,
         * it can take some time until the replication endpoint is reachable
         */
        this.timeout(1000 * 60);

        await waitUntil(async () => {
            try {
                const gotJson = await request(COUCHDB_URL);
                // ensure json is parseable
                JSON.parse(gotJson);
                return true;
            } catch (err) {
                console.log('could not reach couchdb server at ' + COUCHDB_URL);
                return false;
            }
        }, 1000 * 60, 1000);
    });

    it('sync to couchdb', async () => {
        const col = await humansCollection.create(0);

        const couchName = COUCHDB_URL + randomCouchString(12);
        console.log(couchName);
        const replicationState = await col.sync({
            remote: couchName,
            waitForLeadership: false,
            direction: {
                pull: true,
                push: true
            }
        });
        replicationState.docs$.subscribe(docData => console.dir(docData));

        // add 3 docs
        await Promise.all(
            new Array(3)
                .fill(0)
                .map(() => col.insert(schemaObjects.human()))
        );
        const docs1 = await col.find().exec();
        assert.strictEqual(docs1.length, 3);


        // create a new collection
        const col2 = await humansCollection.create(0);
        await col2.sync({
            remote: couchName,
            waitForLeadership: false,
            direction: {
                pull: true,
                push: true
            }
        });

        await waitUntil(async () => {
            const docs = await col2.find().exec();
            return docs.length === 3;
        });

        col.database.destroy();
        col2.database.destroy();
    });
});
