# A small Local Storage framework

Supports objects and arrays
 
## Usage

### Initialize LS instance

Call `new LS(settings)` with an object argument which contains at least the endpoint
property set

    var ls = new LS({
        storageType: 'localStorage' || 'sessionStorage' // String | optional | default 'localStorage'
        endpoint: '/api/pages'                          // String | mandatory | default undefined
        expires: 50000                                  // Number | optional | milliseconds | default undefined
    });

### Set instance and Local Storage data

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

### Update instance and Local Storage data

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

### Get instance and Local Storage data

callback function is optional

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
    
### Remove Local Storage from browser

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
