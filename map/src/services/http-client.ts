import axios from 'axios';

axios.defaults.headers.get['Accepts'] = 'application/json';
axios.defaults.headers.get['Content-Type'] = 'application/json, text/plain, */*';

const http = axios.create();

export { http };
