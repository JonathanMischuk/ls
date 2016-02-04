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
     * @return {this} for chaining
     * @public
     */

    var LS = function LS (settings) {
        var currentDate = new Date().getTime(),
            self = this,
            mergedSettings,

            promise = new Promise(function (resolve, reject) {

                // merge default settings with custom settings
                mergedSettings = LS.mergedSettings = Object.assign({}, LS.defaultSettings, settings);

                if (mergedSettings.endpoint) {

                    // if local storage exists configure instance settings and properties accordingly
                    if (self.check()) {
                        LS.storageItem = self.get().storageItem;

                        // remove expired storage
                        if (mergedSettings.expires !== undefined) {
                            if (currentDate > (LS.storageItem.dateCreated + mergedSettings.expires)) {
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

    // LS default settings
    LS.defaultSettings = {
        storageType: storageTypes.localStorage,
        endpoint: undefined,
        expires: undefined
    };

    // LS merged settings
    LS.mergedSettings = {};
    
    LS.storageItem = {};

    /**
     * set local storage and instance data
     *
     * @param {Object} data
     * @param {Function} fn (err, instance, data)
     * @return {this} for chaining
     * @public
     */

    LS.prototype.set = function (data, fn) {

        // configure storage object
        var storageType = getStorageType.call(this),

            promise = new Promise(function (resolve, reject) {
                if (data && typeof data !== 'function') {
                    LS.storageItem.endpoint = LS.mergedSettings.endpoint;
                    LS.storageItem.data = data;
                    LS.storageItem.dateCreated = new Date().getTime();

                    storageType[LS.mergedSettings.endpoint] = JSON.stringify(LS.storageItem);

                    resolve(LS.storageItem.data);
                } else {
                    reject(Error('set error: ' + errorMessages.typeError.message));
                }
            });

        if (fn && typeof fn === 'function') {
            promise.then(function (data) {
                fn(data);
            });
        }

        return promise;
    };

    /**
     * get local storage data and provide object to client with optional asynchronous callback
     *
     * @param {Function} fn (instance)
     * @return {this} if no callback for chaining
     * @public
     */

    LS.prototype.get = LS.prototype.find = function (fn) {

        // configure storage object
        var storageType = getStorageType.call(this),
            self = this,

            promise = new Promise(function (resolve, reject) {
                if (self.check()) {
                    LS.storageItem = JSON.parse(storageType[LS.mergedSettings.endpoint]);

                    resolve(LS.storageItem.data);
                } else {
                    resolve({
                        error: {
                            message: 'get error: ' + errorMessages.doesNotExist.message
                        }
                    })
                }
            });

        if (fn && typeof fn === 'function') {
            promise.then(function (data) {
                fn(data);
            });
        }

        return promise;
    };

    /**
     * check if local storage data exists
     *
     * @param {Function} fn (err, instance, data)
     * @return {Boolean}
     * @public
     */

    LS.prototype.check = function () {

        // configure storage object
        var storageType = getStorageType.call(this);

        return storageType[LS.mergedSettings.endpoint] !== undefined;
    };

    /**
     * explicitly clear local storage and instance data
     *
     * @param {Function} fn (err, instance)
     * @return {this} for chaining
     * @public
     */

    LS.prototype.remove = LS.prototype.delete = function (fn) {

        // configure storage object
        var storageType = getStorageType.call(this),
            self = this,

            promise = new Promise(function (resolve, reject) {
                if (self.check()) {

                    // remove local storage
                    storageType.removeItem(LS.mergedSettings.endpoint);

                    LS.storageItem = {};

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
            promise.then(function (data) {
                fn(data);
            });
        }

        return promise;

    };

    /**
     * explicitly update local storage data
     *
     * @param {Boolean} bool
     * @return {this} for chaining
     * @public
     */

    LS.prototype.update = LS.prototype.save = function (fn, bool) {

        // configure storage object
        var storageType = getStorageType.call(this),
            self = this,

            promise = new Promise(function (resolve, reject) {
                if (self.check() && LS.storageItem.endpoint) {

                    // if user provides true for update dateCreated
                    if (fn && bool && typeof bool === 'boolean' || !bool && fn && typeof fn === 'boolean') {
                        LS.storageItem.dateCreated = new Date().getTime();
                    }

                    storageType[LS.mergedSettings.endpoint] = JSON.stringify(LS.storageItem);

                    resolve(LS.storageItem.data);
                } else {
                    reject(Error('update error: ' + errorMessages.doesNotExist.message));
                }
            });

        if (fn && typeof fn === 'function') {
            promise.then(function (data) {
                fn(data);
            });
        }

        return promise;
    };

    /**
     * gets instance storage type (localStorage || sessionStorage)
     *
     * @return {Boolean}
     * @private
     */

    function getStorageType () {
        return storageTypes[LS.mergedSettings.storageType] || LS.defaultSettings.storageType;
    }

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
