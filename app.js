let peer;

const init = async () => {
  const stream = document.getElementById('me').srcObject = await navigator.mediaDevices.getUserMedia({video: true});
  (peer = new SimplePeer({initiator: true, trickle: false, stream}))
    .on('signal', data => document.getElementById('send').value = JSON.stringify(data))
    .on('stream', stream => document.getElementById('them').srcObject = stream);
};

const start = () => init();
const connect = () => peer?.signal(JSON.parse(document.getElementById('receive').value || '{}'));