declare module "better-sqlite3" {
  class Database {
    constructor(filename: string);
    exec(sql: string): this;
    prepare(sql: string): {
      run: (...params: unknown[]) => { lastInsertRowid: number | bigint };
      get: (...params: unknown[]) => unknown;
      all: (...params: unknown[]) => unknown[];
    };
  }

  export default Database;
}
