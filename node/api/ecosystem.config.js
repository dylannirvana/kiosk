module.exports = {
  apps : [{
    name         : "api",
    script       : "/data/project/NodeApp/node/api/index.js",
    watch        : true,
    autorestart  : true,
    instances    : 4,
    exec_mode    : "cluster",
    ignore_watch : ["media","var"]
  }]
}
