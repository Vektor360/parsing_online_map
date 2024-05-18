axios.get('http://localhost:3000/places', {
  params: {
    location: '43.1222,131.9192',
    radius: '50000',
    type: 'cafe'
  }
})
.then(response => {
  console.log(response.data); // Обработка ответа
})
.catch(error => {
  console.error('Error:', error);
});
