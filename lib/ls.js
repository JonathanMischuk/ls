(function (window) {
    'use strict';

    /**
     * LS: HTML5 Local Storage and Session Storage API library
     * Author: Jonathan Mischuk
     * Version: 1.1.0
     */

    var
    // reference container for all instances
        instances = {},

    // storage type references
        storageTypes = {
            localStorage: window.localStorage,
            sessionStorage: window.sessionStorage
        },

    // default instance settings
        defaultSettings = {
            storageType: 'localStorage',
            endpoint: undefined,
            expiry: undefined,
            initAs: undefined
        },

    // expiry time formats
        timeFormats = {
            seconds: 1000,
            minutes: 60000,
            hours: 3600000,
            days: 86400000
        },

    // error messages
        errorMessages = {
            storageDoesNotExist: {
                error: 'Storage does not exist'
            },
            doesNotExist: {
                error: 'Endpoint does not exist'
            },
            typeError: {
                error: 'Missing parameter, or incorrect parameter type'
            }
        };

    /**
     * main constructor: LS
     *
     * @param {Object} customSettings
     * @return {Object} this
     * @public
     */

    var LS = function LS (customSettings) {
        var self = this,
            settings, settingsCopy,
            storageItem,
            currentTime = new Date().getTime(),
            promise;

        // merge custom and default settings
        settings = Object.assign({}, defaultSettings, customSettings);

        // experimental: for retrieving instances via local storage
        // private storage that does not have public functionality
        settingsCopy = Object.assign({}, defaultSettings, customSettings);

        // configure storage object
        settings.storageType =
            storageTypes[customSettings.storageType] ||
            storageTypes[defaultSettings.storageType];

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

                    // remove instance from container
                    removeInstance(settings.endpoint);

                    resolve(self);
                } else {
                    resolve(errorMessages.doesNotExist);
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

                // set instance properties
                storageItem.data = data;
                storageItem.endpoint = settings.endpoint;
                storageItem.timestamp = new Date().getTime();

                // add instance to container
                addInstance();

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

        /**
         * get instance storage data (not from local storage)
         *
         * @return {Object} storageItem
         * @public
         */

        this.get = function () {
            if (!storageItem) return errorMessages.storageDoesNotExist;

            return storageItem;
        };

        promise = new Promise(function (resolve, reject) {
            var expiry, expiryLength, expiryFormat;

            if (settings.endpoint) {

                // if local storage exists
                if (self.check()) {

                    // add instance to container
                    addInstance();

                    // remove expired storage
                    if (settings.expiry !== undefined) {
                        expiryFormat =
                            timeFormats[settings.expiry.format] ||
                            timeFormats.days;

                        expiryLength = (settings.expiry.length || 1) * expiryFormat;
                        expiry = storageItem.timestamp + expiryLength;

                        if (currentTime > expiry) self.remove();
                    }
                } else {
                    if (settings.initAs) {
                        self.set(settings.initAs);
                    } else {

                        // if instances container is empty, remove instances local storage
                        if (isEmpty(instances)) {
                            storageTypes.localStorage.removeItem('instances');
                        }
                    }
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

        // experimental: for setting and retrieving instances via local storage
        // private storage that does not have public functionality
        //
        // behavioural function: add instance to container
        function addInstance () {
            var instance = {};

            // define instances object for local storage
            instance.settings = settingsCopy;
            instance.storageItem = storageItem;

            // add instance to object container
            instances[settings.endpoint] = instance;

            // set instances local storage
            storageTypes.localStorage.instances = JSON.stringify(instances);
        }

        // behavioural function: remove instance from container and remove
        // instances local storage if container is empty
        function removeInstance (endpoint) {
            delete instances[endpoint];

            // if instances container is empty, remove instances local storage
            if (isEmpty(instances)) {
                storageTypes.localStorage.removeItem('instances');
            } else {

                // set instances local storage with new value
                storageTypes.localStorage.instances = JSON.stringify(instances);
            }
        }
    };

    /**
     * get object containing all instances and their properties
     *
     * @public
     */

        // experimental: for setting and retrieving instances via local storage
        // private storage that does not have public functionality
    LS.getInstances = function () {
        if (storageTypes.localStorage.instances === undefined) {
            return { error: 'No instances exists' };
        }

        return JSON.parse(storageTypes.localStorage.instances);
    };

    // experimental: for setting and retrieving instances via local storage
    // private storage that does not have public functionality
    LS.getInstance = function (endpoint) {
        var instances = LS.getInstances();

        if (instances[endpoint]) return new LS(instances[endpoint].settings);

        return new LS({
            endpoint: endpoint,
            initAs: {
                message: 'An instance of ' + endpoint +
                ' does not exist, so we\'ve set one up for you'
            }
        });
    };

    /**
     * get local storage data and provide parsed
     * object to client as promise or argument to callback
     *
     * @param {Function} fn (data)
     * @return {Object} promise
     * @public
     */

    LS.prototype.$get = function (fn) {
        var self = this,
            settings = self.getSettings(),
            storageItem,

            promise = new Promise(function (resolve, reject) {
                if (self.check()) {
                    storageItem = JSON.parse(settings.storageType[settings.endpoint]);

                    resolve(storageItem);
                } else {
                    resolve(errorMessages.doesNotExist);
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

    // check if object has properties
    function isEmpty (obj) {
        return Object.keys(obj).length === 0;
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
