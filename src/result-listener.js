import openSocket from 'socket.io-client';
const socket_url = process.env.NODE_ENV === 'production' ? window.location.href : '';
const socket = openSocket.connect(socket_url);

function subscribeToResults(callback) {
  socket.on('results', results => callback(results));
  console.log("Connected to socket " + socket.id);
  return socket.id;
}

export { subscribeToResults }
