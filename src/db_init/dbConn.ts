import pgPromise from "pg-promise";
const postgresURL = process.env.MOBIGIC_SERVER_POSTGRES_URL!;

const options = {
  error: (connError: any, e: any) => {
    if (e.cn) {
      // A connection-related error;
      console.log("CN:", e.cn);
      console.log("EVENT:", connError.message);
    }
  },
};

const pg = pgPromise(options);
export const db = pg(postgresURL);
