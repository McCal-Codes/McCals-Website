// McCal API Dashboard Widget for Squarespace
(function() {
  var healthDiv = document.getElementById('api-health');
  var cacheDiv = document.getElementById('api-cache');
  if (!healthDiv || !cacheDiv) return;

  fetch('https://api.mcc-cal.com/api/v1/health')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      healthDiv.textContent = data.status + ' (' + data.timestamp + ')';
      cacheDiv.textContent =
        'Hits: ' + data.cache.hits +
        ', Misses: ' + data.cache.misses +
        ', Hit Rate: ' + data.cache.hitRate;
    })
    .catch(function() {
      healthDiv.textContent = 'API error';
      cacheDiv.textContent = 'API error';
    });
})();
