(function (window) {
    'use strict';

    /**
     * LS: HTML5 Local Storage and Session Storage API library
     * Author: Jonathan Mischuk
     * Version: 1.1.0
     */

    /**
     * main constructor: LS
     *
     * @param {Object} customSettings
     * @return {Object} this
     * @public
     */

    var LS = function LS (customSettings) {
        var self = this,
            settings,
            storageItem,
            currentDate = new Date().getTime(),
            promise;

        // merge custom and default settings
        settings = Object.assign({}, LS.defaultSettings, customSettings);

        // configure storage object
        settings.storageType =
            LS.storageTypes[customSettings.storageType] ||
            LS.defaultSettings.storageType;

        // assign storageItem value from Local Storage or initialize as empty object
        storageItem = settings.storageType[settings.endpoint] ?
            JSON.parse(settings.storageType[settings.endpoint]) :
        {};

        /**
         * get private instance settings
         *
         * @public
         */

        this.getSettings = function () {
            return settings;
        };

        /**
         * clear private instance and local storage data with optional callback
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
                    resolve(LS.errorMessages.doesNotExist);
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
         * set local storage and private instance data
         *
         * @param {Object} data
         * @param {Function} fn (data)
         * @return {Object} promise
         * @public
         */

        this.set = function (data, fn) {
            var promise = new Promise(function (resolve, reject) {

                // return error if storageItem object
                // isn't provided or it is incorrect type
                if (!data || data && typeof data === 'function') {
                    reject(new Error('Set error: No data object provided'));
                }

                // set all storageItem properties
                storageItem.data = data;
                storageItem.endpoint = settings.endpoint;
                storageItem.timestamp = new Date().getTime();

                // set localStorage
                settings.storageType[settings.endpoint] = JSON.stringify(storageItem);

                resolve(storageItem);
            });

            if (fn && typeof fn === 'function') {
                promise.then(function (data) {
                    fn(data);
                });
            }

            return promise;
        };

        promise = new Promise(function (resolve, reject) {
            var expiry, expiryLength, expiryFormat;

            if (settings.endpoint) {

                // add instance endpoint to reference array
                LS.instances.push(settings.endpoint);

                // if local storage exists
                if (self.check()) {

                    // remove expired storage
                    if (settings.expiry !== undefined) {
                        expiryFormat =
                            LS.timeFormats[settings.expiry.format] ||
                            LS.timeFormats.days;

                        expiryLength = (settings.expiry.length || 1) * expiryFormat;
                        expiry = storageItem.timestamp + expiryLength;

                        if (currentDate > expiry) self.remove();
                    }
                } else {
                    if (settings.initAs) self.set(settings.initAs);
                }

                resolve(self);
            } else {
                reject(new Error('init error: Missing parameter, or incorrect parameter type'));
            }
        });

        promise.then(function (instance) {
            return instance;
        });

        promise.catch(function (err) {
            return err;
        });
    };

    // reference container for all instances
    LS.instances = [];

    // storage type references
    LS.storageTypes = {
        localStorage: window.localStorage,
        sessionStorage: window.sessionStorage
    };

    // default instance settings
    LS.defaultSettings = {
        storageType: LS.storageTypes.localStorage,
        endpoint: undefined,
        expiry: undefined,
        initAs: undefined
    };

    // expiry time formats
    LS.timeFormats = {
        seconds: 1000,
        minutes: 60000,
        hours: 3600000,
        days: 86400000
    };

    // error messages
    LS.errorMessages = {
        doesNotExist: {
            error: 'Endpoint does not exist'
        },
        typeError: {
            error: 'Missing parameter, or incorrect parameter type'
        }
    };

    /**
     * get array containing instance endpoints
     *
     * @public
     */

    LS.getInstances = function () {
        return LS.instances;
    };

    /**
     * get local storage data and provide object to client with optional callback
     *
     * @param {Function} fn (data)
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

                    resolve(storageItem);
                } else {
                    resolve(LS.errorMessages.doesNotExist);
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
     * check if local storage exists
     *
     * @return {Boolean}
     * @public
     */

    LS.prototype.check = function () {
        var settings = this.getSettings();

        return settings.storageType[settings.endpoint] !== undefined;
    };

    /**
     * check if local storage data property exists
     *
     * @return {Boolean}
     * @public
     */

    LS.prototype.checkData = function () {
        var settings = this.getSettings(),
            storageItem;

        if (this.check()) {
            storageItem = JSON.parse(settings.storageType[settings.endpoint]);

            return storageItem.data !== undefined;
        }

        return false;
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
