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
     * @param {Object} customSettings
     * @return {Object} this
     * @public
     */

    var LS = function LS (customSettings) {
        var ls = {},
            self = this,
            settings,
            storageItem,
            currentDate = new Date().getTime(),
            promise;

        settings = Object.assign(
            {}, LS.defaultSettings, customSettings
        );

        settings.storageType =
            storageTypes[customSettings.storageType] ||
            LS.defaultSettings.storageType;

        storageItem = settings.storageType[settings.endpoint] ?
            JSON.parse(settings.storageType[settings.endpoint]) :
        {};

        this.getSettings = function () {
            return settings;
        };

        this.updateInstanceStorage = function (data) {
            storageItem = data;
        };

        /**
         * clear local storage and instance data with optional callback
         *
         * @param {Function} fn (response)
         * @return {Object} promise
         * @public
         */

        this.remove = function (fn) {
            var promise = new Promise(function (resolve, reject) {
                if (self.check()) {
                    storageItem = {};
                    settings.storageType.removeItem(settings.endpoint);

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
         * update local storage data with optional callback
         *
         * @param {Object} data
         * @param {Boolean} bool
         * @param {Function} fn (data)
         * @return {Object} promise
         * @public
         */

        this.update = function (data, bool, fn) {
            var promise = new Promise(function (resolve, reject) {
                if (self.check()) {

                    // return error if storageItem object isn't provided
                    if (!data) reject(new Error('No storageItem object provided'));

                    storageItem.data = data;
                    storageItem.endpoint = settings.endpoint;

                    // if user provides true for update dateCreated
                    if (bool && typeof bool === 'boolean') {
                        storageItem.dateCreated = new Date().getTime();
                    }

                    settings.storageType[settings.endpoint] = JSON.stringify(storageItem);

                    resolve(storageItem.data);
                } else {
                    resolve({
                        error: {
                            message: 'update error: ' + errorMessages.doesNotExist.message
                        }
                    })
                }
            });

            if (fn && typeof fn === 'function' || !fn && bool && typeof bool === 'function') {
                promise.then(function (data) {
                    fn(data);
                });
            }

            return promise;
        };

        promise = new Promise(function (resolve, reject) {
            if (settings.endpoint) {

                // if local storage exists return self
                if (self.check()) {

                    // remove expired storage
                    if (settings.expires !== undefined) {
                        if (currentDate > (storageItem.dateCreated + settings.expires)) {
                            self.remove();
                        }
                    }

                    resolve(self);
                }
            } else {
                reject(new Error('init error: ' + errorMessages.typeError.message));
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

    function updateLocalStorage (storageItem) {

    }

    /**
     * set local storage and instance data
     *
     * @param {Object} data
     * @param {Function} fn (response)
     * @return {Object} promise
     * @public
     */

    LS.prototype.set = function (data, fn) {

        var self = this,
            settings = self.getSettings(),
            storageItem = {},

            promise = new Promise(function (resolve, reject) {

                if (data && typeof data !== 'function') {
                    storageItem.endpoint = settings.endpoint;
                    storageItem.data = data;
                    storageItem.dateCreated = new Date().getTime();

                    settings.storageType[settings.endpoint] = JSON.stringify(storageItem);

                    self.updateInstanceStorage(storageItem);

                    resolve(storageItem.data);
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
     * @return {Object} promise
     * @public
     */

    LS.prototype.get = LS.prototype.find = function (fn) {

        var self = this,
            settings = self.getSettings(),
            storageItem,

            promise = new Promise(function (resolve, reject) {
                if (self.check()) {
                    storageItem = JSON.parse(settings.storageType[settings.endpoint]);

                    resolve(storageItem.data);
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
     * @return {Object} storageItem
     * @public
     */

    LS.prototype.$get = function () {
        var settings = this.getSettings(),
            storageItem = JSON.parse(settings.storageType[settings.endpoint]);

        if (this.check()) {
            return storageItem;
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
        var settings = this.getSettings();

        return settings.storageType[settings.endpoint] !== undefined;
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
