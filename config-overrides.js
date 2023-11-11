 
const webpack = require('webpack'); 
module.exports = function override(config) { 
	const fallback = config.resolve.fallback || {}; 
	Object.assign(fallback, { 
    	"crypto": require.resolve("crypto-browserify"), 
        "assert": require.resolve("assert"), 
        "http": require.resolve("stream-http"), 
        "https": require.resolve("https-browserify"), 
    }) 
    config.resolve.fallback = fallback; 
    config.plugins = (config.plugins || []).concat([ 
        new webpack.ProvidePlugin({ 
            process: 'process/browser', 
        Buffer: ['buffer', 'Buffer'] 
        }) 
   ]) 
   return config; 
}