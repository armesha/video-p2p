let peer;

async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({video: true});
  document.getElementById('me').srcObject = stream;
  
  peer = new SimplePeer({initiator: true, trickle: false, stream});
  peer.on('signal', data => document.getElementById('send').value = JSON.stringify(data));
  peer.on('stream', stream => document.getElementById('them').srcObject = stream);
}

async function join() {
  const stream = await navigator.mediaDevices.getUserMedia({video: true});
  document.getElementById('me').srcObject = stream;
  
  peer = new SimplePeer({trickle: false, stream});
  peer.on('signal', data => document.getElementById('send').value = JSON.stringify(data));
  peer.on('stream', stream => document.getElementById('them').srcObject = stream);
}

function connect() {
  if (!peer) return;
  try {
    const data = JSON.parse(document.getElementById('receive').value);
    peer.signal(data);
  } catch(e) {}
}