let peer;

const init = async (initiator) => {
  const stream = document.getElementById('me').srcObject = await navigator.mediaDevices.getUserMedia({video: true});
  (peer = new SimplePeer({initiator, trickle: false, stream}))
    .on('signal', data => document.getElementById('send').value = JSON.stringify(data))
    .on('stream', stream => document.getElementById('them').srcObject = stream);
};

const start = () => init(true), join = () => init(false);
const connect = () => peer?.signal(JSON.parse(document.getElementById('receive').value || '{}'));