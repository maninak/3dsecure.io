'use strict';

importScripts('/assets/vendor/sw-toolbox.min.js');

self.toolbox.options.cache = {
  name: '3dsecure.io-cache'
};

self.toolbox.router.default = self.toolbox.fastest;
