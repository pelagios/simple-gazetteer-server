import express from 'express';
import { keywordSearch } from './es/search';

//Create an app
const app = express();

app.use(express.json());

app.set('json spaces', 2);

app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.get('/api/search', (req, res) => {
  const { q, countries } = req.query;

  const queryOpts = {
    size:200,
    countries: countries?.split(',').map(str => str.trim())
  }
  
  keywordSearch(q, queryOpts).then(result => res.json(result));
});

//Listen port
const PORT = 8080;
app.listen(PORT);

console.log(`API running on port ${PORT}`);