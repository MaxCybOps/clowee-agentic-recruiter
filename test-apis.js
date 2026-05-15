const axios = require('axios');

async function testAPIs() {
  console.log('Testing Chat API...');
  try {
    const chatRes = await axios.post('http://localhost:3001/api/chat', {
      messages: [{ role: 'user', content: 'Hello Clowee!' }]
    });
    console.log('Chat API Success:', chatRes.data);
  } catch (e) {
    console.error('Chat API Failed (Make sure .env.local is filled):', e.message);
  }

  console.log('\nTesting Voice API...');
  try {
    const voiceRes = await axios.post('http://localhost:3001/api/voice', {
      text: 'Hello world',
      voiceId: '21mOQcygkY7TYh8jt7oo'
    });
    console.log('Voice API Success! Received buffer of length:', voiceRes.data.length);
  } catch (e) {
    console.error('Voice API Failed (Make sure .env.local is filled):', e.message);
  }
}

testAPIs();
