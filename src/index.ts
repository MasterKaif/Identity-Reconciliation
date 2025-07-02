import express from 'express';
import dotenv from 'dotenv';
import identifyRoute from './routes/IdentifyRoute';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello, TypeScript Backend!');
});


app.use('/identify', identifyRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import { sequelize } from './config/db'; // adjust path as needed

(async () => {
  await sequelize.sync(); // or { force: true } for development only
  // Start your server here
})();