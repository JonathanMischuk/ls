# LS - HTML5 Local Storage / Session Storage API

A promise and callback based library.

Supports all data types.

A modular version is in the works.
 
## Usage

Add `<script src="ls-v.1.0.1.js"></script>` to your page.

### Initialize LS instance

Call `new LS(settings)` - `settings` is an object. The `endpoint` property must be set.

```javascript
var ls = new LS({
    storageType: 'localStorage'
    endpoint: 'StorageName'
    expiry: {
        length: 1,
        format: 'days'
    },
    initAs: [{ something: 'Orange' }]
});
```

#### Settings:

* __storageType__: String (optional) | `'localStorage'` or `'sessionStorage'` | default `'localStorage'`
* __endpoint__: String (mandatory) | `'example'`, `'somethingImportant'` | default `undefined`
* __expiry__: Object (optional) | default `undefined`
  * __length__: Number (optional) | default `1`
  * __format__: String (optional) | `'seconds'`, `'minutes'`, `'hours'`, `'days'` | default `'days'`  
* __initAs__: Array / Object / String / Number | `[{ somethings: 'Orange' }, 5, 'Apple']` | default `undefined`

### Methods

```javascript
LS.set()
LS.remove()
LS.getSettings()

LS.prototype.check()
LS.prototype.get() | LS.prototype.find()
```

### Set instance and Local Storage data 

* Returns a promise with storage data or Error object as value
* Has optional callback function with response parameter

```javascript
something = {
    title: 'Something',
    content: 'This is some content',
    somethingElse: 'Something else'
};

ls.set(something);

// with callback function
ls.set(something, function (res) {
    console.log(res);    
});

// as promise
ls.set(something).then(function (res) {
    console.log(res);
});
```

### Get instance and Local Storage data

* Returns a promise with storageItem object as value or error object
* Has optional callback function with storage data parameter

```javascript
// with callback function
ls.get(function (res) {
    if (res.error) return console.log(res.error);    
    
    res.data.title = 'Something Else';
    ls.set(res.data);
});

// as promise
ls.get().then(function (res) {
    res.data.title = 'Something Else'; 
    return res;
}).then(function (res) {
    res.data.content = 'Some more content';
    ls.set(res.data);
});
```

#### returned storageItem object

The main data containment object has the following output:

```javascript
storageItem = {
    endpoint: String,
    timestamp: Number,
    data: Object|Array|String|Number|Boolean
}
```

`storageItem.data` contains the user defined value of the storage instance.
In the above get call `res.data` contains the user defined storage value.
    
### Remove Local Storage from browser

* Returns a promise with 'this' as value, or error object
* Has optional callback function with 'this' as value, or error object

```javascript
ls.remove();

// with callback function
ls.remove(function (res) {
    console.log(res);
});

// as promise
ls.remove().then(function (res) {
    console.log(res);
});
```

### Check if Local Storage data exists

Returns Boolean value

```javascript    
ls.check();
// false

ls.set(something);

ls.check();
// true
```

## Comments

Please let me know if you experience any issues so they can be fixed up.

## Author

The original author of LS is Jonathan Mischuk
