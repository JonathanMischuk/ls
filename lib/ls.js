(function (window) {
    'use strict';

    var storageTypes = {
        localStorage: window.localStorage,
        sessionStorage: window.sessionStorage
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
            storageType;

        // merge default settings with custom settings
        this.settings = Object.assign({}, LS.defaultSettings, settings);

        // configure storage object but make sure Storage isn't a property of LS
        storageType = storageTypes[this.settings.storageType] || storageTypes.localStorage;

        if (this.settings.endpoint) {

            // if local storage exists configure instance settings and properties accordingly
            if (storageType[this.settings.endpoint] !== undefined) {
                this.storageItem = JSON.parse(storageType[this.settings.endpoint]);

                // remove expired storage
                if (this.settings.expires !== undefined) {
                    if (currentDate > (this.storageItem.dateCreated + this.settings.expires)) {
                        this.remove();
                    }
                }

                return this;
            } else {
                return this;
            }
        } else {
            throw new Error('This constructor function requires a settings object');
        }
    };

    /**
     * LS default settings
     */

    LS.defaultSettings = {
        storageType: storageTypes.localStorage,
        endpoint: undefined,
        expires: undefined
    };

    /**
     * set local storage and instance data
     *
     * @param {Object} data
     * @return {this} for chaining
     * @public
     */

    LS.prototype.set = function (data) {

        // configure storage object
        var storageType = storageTypes[this.settings.storageType] || storageTypes.localStorage;

        if (data) {
            this.storageItem = {};
            this.storageItem.endpoint = this.settings.endpoint;
            this.storageItem.data = data;
            this.storageItem.dateCreated = this.storageItem.dateCreated || new Date().getTime();
            storageType[this.settings.endpoint] = JSON.stringify(this.storageItem);

            return this;
        } else {
            throw new Error('This function requires an object or array argument');
        }
    };

    /**
     * get local storage data and provide object to client with optional callback
     *
     * @param {Function} fn
     * @return {this} if no callback for chaining
     * @public
     */

    LS.prototype.get = LS.prototype.find = function (fn) {

        // configure storage object
        var storageType = storageTypes[this.settings.storageType] || storageTypes.localStorage;

        if (storageType[this.settings.endpoint] !== undefined) {
            this.storageItem = JSON.parse(storageType[this.settings.endpoint]);

            if (fn && typeof fn === 'function') {
                fn(this);
            } else {
                return this;
            }
        } else {
            throw new Error('Endpoint does not exist.');
        }
    };

    /**
     * explicitly clear local storage and instance data
     *
     * @return {this} for chaining
     * @public
     */

    LS.prototype.remove = LS.prototype.delete = function () {

        // configure storage object
        var storageType = storageTypes[this.settings.storageType] || storageTypes.localStorage;

        if (storageType[this.settings.endpoint] !== undefined) {
            storageType.removeItem(this.settings.endpoint);

            this.storageItem = {};

            return this;
        } else {
            throw new Error('No LS instances exist.');
        }
    };

    /**
     * explicitly update local storage data
     *
     * @return {this} for chaining
     * @public
     */

    LS.prototype.update = LS.prototype.save = function () {

        // configure storage object
        var storageType = storageTypes[this.settings.storageType] || storageTypes.localStorage;

        if (storageType[this.settings.endpoint] !== undefined && this.storageItem.endpoint) {
            storageType[this.settings.endpoint] = JSON.stringify(this.storageItem);

            return this;
        } else {
            throw new Error('No LS instances exist.');
        }
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
