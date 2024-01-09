# LibJs
## A jQuery-inspired Javascript Library

### Key Features:
1. Javascript Core API extension
2. HTML document traversal and manipulation
3. Event-handling
4. Ajax
5. Animation

## Examples

### Javascript Core API extension

The library provides additional functionality for the Javascript core `Array`, `String`, `Number`, `Function`, `Element` classes. You can choose either to extend those classes with these methods via modifying the source and setting the `Lib.__proto` switches to `true` or keep the functionality seperate.
```javascript
var array1 = [1, 5, 8, 11];

Lib.utils.array.each(array1, function(val, index, arr) {
    console.log('Element with index $(index) -> val: $(val)'); 
});

// Setting the Lib.__proto.Array switch to true enables the following
array1.each(function(val, index, arr) {
    console.log('Element with index $(index) -> val: $(val)');
));
```

### HTML-DOM traversal and manipulation

 Wrapper class `Query` with chainable methods and support for CSS selectors.
 
```javascript
// Append 2 new child divs into element with id 'elem1' and iterate over its children.
Query("#elem1").append("<div>Div1</div>").append("<div>Div2</div>").children().each(function(el) {
    window.alert(el.innerHTML);
});
```

### Event-handling
Append child div to element with id `elem1` when button with `button1` id is clicked.

```javascript
Query("button#button1").click(function(ev) {
    Query("#elem1").append("<div>div2</div>");
});
```

### Ajax
Make a request to `GET` all listed universities in a specified country and do something once it is done depending on request-status.
```javascript
var req = Lib.utils.ajax.request({
    type: "GET",
    url: "http://universities.hipolabs.com/search",
    params: {
        "country": "United States"
    },
    complete: function(xhr) {
        // do something if the request is completed
    },
    error: function(xhr) {
        // do something if the request fails
    }
});
```

### Animation

Very slowly transition `#elem1` CSS-style to specified `animation_style`.
```javascript
var animation_style = {
    "color": "red", 
    "width": "1250x", 
    "height": "200px", 
    "backgroundColor": "yellow",
    "fontSize": "40pt",
    "borderWidth": "5px",
    "borderColor": "green",
};

Query("#elem1").animate(animation_style, "xx-slow");
```
