document.addEventListener('DOMContentLoaded', e => {
  if('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/niklas-luhmann-bibliography/sw.js', { scope: '/niklas-luhmann-bibliography/' })
      .catch(error => {
        console.log('Registration failed with', error);
      });
  }
});