# LS - A simple HTML5 Local Storage / Session Storage API

Supports objects, arrays, strings and numbers.

A modular version is in the works.
 
## Usage

Add `<script src="ls.js"></script>` to your page.

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

### Create instance and set Local Storage data

```javascript
var ls = new LS({
        storageType: 'localStorage'
        endpoint: '/api/pages'
        expires: 50000
    }),
    something = {
        title: 'Something',
        content: 'This is some content',
        somethingElse: 'Something else'
    };

ls.set(something);
```

### Update instance and Local Storage data

```javascript
var ls = new LS({
        storageType: 'localStorage'
        endpoint: '/api/pages'
        expires: 50000
    }),
    something = {
        title: 'Something',
        content: 'This is some content',
        somethingElse: 'Something else'
    };

ls.set(something);

ls.storageItem.data = {};

ls.update();
// ls.storageItem.data === {}

ls.update(true);
// updates dateCreated timestamp (useful for storage with expiry)
```

### Get instance and Local Storage data

Callback function is optional.

```javascript
var ls = new LS({
        storageType: 'localStorage'
        endpoint: '/api/pages'
        expires: 50000
    }),
    something = {
        title: 'Something',
        content: 'This is some content',
        somethingElse: 'Something else'
    };

ls.set(something);

ls.get(function (s) {
    s.storageItem.data.title = 'Something Else';
    s.update();
});

// or

var s = ls.get();
```
    
### Remove Local Storage from browser

```javascript
var ls = new LS({
        storageType: 'localStorage'
        endpoint: '/api/pages'
        expires: 50000
    }),
    something = {
        title: 'Something',
        content: 'This is some content',
        somethingElse: 'Something else'
    };

ls.set(something);

ls.remove();
```

### Check if Local Storage data exists

```javascript
var ls = new LS({
        storageType: 'localStorage'
        endpoint: '/api/pages'
        expires: 50000
    }),
    something = {
        title: 'Something',
        content: 'This is some content',
        somethingElse: 'Something else'
    };
    
ls.check();
// false

ls.set(something);

ls.check();
// true
```

### ls.storageItem

The main data containment object is `ls.storageItem`. The output is the following:

```javascript
ls.storageItem = {
    endpoint: String,
    dateCreated: Number,
    data: Object|Array|String|Number
}
```

### Cleanup

I'm currently working on some better object cleanup methods after removal.

## Comments

Please let me know if you experience any issues so they can be fixed up.

## Author

The original author of LS is Jonathan Mischuk
