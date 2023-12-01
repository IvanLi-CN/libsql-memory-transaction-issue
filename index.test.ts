import { createClient } from "@libsql/client";
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { expect, suite, test } from "vitest";

  test("memory + transaction", async () => {
    const client = createClient({
      url: ":memory:",
    });

    const sqlText = `
CREATE TABLE subscriptions (
	id text PRIMARY KEY NOT NULL,
	name text NOT NULL,
	url text NOT NULL,
	updated_at integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	created_at integer DEFAULT (strftime('%s', 'now')) NOT NULL
);`;

    const libsqlTx = await client.transaction();
    try {
      await libsqlTx.executeMultiple(sqlText);
      await libsqlTx.commit();
    } catch (err) {
      await libsqlTx.rollback();
      throw err;
    }

    const tables = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`,
    );

    expect(tables.rows).toEqual([
      {
        name: "subscriptions",
      },
    ]);
  });

  test("memory", async () => {
    const client = createClient({
      url: ":memory:",
    });

    const sqlText = `
CREATE TABLE subscriptions (
	id text PRIMARY KEY NOT NULL,
	name text NOT NULL,
	url text NOT NULL,
	updated_at integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	created_at integer DEFAULT (strftime('%s', 'now')) NOT NULL
);`;

    await client.executeMultiple(sqlText);
    const tables = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`,
    );

    expect(tables.rows).toEqual([
      {
        name: "subscriptions",
      },
    ]);
  });

  test("file + transaction", async () => {
    const dbUrl = new URL("local.db", import.meta.url);
    if (existsSync(dbUrl)) {
      await unlink(dbUrl)
    }

    const client = createClient({
      url: dbUrl.toString(),
    });

    const sqlText = `
CREATE TABLE subscriptions (
	id text PRIMARY KEY NOT NULL,
	name text NOT NULL,
	url text NOT NULL,
	updated_at integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	created_at integer DEFAULT (strftime('%s', 'now')) NOT NULL
);`;

    const libsqlTx = await client.transaction();
    try {
      await libsqlTx.executeMultiple(sqlText);
      await libsqlTx.commit();
    } catch (err) {
      await libsqlTx.rollback();
      throw err;
    }

    const tables = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`,
    );

    expect(tables.rows).toEqual([
      {
        name: "subscriptions",
      },
    ]);
  });
