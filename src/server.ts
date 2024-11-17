import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import * as fs from 'fs';

const rawData = fs.readFileSync('data.json', 'utf-8');
const jsonData = JSON.parse(rawData);

const schema = buildSchema(`
  type Query {
    getPatients: [Patient]
  }

  type Patient {
    id: String
    name: String
    age: Int
    gender: String
    email: String
    phone: String
    address: String
    photoUrl: String
    mriUrl: String
    diagnosis: String
  }
`);

const root = {
  getPatients: () => jsonData.patients,
};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(4000, () => {
  console.log('Server běží na http://localhost:4000/graphql');
});