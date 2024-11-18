import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import * as fs from 'fs';
import cors from 'cors';

const rawData = fs.readFileSync('data.json', 'utf-8');
const jsonData = JSON.parse(rawData);

const schema = buildSchema(`
  type Query {
    getPatients: [Patient]
    searchPatientByName(name: String!): [Patient]
    searchPatientById(id: String!): Patient
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

  type Mutation {
    updateDiagnosis(id: String!, diagnosis: String!): Patient
    deletePatient(id: String!): String
  }
`);

const root = {
  getPatients: () => jsonData.patients,
  
  searchPatientByName: ({ name }: { name: string }) =>
    jsonData.patients.filter((patient: any) =>
      patient.name.toLowerCase().includes(name.toLowerCase())
    ),
  
  searchPatientById: ({ id }: { id: string }) => 
    jsonData.patients.find((patient: any) => patient.id === id),

  updateDiagnosis: ({ id, diagnosis }: { id: string; diagnosis: string }) => {
    const patient = jsonData.patients.find((p: any) => p.id === id);
    if (!patient) {
      throw new Error(`Pacient s ID ${id} nebyl nalezen.`);
    }
    patient.diagnosis = diagnosis;

    fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2), 'utf-8');
    return patient;
  },

  deletePatient: ({ id }: { id: string }) => {
    const index = jsonData.patients.findIndex((p: any) => p.id === id);
    if (index === -1) {
      throw new Error(`Pacient s ID ${id} nebyl nalezen.`);
    }

    jsonData.patients.splice(index, 1);

    fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2), 'utf-8');
    return `Pacient s ID ${id} byl úspěšně smazán.`;
  },
};

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(4000, () => {
  console.log('Server běží na http://localhost:4000/graphql');
});