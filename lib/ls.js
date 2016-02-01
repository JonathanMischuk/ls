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
     * @return {this}
     * @public
     */

    var LS = function LS (settings) {
        var currentDate = new Date().getTime();

        // merge default settings with custom settings
        this.settings = Object.assign({}, LS.defaultSettings, settings);

        // configure storage type
        this.settings.storageType = storageTypes[this.settings.storageType] || storageTypes.localStorage;

        if (this.settings.endpoint) {

            // if local storage exists configure instance settings and properties accordingly
            if (this.settings.storageType[this.settings.endpoint] !== undefined) {
                this.storageItem = JSON.parse(this.settings.storageType[this.settings.endpoint]);

                // remove expired storage
                if (this.settings.expires !== undefined) {
                    if (currentDate > (this.storageItem.dateCreated + this.settings.expires)) {
                        this.remove();
                    }
                }

                return this;

            // if local storage doesn't exist get storageItem object ready to be set
            } else {
                this.storageItem = {};
                this.storageItem.dateCreated = new Date().getTime();

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
        endpoint: '',
        expires: undefined
    };

    LS.getStatic = function () {
        var ls = Object.create(LS.prototype);
        LS.call(ls);
    };

    /**
     * get local storage data and provide object to client with optional callback
     *
     * @param {Object} data
     * @return {this}
     * @public
     */

    LS.prototype.set = function (data) {
        if (data) {
            this.storageItem.endpoint = this.settings.endpoint;
            this.storageItem.data = data;
            this.storageItem.dateCreated = this.storageItem.dateCreated || new Date().getTime();
            this.settings.storageType[this.settings.endpoint] = JSON.stringify(this.storageItem);

            return this;
        } else {
            throw new Error('This function requires an object or array argument');
        }
    };

    /**
     * get local storage data and provide object to client with optional callback
     *
     * @param {Function} fn
     * @return {this}
     * @public
     */

    LS.prototype.get = LS.prototype.find = function (fn) {
        if (this.settings.storageType[this.settings.endpoint] !== undefined) {
            this.storageItem = JSON.parse(this.settings.storageType[this.settings.endpoint]);

            if (fn) {
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
     * @return {this}
     * @public
     */

    LS.prototype.remove = LS.prototype.delete = function () {
        if (this.settings.storageType[this.settings.endpoint] !== undefined) {
            this.settings.storageType.removeItem(this.settings.endpoint);

            this.storageItem = {};

            return this;
        } else {
            throw new Error('No LS instances exist.');
        }
    };

    /**
     * explicitly update local storage data
     *
     * @return {this}
     * @public
     */

    LS.prototype.update = LS.prototype.save = function () {
        if (this.settings.storageType[this.settings.endpoint] !== undefined && this.storageItem.endpoint) {
            this.settings.storageType[this.settings.endpoint] = JSON.stringify(this.storageItem);

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

    // globalize LS constructor
    window.LS = LS;

})(window);
