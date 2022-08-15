import { Connection, createConnection, getConnectionOptions } from "typeorm";

export default async (databaseTest = "fin_api_test"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOptions, {
      database:
        process.env.NODE_ENV === "test"
          ? databaseTest
          : "fin_api",
    })
  );
};
