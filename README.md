# LS - A simple HTML5 Local Storage / Session Storage API

A promise and callback based library.

Supports objects, arrays, strings and numbers.

A modular version is in the works.
 
## Usage

Add `<script src="ls-v.1.0.1.js"></script>` to your page.

### Initialize LS instance

Call `new LS(settings)` - `settings` is an object. The `endpoint` property must be set.

```javascript
var ls = new LS({
    storageType: 'localStorage' || 'sessionStorage' // String | optional | default 'localStorage'
    endpoint: '/api/pages'                          // String | mandatory | default undefined
    expires: 50000                                  // Number | optional | milliseconds | default undefined
});
```

### Methods

```javascript
LS.prototype.set()
LS.prototype.check()
LS.prototype.get() | LS.prototype.find()
LS.prototype.update() | LS.prototype.save()
LS.prototype.remove() | LS.prototype.delete()
```

### Set instance and Local Storage data 

* Returns a promise with storage data as value or error object
* Has optional callback function with response parameter

```javascript
something = {
    title: 'Something',
    content: 'This is some content',
    somethingElse: 'Something else'
};

ls.set(something);

// with callback
ls.set(something, function (response) {
    console.log(response);    
});

// using promise
ls.set(something).then(function (response) {
    console.log(response);
});
```

### Get instance and Local Storage data

* Returns a promise with storage data as value or error object
* Has optional callback function with storage data parameter

```javascript
ls.get(function (response) {
    response.title = 'Something Else';
    ls.update();
});

// or

ls.get().then(function (response) {
    response.title = 'Something Else';
    ls.update();
});
```

Convenience version - only retrieves storage data

```javascript
var storage = ls.$get();
```

### Update instance and Local Storage data

* Returns a promise with storage data as value or error object
* Has optional callback function with storage data parameter

```javascript
ls.get(function (response) {
    response.title = 'Something Completely Different';
    
    ls.update();
    
    // updates dateCreated timestamp (useful for storage with expiry)
    ls.update(true);
    
    // with callback function
    ls.update(true, function (response) {
        console.log(response);
    });
    
    // as promise
    ls.update(true).then(function (response) {
        console.log(response);
    });    
});
```
    
### Remove Local Storage from browser

* Returns a promise with 'this' as value, or error object
* Has optional callback function with 'this' as value, or error object

```javascript
ls.remove();

// with callback function
ls.remove(function (response) {
    console.log(response);
});

// as promise
ls.remove().then(function (response) {
    console.log(response);
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

### returned storageItem object

The main data containment object has the following output:

```javascript
storageItem = {
    endpoint: String,
    dateCreated: Number,
    data: Object|Array|String|Number
}
```

## Comments

Please let me know if you experience any issues so they can be fixed up.

## Author

The original author of LS is Jonathan Mischuk
