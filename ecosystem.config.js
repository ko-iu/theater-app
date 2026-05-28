module.exports = {
  apps: [{
    name: 'theatre-backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork'
  }]
};
