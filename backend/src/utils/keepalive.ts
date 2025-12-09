export function setupKeepAlive(url: string) {
  // Ping every 14 minutes
  setInterval(async () => {
    try {
      await fetch(url + '/health');
      console.log('Keep-alive ping sent');
    } catch (err) {
      console.error('Keep-alive failed:', err);
    }
  }, 14 * 60 * 1000);
}