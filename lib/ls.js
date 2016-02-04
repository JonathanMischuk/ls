(function (window) {
    'use strict';

    var storageTypes = {
        localStorage: window.localStorage,
        sessionStorage: window.sessionStorage
    };

    // LS error messages
    var errorMessages = {
        doesNotExist: {
            message: 'Endpoint does not exist'
        },
        typeError: {
            message: 'Function is missing a parameter, or first parameter type incorrect'
        }
    };

    /**
     * main constructor
     *
     * @param {Object} settings
     * @return {this}
     * @public
     */

    var LS = function LS (settings) {
        var currentDate = new Date().getTime(),
            self = this,

            promise = new Promise(function (resolve, reject) {

                // merge default settings with custom settings
                self.settings = Object.assign(
                    {}, LS.defaultSettings, settings
                );

                // configure storage type
                self.settings.storageType =
                    storageTypes[self.settings.storageType] ||
                    LS.defaultSettings.storageType;

                if (self.settings.endpoint) {

                    // if local storage exists return self
                    if (self.check()) {

                        // remove expired storage
                        if (self.settings.expires !== undefined) {
                            if (currentDate > (this.storageItem.dateCreated + self.settings.expires)) {
                                self.remove();
                            }
                        }

                        resolve(self);
                    }
                } else {
                    reject(Error('init error: ' + errorMessages.typeError.message));
                }
            });

        promise.then(function (instance) {
            return instance;
        });

        promise.catch(function (err) {
            return err;
        });
    };

    // instance properties
    LS.defaultSettings = {
        storageType: storageTypes.localStorage,
        endpoint: undefined,
        expires: undefined
    };

    /**
     * set local storage and instance data
     *
     * @param {Object} data
     * @param {Function} fn (response)
     * @return {promise}
     * @public
     */

    LS.prototype.set = function (data, fn) {

        var self = this,
            promise = new Promise(function (resolve, reject) {
                if (data && typeof data !== 'function') {
                    self.storageItem = {};
                    self.storageItem.endpoint = self.settings.endpoint;
                    self.storageItem.data = data;
                    self.storageItem.dateCreated = new Date().getTime();

                    self.settings.storageType[self.settings.endpoint] = JSON.stringify(self.storageItem);

                    resolve(self.storageItem.data);
                } else {
                    reject(Error('set error: ' + errorMessages.typeError.message));
                }
            });

        if (fn && typeof fn === 'function') {
            promise.then(function (response) {
                fn(response);
            });
        }

        return promise;
    };

    /**
     * get local storage data and provide object to client with optional callback
     *
     * @param {Function} fn (response)
     * @return {promise}
     * @public
     */

    LS.prototype.get = LS.prototype.find = function (fn) {

        var self = this,
            promise = new Promise(function (resolve, reject) {
                if (self.check()) {
                    self.storageItem = JSON.parse(self.settings.storageType[self.settings.endpoint]);

                    resolve(self.storageItem.data);
                } else {
                    resolve({
                        error: {
                            message: 'get error: ' + errorMessages.doesNotExist.message
                        }
                    })
                }
            });

        if (fn && typeof fn === 'function') {
            promise.then(function (response) {
                fn(response);
            });
        }

        return promise;
    };

    /**
     * convenience function
     * get local storage data and provide object to client
     *
     * @return {Object}
     * @public
     */

    LS.prototype.$get = function () {
        var storageItem = JSON.parse(this.settings.storageType[this.settings.endpoint]);

        if (this.check()) {
            return storageItem.data;
        } else {
            return {
                error: {
                    message: 'get error: ' + errorMessages.doesNotExist.message
                }
            };
        }
    };

    /**
     * check if local storage data exists
     *
     * @return {Boolean}
     * @public
     */

    LS.prototype.check = function () {
        return this.settings.storageType[this.settings.endpoint] !== undefined;
    };

    /**
     * clear local storage and instance data with optional callback
     *
     * @param {Function} fn (response)
     * @return {promise}
     * @public
     */

    LS.prototype.remove = LS.prototype.delete = function (fn) {

        var self = this,
            promise = new Promise(function (resolve, reject) {
                if (self.check()) {

                    // remove local storage
                    self.settings.storageType.removeItem(self.settings.endpoint);

                    self.storageItem = {};

                    resolve(self);
                } else {
                    resolve({
                        error: {
                            message: 'remove error: ' + errorMessages.doesNotExist.message
                        }
                    });
                }
            });

        if (fn && typeof fn === 'function') {
            promise.then(function (response) {
                fn(response);
            });
        }

        return promise;
    };

    /**
     * update local storage data with optional callback
     *
     * @param {Function} fn (response)
     * @param {Boolean} bool
     * @return {promise}
     * @public
     */

    LS.prototype.update = LS.prototype.save = function (fn, bool) {

        var self = this,
            promise = new Promise(function (resolve, reject) {
                if (self.check() && self.storageItem.endpoint) {

                    // if user provides true for update dateCreated
                    if (fn && bool && typeof bool === 'boolean' || !bool && fn && typeof fn === 'boolean') {
                        self.storageItem.dateCreated = new Date().getTime();
                    }

                    self.settings.storageType[self.settings.endpoint] = JSON.stringify(self.storageItem);

                    resolve(self.storageItem.data);
                } else {
                    reject(Error('update error: ' + errorMessages.doesNotExist.message));
                }
            });

        if (fn && typeof fn === 'function') {
            promise.then(function (response) {
                fn(response);
            });
        }

        return promise;
    };

    // Object.assign shim
    if (typeof Object.assign != 'function') {
        (function () {
            Object.assign = function (target) {
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var output = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];

                    if (source !== undefined && source !== null) {
                        for (var nextKey in source) {
                            if (source.hasOwnProperty(nextKey)) {
                                output[nextKey] = source[nextKey];
                            }
                        }
                    }
                }

                return output;
            };
        })();
    }

    // globalize LS object/constructor
    window.LS = LS;

})(window);
