import knex from 'knex';
import type { Knex } from 'knex';

let db: Knex<any, unknown[]> = null;

function init(): void {
    db = knex({
        client: process.env.DB_CLIENT || 'mysql',
        connection: {
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_DATABASE || 'main',
            charset: process.env.DB_CHARSET || 'utf8'
        }
    });
}

export {
    db,
    init
};