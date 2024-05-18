const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());

// Проксируем запросы к Google Places API
app.get('/places', async (req, res) => {
  try {
    const { location, radius, type } = req.query;
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        key: 'AIzaSyD8hUY4LnkAAuHzziLC9epiSBxX6CQ1Myo',
        location,
        radius,
        type,
      },
    });
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server is listening at http://localhost:${port}`);
});
