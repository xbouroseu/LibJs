/*
 * Copyright 2009
 * Javascript Library Development and Testing.
 * Exercising purpose.
 * Developer Christos Boulmpasakos
 * Freelance Web Developer and Designer.
 * Library CodeName : Lib.
 * Rewritten and Moduled.
*/

(function() {

var toString = Object.prototype.toString,

	window = this,

/*
 * Info: The main Library API Initialization
 * Note: The Lib.__proto object contains switches for whether to extend each Object's original prototype.
*/

// Create the Namespace
	Lib = window.Lib = {
	
	version: "0.2",
	
	/*
	 * <!--__proto-->
	 	* Array: A boolean switch which gives information to the library on whether to extend the <Array>Object Prototype.
		* Function: A boolean switch which gives information to the library on whether to extend the <Function>Object Prototype. 
		* String: A boolean switch which gives information to the library on whether to extend the <String>Object Prototype.
		* Number: A boolean switch which gives information to the library on whether to extend the <Number>Object Prototype.
		* Element: A boolean switch which gives information to the library on whether to extend the <HTMLElement>Object Prototype.
	 * <!--/__proto-->
	*/
	
	__proto: {
		Array: true,
		Function: false,
		String: false,
		Number: false,
		Element: false
	},
	
	utils: {
		makeArray: function() {
			var retArr = [];
			
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				
				if( arg ) {
					if( toString.call(arg) === "[object Object]" && arg.length === undefined) {
						for(var prop in arg) { 
							retArr[retArr.length] = arg[prop];
						}
					}
					else if( !!arg.length && arg != window && !arg.call && arg.nodeType === undefined && !arg.charAt) {
						retArr = retArr.concat( Array.slice ? Array.slice(arg) : Array.prototype.slice.call(arg) );
					}
					else {
						retArr[retArr.length] = arg;
					}
				}
				else {
					retArr[retArr.length] = arg;
				}
			
			}
			
			return retArr;		
		},
		
		Class: function(object) {
			var ext = object.Extend,
				met = object.Methods,
				extend = typeof ext !== "undefined" ? (Lib.utils.isArray(ext) ? ext : [ext]) : [],
				methods = typeof met !== "undefined" ? (Lib.utils.isArray(met) ? met : [met]) : [];
						
			function returnClass() {
				return this.initialize.apply(this, $A(arguments) );
			}
			
			returnClass.constructor = Lib.utils.Class;
			returnClass.extend = asMethod(Lib.utils.Class.extend);
			returnClass.addMethods = asMethod(Lib.utils.Class.addMethods);
			
			each(extend, function(ext) {
				returnClass.extend(ext);
			});
			
			each(methods, function(imp) {
				returnClass.addMethods(imp);
			});
			
			for(var method in object) {
				if( method !== "Extend" && method !== "Methods" ) {
					var tmp = method;
					
					if( method === "!Extend" || method === "!Methods" ) {
						tmp = method.substring(1);
					}
					
					returnClass.prototype[tmp] = object[method];
				}
			}
			
			returnClass.prototype.initialize = decide("function", returnClass.prototype.initialize);
												
			return returnClass;
		},

		typeOf: function(node) { return toString.call(node) === "[object Window]" ? node.toString() : toString.call(node).replace(/\[object (?:.*?)\]/g,""); },
					
		isNull: function(node) { return typeof(node) === "undefined" || node === undefined || node === null; },
				
		isArrayLike: function(node) { return node && node.length !== undefined && !jCore.isString(node); },
				
		isElement: function(node) { return node && node.nodeType == 1; },
		
		isHash: function(node) {return node && typeof node.sourceObject !== "undefined" && node instanceof Lib.utils.Hash; },
				
		isNative: function(node) { return node && node.toString().split(/function.*?\(\)\s\{([\s\S]*?)\}/)[1].replace(/^\s+|\s+$/g, "") === "[native code]"; }
	},
		
	Extend: function(obj,extender) {
		var extendee;
	
		if( typeof obj === "string" ) {
			var subObjects = obj.split("."),
				realDestination = this,
				last = subObjects.pop(),
				length = subObjects.length;
	
			if( subObjects.length >= 1 ) {
				for(var i = 0; i < length; ++i) {
					realDestination = realDestination[ subObjects[i] ];
				}
			}
				
			if( typeof realDestination[last] === "undefined" ) {
				realDestination[last] = extender;
			}
			else {
				for(var name in extender) {
					realDestination[last][name] = extender[name];
				}
			}
			
			extendee = realDestination[last];
		}
		else {
			for(var ext in extender) {
				obj[ext] = extender[ext];
			}
			extendee = obj;
		}
		
		return extendee;

	}
};

//(function() {
	(Array.forEach || each)(["Object","String","Array","Function","Number","Boolean","Math","RegExp","Text"],function(v) {
		Lib.utils["is" + v ] = function(node) {
			return typeof node !== "undefined" ? toString.call(node) === "[object " + v + "]" : undefined;
		};
	});
//})();

window.Class = Lib.utils.Class;
window.$A = Lib.utils.makeArray;
	
/*
 * Info: Helper Methods.
*/

function each(array,fn) {
	for(var i = 0, l = array.length; i < l; ++i) {
		fn(array[i],i,array);
	}
	return {
		each: each
	};
}

each = Array.forEach || each;

each.object = function(obj, callback) {
	for(var key in obj) {
		callback(obj[key], key);
	}
};

function asMethod(fn) {
	return function() {
		return fn.apply(this, [this].concat( $A(arguments) ) );
	};
}

function map_properties(map,str) {
	return map[str] || str;
}

function getDate() {
	return +(new Date);
}

function rgbToArray(rgb) {
	return rgb.replace(/\s/g,"").replace(/(rgb)|\(|\)/g,"").split(",");
}

function decide(type,obj) {
	var Else;
	
	switch( type ) {
		case "array": Else = [];
			break;
		case "function": Else = function() { };
			break;
		case "object": Else = {};
			break;
		case "string": Else = "";
			break;
		case "number": Else = 0;
			break;
		default: Else = null;
	}
	
	return obj || Else;

}

/*
 * Info: Optional utilities that can come in handy anytime.
*/

(function() {
	Lib.utils.template = window.Template = function(template) {
		this.template = template;
		
		this.evaluate = function(evaluator) {
			if( !evaluator ) { return this.template; }
			return this.template.replace(/#\{(.*?)\}/gi, function(all,ev) {
				return evaluator[ev] || "";
			});
		};
		
		return template;
	};
	
	Lib.utils.Range = window.ObjectRange = function(start,end,filter) {
		var ret = [];
		
		
		if( Lib.utils.isNumber(start) ) {
			for(var i = start; i < end + 1; ++i) {
				ret[ret.length] = i;
			}
		}
		if( Lib.utils.isString(start) ) {
			var letters = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(","), combinations = [], inArray = Lib.utils.array.inArray;
		
			if( Lib.utils.isString(filter) ) {
				filter = window[filter];
			}
		
			filter = filter || function(set) { return set; };
	
			for(i = 0, l = letters.length; i < l; ++i) {
				combinations[combinations.length] = letters[i];
				for(var j = 0; j < l; ++j) {
					combinations[combinations.length] = letters[i] + letters[j];
				}
			}
		
			if(filter === window.LETTERS_ONLY) {
				combinations = letters;
			}
	
			for(var set = combinations, n = inArray(set,start); n < inArray(set,end) + 1; ++n) {
				ret[ret.length] = set[n];
			}
			
			ret = filter(ret);
		}
				
		
		return ret;
	};
	
	/*
	 * Info: The Range return value filters.
	*/
	
	var Filters = {
		ONLY_UPPER: function(set) { return Lib.utils.array.grep(set,function(l) { return new RegExp("[A-Z]{" + l.length + "}", "g").test(l); }); },
		ONLY_LOWER: function(set) { return Lib.utils.array.grep(set,function(l) { return new RegExp("[a-z]{" + l.length + "}", "g").test(l); }); },
		LET_LOWER: function(set) { return Lib.utils.array.grep(set,function(l) { return (/[a-z]/).test(l); }); },
		LET_UPPER: function(set) { return Lib.utils.array.grep(set,function(l) { return (/[A-Z]/).test(l); }); },
		LETTERS_ONLY: function(set) { return set; }
	};
	
	Lib.Extend(window, Filters);
	
	/*
	 * <!--Filters-->:
	 	* ONLY_UPPER: Allow words whose all letters are uppercased
		* ONLY_LOWER: Allow words whose all letters are lowercased
		* LET_LOWER: Allow words which at least have a lowercased character
		* LET_UPPER: Allow words which at least have an uppercased character
		* LETTERS_ONLY: Get onlt the alphabet letters from the range
	 * <!--/Filters-->
	*/
	
})();

/*
 * Info: The Math Object.
 * Note: Adds many useful mathematical methods to the library.
*/

(function() {
	// Begin building the most basic factorial table until number 12.
	var Factorial = [1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600],
		abs = Math.abs,
		floor = Math.floor,
		sqr = Math.sqrt,
		pi = Math.PI,
		circ = 2 * pi,
		right = pi/2,
		rightd = 3 * right
		LB = 4/pi,
		LA = LB/pi;
		
	Lib.utils.math = {
		radians: function(angle) {
			return (angle * pi)/180;
		},
		
		degrees: function(rad) {
			return (180 * rad)/pi;
		},
		
		// Converts an angle bigger than +-360 degrees to a one circle angle for e.x 450 degrees become 90 degrees because 450 = 360(one full circle) + 90;
		toCircle: function(angle) {			
			return abs(angle) > 360 ? angle - (360 * floor(angle/360)) : (angle < 0) ? 360 + angle : angle;
		},
		
		factorial: function(num) {
			return Factorial[num] || (function() { var fac = 1; for(var i = 1; i <= num; ++i) { fac = fac * i; } return fac; })();
		},
		
		/* 
		 
		  sin(x) = 4x/pi - 4x^2/pi^2 = 4x/pi(1 - x/pi) */
		
		sine: function(angle) {
			var sin = angle * (LB - (LA * abs(angle)));
			
			//Improvement of algorithm for better accuracy. 0.001 maximum error!!
			// var Q = 0.775, P = 0.225;
			
			return sin * (0.225 * abs(sin) + 0.775);
		},
		
		cosine: function(angle) {
			angle -= (angle > right) ? rightd : -right;
			
			var cos = angle * (LB - (LA * abs(angle)));
			
			return cos * (0.225 * abs(cos) + 0.775);
		},
		
		asin: function(angle) {
			return (pi/12)*(6 +  sqr(98 - sqr(2880 * angle + 1922)));
		},
		
		tangent: function(angle) {
			return this.sine(angle)/this.cosine(angle);
		},
		
		cotangent: function(angle) {
			return this.cosine(angle)/this.sine(angle);
		}
		
	};
})();

/*
 * Info: A first attempt for addopting fundamental equations of physics.
*/

//(function() {
	
	Lib.utils.physics = {
		gas: {},
		
		nuclear: {},
		
		electomagnetism: {
			
		},
		
		motion: {
			normal: {
				time: function(vel,dis) {
					return dis/vel;
				},
				
				velocity: function(time,dis) {
					return dis/time;
				},
				
				distance: function(vel,time) {
					return time * vel;
				}
			},
			
			accelerated: {
				distance: function(acc,time,vel_s) {
					vel_s = vel_s || 0;
					
					return vel_s * time + 0.5 * acc * time * time;
				},
				
				velocity: function(acc,time,vel_s) {
					vel_s = vel_s || 0;
					
					return vel_s + acc * time;
				},
				
				velocity_w: function(acc,dis,vel_s) {
					vel_s = vel_s || 0;
					
					return Math.sqrt(vel_s * vel_s + 2 * acc * dis);
				},
				
				time: function(acc,vel,vel_s) {
					vel_s = vel_s || 0;
					
					return (vel - vel_s)/acc;
				}
			},
			
			circular: {
				velocity: function(dis,time) {
					return dis/time;
				},
				
				frequency: function(cycles,time) {
					return cycles/time;
				},
				
				angular_velocity: function(angle, time) {
					return angle/time;
				}
			}
		}
	};
	
	
//})();

/*
 * Info: The Library's array methods.
 * Note: You can optionally extend the Array prototype by enabling the Array switch in the Lib.__proto object.
*/

(function(proto) {		
	Lib.utils.array = {
		unique: function(array_element) {
			var returnArr = [];
			
			r: for(var i = 0; i < array_element.length; ++i) {
				for(var j = 0; j < returnArr.length; ++j) {
					if(returnArr[j] == array_element[i]) {
						continue r;
					}
				}
				returnArr[returnArr.length] = array_element[i];
			}
			
			return returnArr;
		},
		
		get: function(array_element,index) {
			return index ? array_element[index] : array_element;
		},
		
		splitEach: function(array_element,splitter) {		
			return Lib.utils.array.onItem(array_element, [], function(arr,val) {
				return Lib.utils.array.concat(arr, val.split(splitter) );
			});
		},
		
		inArray: Lib.utils.isNative(Array.indexOf) ? Array.indexOf : function(array_element,val,index) {
			for(var i = (index || 0); i < array_element.length; ++i) {
				if(array_element[i] === val) {
					return i;
				}
			}
			return -1;
		},
		
		inArrayLast: Lib.utils.isNative(Array.lastIndexOf) ? Array.lastIndexOf : function(array_element,val) {
			for(var i = array_element.length; i < (index || 0); --i) {
				if(array_element[i] === val) {
					return i;
				}
			}
			return -1;
		},
		
		has: function(array_element,val) {
			return Lib.utils.array.inArray(array_element,val) > -1;
		},
		
		allow: function() {
			var array_element = arguments[0];
			
			for(var i = 1, l = arguments.length; i < l; ++i) {
				if( !Lib.utils.array.has( array_element, arguments[i] ) ) {
					array_element.push( arguments[i] );
				}
			}
			
			return array_element;
		},
		
		combine: function(array_element,array) {
			return Lib.utils.array.allow.apply( null, [array_element].concat( array ) );
		},
		
		indexesOf: function(array_element,elem) {
			var ret = [];
			
			for(var i = 0, l = array_element.length; i < l; ++i) {
				if(array_element[i] === elem) {
					ret[ret.length] = i;
				}
			}
			
			return ret;
		},
		
		first: function(array_element) {
			return array_element[0];
		},
		
		last: function(array_element) {
			return array_element[array_element.length - 1];
		},
		
		removeFirst: function(array_element) {
			array_element.shift();
			return array_element;
		},
		
		removeLast: function(array_element) {
			array_element.pop();
			return array_element;
		},
		
		every: Lib.utils.isNative(Array.every) ? Array.every : function(array_element,callback) {		
			for (var i = 0, l = array_element.length; i < l; ++i) {
				if (!callback.call(null, array_element[i], i, array_element) ) {
					return false;
				}
			}
			return true;
		},
		
		some: Lib.utils.isNative(Array.some) ? Array.some : function(array_element,callback) {
			for(var i = 0, l = array_element.length; i < l; ++i) {
				if( callback.call(null, array_element[i], i, array_element) ) {
					return true;
				}
			}
			return false;
		},
		
		each: Lib.utils.isNative(Array.forEach) ? Array.forEach : function(array_element,callback) {
			for(var i = 0, l = array_element.length; i < l; ++i) {
				callback(array_element[i], i);	
			}
			return array_element;
		},
		
		isEmpty: function(array_element) {
			return array_element.length === 0 || !Lib.utils.array.some(array_element, function(val) {
				return !Lib.utils.isNull(val);
			});
		},
		
		sortBy: function(array_element,iterator, context) {
			return Lib.utils.array.pluck( Lib.utils.array.map(array_element,function(value, index) {
				return {
					value: value,
					criteria: iterator.call(context, value, index)
				};
			}).sort(function(left, right) {
				var a = left.criteria, b = right.criteria;
				return a < b ? -1 : a > b ? 1 : 0;
			}), 'value');
		},
		
		inDocumentOrder: function(array_element) {		
			return array_element.sort(function(a, b) {
				return document.compareDocumentPosition ?
					3 - ( a.compareDocumentPosition(b) & 6 ) :
					a.sourceIndex - b.sourceIndex;
			});
		},
		
		random: function(array_element,min,max) {
			min = min || 0;
			max = max || array_element.length - 1;
			return array_element[ Math.floor( Math.random() * ( max - min + 1 ) + min ) ];
		},
		
		min: function(array_element) {
			return Math.min.apply(Math, array_element);
		},
		
		max: function(array_element) {
			return Math.max.apply(Math, array_element);
		},
		
		exec: function(array_element,method,args) {
			var ret = [];
			
			args = args || [];
			
			for(var i = 0, l = array_element.length; i < l; ++i) {
				var elem = array_element[i];
				
				ret.push( elem[method].apply(elem, args) );
			}
			
			return ret;
		},
		
		pluck: function(array_element, property) {
			var ret = [];
			
			for(var i = 0, l = array_element.length; i < l; ++i) {
				ret[ ret.length ] = array_element[i][property];
			}
			
			return ret;
		},
		
		empty: function(array_element) {
			array_element.length = 0; return array_element;
		},
		
		emptied: function(array_element) {
			var clone = Lib.utils.array.clone(array_element);
			return Lib.utils.array.empty(clone);
		},
		
		oust: function(array_element) {
			var args = $A( arguments ).slice(1),
				l = array_element.length;
			
			for(var j = 0, jl = args.length; j < jl; ++j) {
				for(var i = 0; i < l; ++i) {
					if( args[j] === array_element[i]) {
						array_element.splice(i--, 1);
						l--;
					}
				}
			}
			
			return array_element;
		},
		
		pushStack: function(array_element) {
			var args = $A(arguments).slice(1);
			for(var i = 0 , l = args.length; i < l; ++i) {
				var arg = args[i];
				Array.prototype.push.apply( array_element, $A(arg) );
			}
			return array_element;
		},
		
		withValues: Lib.utils.isNative(Array.reduce) ? Array.reduce : function(array_element,callback) {
			var current = array_element[0];
			
			for(var i = 1, l = array_element.length; i < l; ++i) {
				current = callback.call(null,current,array_element[i],array_element);
			}
			
			return current;
		},
		
		reduceBy: function(array_element,arr) {
			return Lib.utils.array.oust.apply(array_element,[array_element].concat(arr));
		},
		
		clean: function(array_element) {
			return Lib.utils.array.oust(array_element, undefined, null, "");
		},
		
		clear: function(array_element) {
			return Lib.utils.array.oust(Lib.utils.array.clone(array_element), undefined, null, "");
		},
		
		grep: Lib.utils.isNative(Array.filter) ? Array.filter : function(array_element,callback) {
			var ret = [];
			
			for ( var i = 0, l = array_element.length; i < l; ++i ) {
				if ( !!callback( array_element[i], i ) ) {
					ret[ret.length] = array_element[i];
				}
			}
	
			return ret;
		},
		
		map: Lib.utils.isNative(Array.map) ? Array.map : function(array_element,callback) {
			var ret = [];
					
			for (var i = 0, l = array_element.length; i < l; ++i) {
				if (callback(array_element[i], i, array_element) !== null) {
					ret[ret.length] = callback(array_element[i], i, array_element);
				}
			}
			
			return ret;
		},
		
		clone: function(array_element) {
			return [].concat(array_element);
		},
		
		numeric: function(array_element) {
			return Lib.utils.array.grep(array_element, function(val) {
				return !isNaN( val - 0 );
			});
		},
		
		numerize: function(array_element) {
			return Lib.utils.array.map(array_element, function(val) {
				return parseInt(val);
			});
		},
		
		json: function(array_element) {
			return Lib.utils.array.onItem(array_element, {}, function(vanilla_object, val, index) {
				vanilla_object[index] = val;
				return vanilla_object;
			});
		},
		
		json_encode: function(array_element) {
			
		},
			
		onItem: function(array_element, arr, callback) {		
			for(var i = 0, l = array_element.length; i < l; ++i) {
				arr = callback(arr, array_element[i], i, array_element);
			}					
			return arr;
		},
		
		flatten: function(array_element) {
			return Lib.utils.array.onItem(array_element, [ ], function( arr, val) {
				return arr.concat(Lib.utils.isArrayLike(val) ? Lib.utils.array.flatten( $A(val) ) : [val]);
			});
		},
		
		concatEqual: function(array_element,zippo,callback) {
			var ret = [];
			
			callback = callback || function(a) { return a; };
			
			return Lib.utils.array.onItem(array_element,[], function(arr, val, index) {
				return arr.concat( [ callback([val, zippo[index] || "" ], array_element, zippo ) ] );
			});
		},
		
		replace: function(array_element,elem,replacer) {
			return Lib.utils.array.onItem(array_element, [], function(arr, el) {
				return el === elem ?
					arr.pushStack(replacer) :
					arr.pushStack(el);
			});
		},
		
		fillEqual: function(array_element,arr) {
			return Lib.utils.array.onItem(array_element, [], function(array, elem, i) {
				array[array.length] = elem === "" || !elem ? arr[i] : elem;
				return array;
			});
					
		},
		
		fill: function(array_element,arr,filler) {
			filler = filler || "";
			var emptyIndexes = Lib.utils.array.indexesOf(array_element,filler);
	
			return arr.clear().onItem(Lib.utils.array.clone(array_element),function(array,elem,i,orig) {
				var index = Lib.utils.array.inArray(array,filler);
				array.splice(index, 1 ,orig[ Lib.utils.array.inArray(emptyIndexes,index) ] );
				return array;
			});
		},
		
		shuffle: function(array_element) {
			for (var i = 0, l = array_element.length; i < l; ++i) {
				var tmp = array_element[i],
					random = Math.round( Math.random() * (l - 1) );
				array_element[i] = array_element[random];
				array_element[random] = tmp;
			}
			return array_element;
		}
	};

	var custom_to_native_map = {
		grep: "filter",
		withValues: "reduce",
		each: "forEach",
		inArray: "indexOf",
		inArrayLast: "lastIndexOf"
	};
	
	if(proto === true) {
		for(var n in Lib.utils.array) {
			Array.prototype[n] = Array.prototype[ map_properties(custom_to_native_map,n) ] || asMethod( Lib.utils.array[n] );
		}
	}
	
})(Lib.__proto.Array);
	

/*
 * Info: The Library's class/function methods.
 * Note: You can optionally extend the Function prototype by enabling the Function switch in the Lib.__proto object.
*/

(function(proto) {
	var Class_methods = {
		bind: function(fn,obj) {					
			return function() {
				return fn.apply( obj, $A( arguments ) );
			};
		},
		
		prepend: function(fn,args,bind) {
			return function() {
				return fn.apply( bind || this, args.concat( $A(arguments) ) );
			};
		},
		
		append: function(fn,args,bind) {
			return function() {
				return fn.apply( bind || this, $A(arguments).concat( args ) );
			};
		},
		
		addMethods: function(fn,methods) {
			var obj = methods;
			
			if( Lib.utils.isFunction(methods) ) {
				obj = methods.prototype;
			}
			
			for(var method in obj) {
				fn.prototype[method] = obj[method];
			}
			
			return fn;
				
		},
					
		extend: function(fn,extender,proto) {
			var property;
			proto = proto || false;
			
			if( proto === false) {
				for(property in extender) {
					if( property !== "prototype") {
						fn[property] = extender[property];
					}
				}
			}
			else {
				for(property in extender) {
					fn[property] = extender[property];
				}
			}
			
			return fn;
		},
		
		asMethod: function(fn) {
			return function() {
				return fn.apply(this,[this].concat( $A( arguments ) ) );
			};
		}
		
	};
	
	Lib.Extend(Lib.utils.Class, Class_methods);
		
	if(proto === true) {
		for(var n in Class_methods) {
			Function.prototype[n] = asMethod(Class_methods[n]);
		}
	}
	
})(Lib.__proto.Function);

/*
 * Info: The Library's Hash Object methods
*/

(function() {
	Lib.utils.Hash = window.Hash = function(object) {
		this.sourceObject = object && object.sourceObject ? object.sourceObject : object || {};
		this.hashObject = object && object.hashObject ? object.clone() : Lib.Extend({}, object || {});
		return this;
	};
	
	Lib.utils.Hash.build = function(keys,values) {
		var ret = {};
		
		for(var i = 0, l = keys.length; i < l; ++i) {
			ret[ keys[i] ] = values[i];
		}
		
		return ret;
	};
	
	Lib.utils.Hash.prototype = {
		each: function(fn) {
			var object = this.hashObject,
				length = object.length;
			
			if(length === undefined) {
				for(var key in object) {
					fn( object[key], key, object );
				}
			}
			else {
				for(var i = 0; i < l; ++i) {
					fn( object[i], i, object);
				}
			}
			
			return this;
		},
		
		content: function() {
			return this.hashObject;
		},
		
		source: function() {
			return this.sourceObject;
		},
		
		get: function(key) {
			return this.hashObject[key];
		},
		
		set: function(key,value) {
			this.hashObject[key] = value;
			return this;
		},
		
		onItem: function(obj,fn) {
			var hash = this.hashObject;

			for(var key in hash) {
				obj = fn( obj, hash[key], key, hash );
			}
			
			return obj;
		},
		
		values: function() {
			return new Lib.utils.Hash( this.hashObject ).onItem( [], function(ret, value) {
				ret.push(value);
				return ret;
			});
		},
		
		keys: function() {
			return new Lib.utils.Hash( this.hashObject ).onItem( [], function(ret, value, key) {
				ret.push( key );
				return ret;
			});
		},
		
		slice: function(start,end) {
			var obj = this.hashObject,
				props = this.keys(),
				values = this.values(),
				ret = {};
			
			start = ( Lib.utils.isString(start) ? Lib.utils.array.inArray(props,start) : start) || 0;
			end = ( Lib.utils.isString(end) ? Lib.utils.array.inArray(props,end) : end) || values.length;
			
			values = values.slice(start,end);
			props = props.slice(start,end);
			
			for(var i = 0, l = values.length; i < l; i++) {
				ret[ props[i] ] = values[i];
			}
			
			this.hashObject = ret;
			return this;
		},
		
		remove: function() {
			for(var i = 0, l = arguments.length; i < l; ++i) {
				delete this.hashObject[ arguments[i] ];
			}
			return this;
		},
		
		unset: function() {
			for(var i = 0, l = arguments.length; i < l; ++i) {
				delete this.sourceObject[ arguments[i] ];
				delete this.hashObject[ arguments[i] ];
			}
			return this;
		},
		
		hashClone: function() {
			return new Lib.utils.Hash( this );
		},
		
		clone: function() {
			return Lib.Extend({}, this.hashObject);
		}
	};
		
})();

/*
 * Info: The Library's String methods.
 * Note: You can optionally extend the Function prototype by enabling the String switch in the Lib.__proto object.
*/

(function(proto) {		
	Lib.utils.string = {
		escapeHTML: function(str) { return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); },
		
		unescapeHTML: function(str) { return str.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">"); },
		
		first: function(str) { return str.charAt(0); },
		
		last: function(str) { return str.charAt(str.length - 1); },
		
		pos: function(str,what) {
			return Lib.utils.isRegExp(what) ?
				what.test( str ) :
				str.indexOf(what) > -1;
		},
		
		dasherize: function(string) {
			return string.replace(/([A-Z]+)/g, function(all, char) {
				return "-" + char.toLowerCase();
			});
		},
		
		camelize: function(string) {
			return string.replace(/(-[A-Za-z])/g, function(all, char) {
				return char.charAt(1).toUpperCase();
			});								
		},
		
		capitalize: function(string) {
			return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
		},
		
		trim: function(str) { return str.replace(/^\s+|\s+$/g, ""); },
		
		isUpper: function(str) { return Lib.utils.string.every(str,function(val) { return (/[A-Z]/).test(val); }); },
		
		isLower: function(str) { return Lib.utils.string.every(str,function(val) { return (/[a-z]/).test(val); }); }
	};
	
	Lib.utils.array.each(["map","grep","every"],function(methodName) {
		Lib.utils.string[methodName] = function(str,fn) {
			return Lib.utils.array[methodName](str.split(""),fn);
		};
	});
	
	if(proto === true) {
		for(var n in Lib.utils.string) {
			String.prototype[n] = Lib.utils.Class.asMethod(Lib.utils.string[n]);
		}
	}
	
})(Lib.__proto.String);


/*
 * Info: The Library's Number methods.
 * Note: You can optionally extend the Number prototype by enabling the Number switch in the Lib.__proto object.
*/

(function(proto) {
	Lib.utils.number = {			
		digits: function(number) {
			return ("" + number).split("");
		},
		
		random: function(number) { return Math.random() * number; },
		
		expand: function(number) {
			var ret = [];
			for(var i = 0; i < number; ++i) {
				ret.push(i);
			}
			return ret;
		},
		
		each: function(number,callback) {
			$R(0,number).each(callback);		
			return this;
		}
	};
	
	each(["abs","ceil","floor","round","sqrt","pow","cos","atan"],function(m) { Lib.utils.number[m] = Math[m]; });
	
	if(proto === true) {
		for(var n in Lib.utils.number) {
			Number.prototype[n] = Lib.utils.Class.asMethod(Lib.utils.number[n]);
		}
	}
	
})(Lib.__proto.Number);
	
/*
 * Info: The BBCode utilities for the String object.
 * Note: You can optionally extend the String prototype with the BBCode methods if the Lib.__proto.String switch is on.
*/

(function(proto) {
	var BBCode = {
		
		HTMLTags: "a|abbr|acronym|address|applet|area|b|base|basefont|bdo|big|blockquote|body|br|button|caption|center|cite|code|col|colgroup|dd|del|dfn|dir|div|dl|dt|em|fieldset|font|form|frame|frameset|head|h[1-6]|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|map|menu|meta|noframes|noscript|object|ol|optgroup|option|p|param|pre|q|s|samp|script|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|title|tr|tt|u|ul|var|marquee",
	
		Supported: ["b","cell","center","code","color","font","google","hr","i","indent","item","img","jus","left","list","move","noparse","o","quote","right","row","size","s","sub","sup","table","td","tel","tr","u","video","youtube","\\*"],
			
		HTML_BBCODE: {
				
			url: [ /<a.*?href=\"(.*?)\".*?>(.*?)<\/a>/gi, "[url=$1]$2[/url]" ],
			
			strong_start: [ /<(?:b|strong)>/gi, "[b]" ],		
			strong_end: [ /<(?:\/(strong|b))>/gi, "[/b]" ],
			underline: [ /<(?:em|i)>(.*?)<\/(em|i)>/gi, "[i]$1[/i]" ],
			
			code: [ /<(?:div|span) class=\"codeStyle\">(.*?)<\/(?:div|span)>/gi, "[code]$1[/code]" ], 
			quote: [ /<(?:div|span) class=\"quoteStyle\">(.*?)<\/(?:div|span)>/gi, "[quote]$1[/quote]" ],
			
			/*font_color_family_size: [ /<font color=\"(.*?)\" face=\"(.*?)\" size=\"(.*?)\">(.*?)<\/font>/gi, "[color=$1][font=$2][size=$3]$4[/size][/font][/color]" ],
			font_color_size_family: [ /<font color=\"(.*?)\" size=\"(.*?)\" face=\"(.*?)\">(.*?)<\/font>/gi, "[color=$1][size=$2][font=$3]$4[/font][/size][/color]" ],		
			font_size_color_family: [ /<font size=\"(.*?)\" color=\"(.*?)\" face=\"(.*?)\">(.*?)<\/font>/gi, "[size=$1][color=$2][font=$3]$4[/font][/color][/size]" ],
			font_size_family_color: [ /<font size=\"(.*?)\" face=\"(.*?)\" color=\"(.*?)\">(.*?)<\/font>/gi, "[size=$1][font=$2][color=$3]$4[/color][/font][/size]" ],
			font_family_color_size: [ /<font face=\"(.*?)\" color=\"(.*?)\" size=\"(.*?)\">(.*?)<\/font>/gi, "[font=$1][color=$2][size=$3]$4[/size][/color][/font]" ],
			font_family_size_color: [ /<font face=\"(.*?)\" size=\"(.*?)\" color=\"(.*?)\">(.*?)<\/font>/gi, "[font=$1][size=$2][color=$3]$4[/color][/size][/font]" ],
			
			font_color_family: [ /<font color=\"(.*?)\" face=\"(.*?)\">(.*?)<\/font>/gi, "[font=$2][color=$1]$3[/color][/font]" ],
			font_color_size: [ /<font color=\"(.*?)\" size=\"(.*?)\">(.*?)<\/font>/gi, "[color=$1][size=$2]$3[/size][/color]" ],
			font_size_color: [ /<font size=\"(.*?)\" color=\"(.*?)\">(.*?)<\/font>/gi, "[size=$1][color=$2]$3[/color][/size]" ],
			font_size_family: [ /<font size=\"(.*?)\" face=\"(.*?)\">(.*?)<\/font>/gi, "[size=$1][font=$2]$3[/font][/size]" ],
			font_family_color: [ /<font face=\"(.*?)\" color=\"(.*?)\">(.*?)<\/font>/gi, "[font=$1][color=$1]$3[/color][/font]" ],
			font_family_size: [ /<font face=\"(.*?)\" size=\"(.*?)\">(.*?)<\/font>/gi, "[font=$1][size=$2]$3[/size][/font]" ],*/
			
			font_color: [ /<font color=\"(.*?)\".*?>(.*?)<\/font>/gi, "[color=$1]$2[/color]" ],
			font_size: [ /<font size=\"(.*?)\">(.*?)<\/font>/gi, "[size=$1]$2[/size]" ],
			font_family: [ /<font face=\"(.*(?!\s+))\">(.*?)<\/font>/gi, "[font=$1]$2[/font]" ],
				
			img: [ /<img src=\"(.*?)\" \/>/gi, "[img]$1[/img]" ],
			img_titleAlt_src: [ /<img (title|alt)=\"(.*?)\" src=\"(.*?)\" \/>/gi, "[img title=$1]$2[/img]" ],
			img_src_titleAlt: [ /<img src=\"(.*?)\" (title|alt)=\"(.*?)\" \/>/gi, "[img title=$2]$1[/img]" ],		
			
			"(span|div)_color": [ /<(span|div) style=\"color\:(\s| )(.*?)\">(.*?)<\/(font|div)>/gi, "[color=$1]$2[/color]" ],
			
			"(span|div)_size": [ /<(span|div) style=\"font-size\:(\s| )(.*?)\">(.*?)<\/(font|div)>/gi, "[size=$1]$2[/size]" ],
			
			brackets_start: [ /</g, "[" ],
			brackets_end: [ />/g, "]" ]
		},
		
		BBCODE_HTML: {
			
				
			noparse: [ /\[noparse\]([\s\S]*?)\[\/noparse\]/gi, function(all, content) {
				content = content.replace( new RegExp("\\[(" + BBCode.Supported.join("|") + ")","g","i"), "[NO:$1");
				content = content.replace( new RegExp("\\[\\/(" + BBCode.Supported.join("|") + ")\\]","g","i"), "[NO:/$1]");
				
				return "[NOPR:008809184056281603]" +  content + "[/NOPR:008809184056281603]";
			}],
			
			code: [ /\[code\](?:\n|\r)?([\s\S]*?)\[\/code\]/gi, function(all,content) {
				content = content.replace( new RegExp("\\[(" + BBCode.Supported.join("|") + ")","g","i"), "[CO:$1");
				content = content.replace( new RegExp("\\[\\/(" + BBCode.Supported.join("|") + ")\\]","g","i"), "[CO:/$1]");
				
				content = content.replace(/\[NOPR:008809184056281603\]/gi,"[noparse]");
				content = content.replace(/\[\/NOPR:008809184056281603\]/gi, "[/noparse]");
				
				return '<div class="BBCodeBlock"><div class="codeTitle">Code: <a onclick="smfSelectText(this);" href="javascript:void(0)">[Select]</a></div><code>' + content + '</code></div>';
			}],
										  
			video: [ /\[video(.*?)\](.*?)\[\/video\]/gi, function(all,dim,src) {
				var width = (/width=(?:\"|\')?(\d+)(?:\"|\')?/gi.exec(dim) || [])[1] || 425,
					height = (/height=(?:\"|\')?(\d+)(?:\"|\')?/gi.exec(dim) || [])[1] || 344,
					url = src,
					id;
				
				/*
				 * Info: Detect some video types so a correct html will be returned.
				*/
				if( /^(http:\/\/)?(www\.)?(youtube\.com\/watch\?v=)/gi.test(src) ) {
					id = src.split(/watch\?v=(?:.*?)/gi)[1].split("&")[0];
					return "[youtube height=" + height + " width=" + width + "]" + id + "[/youtube]";
				}
				else if( /^(http:\/\/)?video\.google\.com\/videoplay/gi.test(src) ) {
					id = src.split(/videoplay\?docid=(?:.*?)/gi)[1].split("&")[0];
					return "[google height=" + height + " width=" + width + "]" + id + "[/google]";
				}
				else if( /^(http:\/\/)?(www\.)?metacafe.com\/watch/gi.test(src) ) {
					id = src.split(/metacafe\.com\/watch\/(?:.*?)/gi)[1].replace(/\/+$/g,"");
					url = "http://www.metacafe.com/fplayer/" + id + ".swf";
				}
				else if ( /\.swf/gi.test(src) ) {
					return '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + width + '"" height="' + height + '"><param name="movie" value="' + src + '" /><!--[if !IE]>--><object type="application/x-shockwave-flash" data="' + src + '" width="' + width + '" height="' + height + '"><!--<![endif]--><!--[if !IE]>--></object><!--<![endif]--></object>';
				}
				else if (/\.(mov|mp4)/gi.test(src) ) {
					return '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" width="' + width + '" height="' + height + '"><param name="src" value="' + src + '" /><param name="controller" value="true" /><param name="autoplay" value="true" /><object type="video/quicktime" data="' + src + '" width="' + width + '" height="' + height + '" class="mov"><param name="controller" value="true" /><param name="autoplay" value="true" /></object></object>';
				}
				
				return '<object width="' + width + '" height="' + height + '"><param name="movie" value="' + url + '"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed quality="high" src="' + url + '" allowscriptaccess="always" allowfullscreen="true" width="' + width + '" height="' + height + '"></embed></object>';				
			}],
										  
			youtube: [ /\[youtube(.*?)\](.*?)\[\/youtube\]/gi, function(all,dim,src) {
				var width = (/width=(?:\"|\')?(\d+)(?:\"|\')?/gi.exec(dim) || [])[1] || 425,
					height = (/height=(?:\"|\')?(\d+)(?:\"|\')?/gi.exec(dim) || [])[1] || 344;			 
			
				/*return '<object width="' + width + '" height="' + height + '"><param name="movie" value="http://www.youtube.com/v/' + src + '"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed quality="high" src="http://www.youtube.com/v/' + src + '" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="' + width + '" height="' + height + '"></embed></object>';*/
				return '<iframe width="' + width + '" height="' + height + '" src="http://youtube.com/embed/' + src + '" frameborder="0" allowfullscreen></iframe>';
			}],
			
			google: [ /\[google(.*?)\](.*?)\[\/google\]/gi, function(all,dim,src) {
				var width = (/width=(?:\"|\')?(\d+)(?:\"|\')?/gi.exec(dim) || [])[1] || 425,
					height = (/height=(?:\"|\')?(\d+)(?:\"|\')?/gi.exec(dim) || [])[1] || 344;
					
				return '<object width="' + width + '" height="' + height + '"><param name="movie" value="http://video.google.com/googleplayer.swf?docId=' + src + '&hl=en"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed quality="high" src="http://video.google.com/googleplayer.swf?docId=' + src + '&hl=en" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="' + width + '" height="' + height + '"></embed></object>';
				
			}],
			
			pre: [ /\[pre\]([\s\S]*?)\[\/pre\]/gi, "<pre>$1</pre>" ],
			
			horizontal_rule: [ /\[hr\]/gi, "<hr>" ],
			
			trademark: [ /\(tm\)/gi, "&trade;" ],
			copyright: [ /\(c\)/gi, "&copy;" ],
			registered: [ /\(r\)/gi, "&reg;" ],
			
			bold: [ /\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>" ],
			italic: [ /\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>" ],		
			underline: [ /\[u\]([\s\S]*?)\[\/u\]/gi, '<span style="text-decoration: underline;">$1</span>' ],
			overline: [ /\[o\]([\s\S]*?)\[\/o\]/g, '<span style="text-decoration: overline;">$1</span>' ],
			strikethrough: [ /\[s\]([\s\S]*?)\[\/s\]/g, '<span style="text-decoration: line-through;">$1</span>' ],		
			
			center: [ /\[center\]/gi, '<div align="center">' ],		
			left: [ /\[left\]/gi, '<div align="left">' ],		
			right: [ /\[right\]/gi, '<div align="right">' ],		
			justify: [ /\[jus\]/gi, '<div align="justify">' ],
			align_end: [ /\[\/(center|left|right|jus)\]/gi, "</div>" ],
			
			ftp: [ /\[ftp=\"(.*?)\"\]([\s\S]*?)\[\/ftp\]/gi, '<a target="_blank" href="ftp://$1">$2</a>' ],		
			ftp_same_values: [ /\[ftp\]([\s\S]*?)\[\/ftp\]/gi, '<a target="_blank" href="ftp:$1">$1</a>' ],		
			email: [ /\[email=\"(.*?)\"\]([\s\S]*?)\[\/email\]/gi, '<a href="mailto:$1">$2</a>' ],		
			email_same_values: [ /\[email\]([\s\S]*?)\[\/email\]/gi, '<a href="mailto:$1">$1</a>' ],				
			url: [ /\[url=\"(.*?)\"\]([\s\S]*?)\[\/url\]/gi, '<a target="_blank" href="$1">$2</a>' ],		
			url_same_values: [ /\[url\]([\s\S].*?)\[\/url\]/gi, '<a target="_blank" href="$1">$1</a>' ],		
			
			img: [ /\[img\](.*?)\[\/img\]/gi, '<img src="$1" />' ],		
			img_title: [ /\[img title=\"(.*?)\"\](.*?)\[\/img\]/gi, '<img alt="$1" title="$1" src="$2" />' ],		
			
			quote: [ /\[quote\]/gi, '<div class="quoteBlock"><span class="quoteTitle">Quote:</span><blockquote class="quote">' ], 		
			quote_from: [ /\[quote=(.*?)\]/gi, '<div class="quoteBlock"><span class="quoteTitle">Quote from: ($1)</span><blockquote class="quote">' ],		
			quote_end: [ /\[\/quote\]/gi, "</blockquote></div>" ],
			
			indent: [ /(\n|\r)?\[indent\](\n|\r)?/gi, '<div style="position:relative;left:30px;">' ],
			indent_end: [ /(\n|\r)?\[\/indent\](\n|\r)?/gi, "</div>" ],
			
			marquee: [ /\[move\]/gi, '<marquee>' ],		
			marquee_end: [ /\[\/move\]/gi, "</marquee>" ],		
			
			teletype: [ /\[tel\]([\s\S]*?)\[\/tel\]/gi, '<span style="font-family: monospace;">$1</span>' ],		
			supercript: [ /\[sup\]([\s\S]*?)\[\/sup\]/gi, "<sup>$1</sup>" ],		
			subscript: [ /\[sub\]([\s\S]*?)\[\/sub\]/gi, "<sub>$1</sub>" ],		
			upperscript: [ /\[upp\]/gi, '<span style="text-transform: uppercase;">' ],		
			lowerscript: [ /\[low\]/gi, '<span style="text-transform: lowercase;">' ],		
			capitalize: [ /\[cap\]/gi, '<span style="text-transform: capitalize;">' ],
			
			font_color_start: [ /\[color=(.*?)\]/gi, '<span style="color:$1;">' ],					 
			font_family_start: [ /\[font=(.*?)\]/gi, '<span style="font-family:$1;>' ],
			font_size_start: [ /\[size=(.*?)\]/gi, function(all, size) {
				if( !(/pt|px|in|em|cm|mm|pi|ex|xx-small|x-small|small|smaller|medium|large|larger|x-large|xx-large/i).test(size) ) { size = size + "px;"; }

				return '<span style="font-size:' + size + '">';
			}],					 
			font_end: [ /\[\/(upp|low|cap|color|font|size)\]/gi, "</span>" ],		
			
			table: [ /\[table\](\n|\r)?/gi, "<table>" ],		
			table_border: [ /\[table=\"?(.*?)\"?\](\n|\r)?/gi, '<table border="$1">' ],		
			row: [ /\[(row|tr)\](\n|\r){0,}/gi, "<tr>" ],		
			cell: [ /\[(cell|td)\]/gi, "<td>" ],		
			table_end: [ /\[\/table\]/gi, "</table>" ],		
			row_end: [ /\[\/(row|tr)\](\n|\r)?/gi, "</tr>" ],		
			cell_end: [ /\[\/(cell|td)\](\n|\r){0,}/gi, "</td>" ],		
			
			list: [ /\[list\](\n|\r)?/gi, '<ul style="list-style-type: disc">' ],
			list_ordered: [ /\[list=\"?1\"?\](\n|\r)?/gi, '<ul style="list-style-type: decimal">' ],
			list_type: [ /\[list=\"?(.*?)\"?\](\n|\r)?/gi, '<ul style="list-style-type: $1">' ],
			list_item_check_noend_tag: [ /\[(li|item|\*)\](.*?)(\r|\n){1}/gi, '<li>$2' ],
			list_item: [ /\[(li|item|\*)\]/gi, '<li>' ],
			list_item_2: [ /<li>((\n|\r)?(?=<(?:ul|ol)))/gi, '<li>' ],
			list_end: [ /\[\/list\](\n|\r){0,2}/gi, "</ul>" ],		
			list_item_end: [ /\[\/(li|item|\*)\](\n|\r)?/gi, "</li>" ]
			
		}
		
	};
	
	Lib.utils.addBBCode = function(params) {
		Lib.utils.array.allow(BBCode.Supported, params.identifier.replace(/(\+|\-|\?|\.|\[|\]|\(|\))/gi,"\\$1") );
		BBCode.BBCODE_HTML[params.name] = [ params.executer, params.action ];
	};
	
	Lib.utils.string.analyzeBBCode = function(string,allowHTML) {
		var ret = Lib.utils.string.trim(string),
			set = BBCode.BBCODE_HTML;
			
		if(!allowHTML || allowHTML === false) { ret = Lib.utils.string.escapeHTML(ret); }
		
		// Do the Allowed BBCode Parsing
		for(var name in set) {
			if( set[name][0].test( ret ) ) {
				var bbcode = set[name];
				ret = ret.replace(bbcode[0], bbcode[1]);
			}
		}
		
		// Replace the [NO|CO|NOPR:] tags
		ret = ret.replace(/\[(C|N)O:/g, "[").replace(/\[\/?NOPR:008809184056281603\]/gi, "");

		// Manage the carriage returns
		ret = escape(unescape(ret));
		
		ret = ret.replace(/(%0D%0A%0D%0A|%0A%0A|%0D%0D)/g, "<p>");		
		
		ret = ret.replace(/(%0D%0A|%0A|%0D)/gi, "<br/>");
		
		ret = unescape(ret);
		
		return ret;
		
	};
	
	if( proto === true ) {
		String.prototype.analyzeBBCode = asMethod( Lib.utils.string.analyzeBBCode );
	}

})(Lib.__proto.String);
	
/*
 * Info: The Library's Event Class.
 * Note:
 	events#type
		- The event name object which holds its state and the handlers.
	
	events#type > state
		- True or False. This will determine if the event is ready. Like the 'onclick' event( if the element is clicked )

 	addEvent()
		- Add a custom event which will return true or false depending on the entered function.
	
	fireEvent()
		- Fire all the callbacks of the desired event only if the event's state is false( true events will be executed by the 'attachEvent()' function ).
	
	attachEvent()
		- Fires the callback only if the event state is true.
*/
	
(function() {
	Lib.utils.Event = window.Event = {
		events: {},
		
		addEvent: function(name,success) {
			if( Lib.utils.isString(name) ) {
				this.events[name] = {
					state: success.call(this),
					handlers: []
				};
			}
			else if(Lib.utils.isObject(name) ) {
				for(var eventName in name) {
					this.events[eventName] = {
						state: name[eventName].call(this),
						handlers: []
					};
				}
			}
				
			return this;
		},
		
		fireEvent: function(name) {
			var scope = this,
				target = this.events[name];
			
			if( target.state === false ) {
				Lib.utils.array.each(target.handlers,function(fn) {
					fn.call(scope);
				});
			}
			
			return this;
		},
		
		attachEvent: function(name,callback) {
			Lib.utils.array.allow(this.events[name].handlers, callback);
			
			if(this.events[name].state === true) {
				callback.call(this);
			}
			
			return this;
		}
	};
		
})();

/*
 * Info: The Library's Ajax Object Methods and a file loading utility via Ajax(if available).
*/

(function() {
	Lib.utils.ajax = {
		
		settings: {
			url: location.href,
			type: "GET",
			async: true,
			complete: function() {},
			exec: function() {},
			load: function() {},
			progress: function() {},
			upload: function() {},
			error: function() {},
			post_content_type: "application/x-www-form-urlencoded"
		},
		
		setGlobal: function(extend) {
			Lib.Extend(this.settings, extend);
			return this;
		},
		
		xhr: function() {
			try { return new XMLHttpRequest(); }
			catch(e) {
				try { return new ActiveXObject("Msxml2.XMLHTTP"); }
				catch(ee) { return new ActiveXObject("Microsoft.XMLHTTP"); }
			}				
		},
		
		request: function(params) {
			var settings = Lib.utils.ajax.settings,
				xhr = Lib.utils.ajax.xhr(),
				type = params.type || settings.type,
				headers = params.headers || {
					"Content-type": (type === "POST" ? settings.post_content_type : "text/html")
				},
				async = (typeof params.async !== "undefined" ? (params.async === false ? false : true) : settings.async),
				url = params.url || settings.url,
				complete = true,
				parameters = params.params,
				parameterString = "";

			if( Lib.utils.isObject(parameters) ) {
				if( type  === "GET" ) { url += "?"; }
				for(var param in parameters) {
					parameterString += param + "=" + parameters[param] + "&";
				}
			}
			else if( Lib.utils.isString(parameters) ) {
				parameterString = type === "GET" ? "?" : "" + parameters.replace(/^\?/g,"");
			}
			
			parameterString = parameterString.replace(/&$/g, "");
			
			if( type === "GET" && !Lib.utils.string.pos(url,"?") ) {
				url += parameterString;
			}
			
			xhr.async = async;
			xhr.open(type, url, async);
			
			for(var header in headers) {
				xhr.setRequestHeader( header, headers[header] );
			}
			
			xhr.setRequestHeader("X-Requested-With","XMLHttpObject");
			
			xhr.send( type === "POST" ? parameterString : null );
			
			// if( params.complete ) {
				xhr.onreadystatechange = function() {
					if(xhr.readyState == 4 || xhr.readyState == "complete") {
						(params.complete || settings.complete)(xhr);
					}
				};
			//}
			//else {
				(params.exec || settings.exec)(xhr);
			//}
							
			xhr.onload = (params.load || settings.load)(xhr);
			xhr.onprogress = (params.progress || settings.progress)(xhr);
			xhr.onuploadprogress = (params.upload || settings.upload)(xhr);
			xhr.onerror = (params.error || settings.error)(xhr);
			
			return xhr;
		}
		
	};
	
	/*
	 * Info: A function to group files in an object and then return an array of all the file names.
	 * Example:
	 	- getFiles({
			project: "my_new_project.js",
			
			// Many files under the 'js' folder.
			js: {
				file1: "project1.js",
				file2: "project_2.js"
			},
			
			// Many files starting with the 'plugin.' namespace.
			"plugin.": {
				dom: "dom.js" // "plugin.dom.js",
				editor: "editor.js" // "plugin.editor.js"
			},
			
			// OR like this.
			"library-": {
				"1": "1.0.js", // "library-1.0.js"
				"1.3": "1.3.js", // "library-1.3.js"
				"min1.3": "min.1.3.js" // "library-min.1.3.js"
			}
		});
	*/			
	
	function getFiles(obj,start) {
		if( Lib.utils.isArray(obj) ) { return obj; }
		
		var ret = [];
		start = start || "";
	
		for(var key in obj) {
			var file = obj[key],
				last = Lib.utils.string.last(start),
				del =
					last !== "/" && /[a-zA-Z]/g.test( last ) && start.length !== 0 ?
						start + "/" :
					start.replace(/\*/g, "");
			
			if( Lib.utils.isString( file ) ) {
				ret.push( del + file );
			}
			else {
				ret = ret.concat( getFiles( file, del + key ) );
			}
		}
		
		return ret;
	}
	
	Lib.utils.loadFile = function(files) {
		var xhr = Lib.utils.ajax.xhr(),
			ajax_function = Lib.utils.ajax.request,
			each = Lib.utils.array.each,
			args = {
				url: "",
				headers: { "Content-type": "application/x-javascript" },
				async: false,
				exec: function(xhr) {
					if( window.execScript ) { window.execScript( xhr.responseText ); }
					else { eval.call(window, xhr.responseText); }
				}
			},
			loadQueue;
			
		if( Lib.utils.isString(files) ) { loadQueue = [ files ]; }
		else { loadQueue = getFiles(files); }
		
		if( !Lib.utils.isNull(xhr) ) {
			each( loadQueue, function(file) {
				args.url = file;
				ajax_function(args);
			});
		}
		else {
			each( loadQueue, function(file) {
				document.write('<script type="text/javascript" language="javascript" src="' + file + '"><\/script>');
			});
		}
			
		
	};
})();


/*
 * Info: The Library's MySQL Database Management functions.
*/

(function() {
	Lib.utils.MySQL = function(host, db, db_user, db_pass) {
		this.params = {
			host: host,
			db: db,
			user: db_user || "",
			pass: db_pass || ""
		};
		
		this.actionFile = Lib.utils.MySQL.actionFile = Lib.utils.MySQL.actionFile || "mysql.php";
		
		return this;
	};
		
	Lib.utils.MySQL.prototype = {
		actionFile: function(path) {
			this.actionFile = Lib.utils.MySQL.actionFile = path;
		},
		
		createTable: function(table,fields) {
			Lib.utils.ajax.request({
				url: this.actionFile,
				params: Lib.Extend(this.params, {
					action: "table_create",
					table: table,
					fields: fields.join(",")
				})
			});
			
			return this;
		},
		
		selectTable: function(table) {
			var self = this;
			self.table = table;
			
			this.insertInto = function(values) {
				Lib.utils.ajax.request({
					url: self.actionFile,
					params: Lib.Extend(self.params, Lib.Extend({action: "table_insertInto", table: self.table}, values) )
				});
			};
			
			this.selectRows = function(rows) {
				Lib.utils.ajax.request({
					url: self.actionFile,
					params: Lib.Extend(self.params, Lib.Extend({action: "table_selectRows", table: self.table, rows: rows}) )
				});
			};
			
			return this;
		}
	};
})();

/*
 * Info: The Library's Color Utilities.
 * Note: Currently only few available, more to be added in the next beta release.
*/

(function() {
	Lib.utils.color = {
		NamedColors: {
			antiquewhite: [175,190,125], aqua: [0,255,255], aquamarine: [127,255,208], azure: [240,255,255], beige: [245,245,220], bisque: [255,228,196],
			black: [0,0,0], blanchedalmond: [255,235,205], blue: [0,0,255], blueviolet: [138,43,226], brown: [165,42,42], burlywood: [222,184,135],
			cadetblue: [95,158,160], chartreuse: [127,255,0], chocolate: [210,105,30], coral: [222,127,80], cornflowerblue: [100,149,237], cornsilk: [255,248,220],
			crimson: [220,20,60], cyan: [0,255,255], darkblue: [0,0,139], darkcyan: [0,139,139], darkgrey: [169,169,169], darkgreen: [0,100,0],
			darkkhaki: [189,183,107], darkmagenta: [139,0,139], darkolivegreen: [85,107,47], darkorange: [255,140,0], darkorchid: [153,50,204], darkred: [139,0,0],
			darksalmon: [233,150,122], darkviolet: [148,0,211], fuchsia: [255,0,255], gold: [255,215,0], green: [0,128,0], indigo: [75,0,130],
			khaki: [240,230,140], lightblue: [173,216,230], lightcyan: [224,255,255], lightgreen: [144,238,144], lightgrey: [211,211,211], lightpink: [255,182,193],
			lightyellow: [255,255,224], lime: [0,255,0], magenta: [255,0,255], maroon: [128,0,0], navy: [0,0,128], olive: [128,128,0], orange: [255,165,0],
			pink: [255,192,203], purple: [128,0,128], violet: [128,0,128], red: [255,0,0], silver: [192,192,192], white: [255,255,255], yellow: [255,255,0]
		},
		
		convert: function(color) {
			var isHexFull = /#([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([a-fA-F0-9]{2})/;
			var isHexHalf = /#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])/;
			
			var final_rgb;
			
			if( Lib.utils.isString(color) ) {
				if( /(rgb\()/i.test(color) ) {
					final_rgb = color;
				}
				else if( isHexFull.test(color) ) {
					final_rgb = Lib.utils.color.HexToRgb(color);
				}
				else if( isHexHalf.test(color) ) {
					var hex = isHexHalf.exec(color);
							
					final_rgb = Lib.utils.color.HexToRgb(hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]);
				}
				else if( (color = color.toLowerCase()) in Lib.utils.color.NamedColors ) {
					final_rgb = Lib.utils.color.NamedColors[color].join(",");
				}
				else {
					return [255,255,255];
				}
								
				final_rgb = Lib.utils.array.numerize(rgbToArray(final_rgb));
			}
			else {
				final_rgb = Lib.utils.array.numerize(color);
			}
			
			return final_rgb;
		},
		
		RgbToHex: function(R,G,B) {		
			
			function hexify(rgb) {
				 if (rgb === null) { return "00"; }
				 
				 rgb = parseInt(rgb);
				 
				 if (rgb === 0 || isNaN(rgb) ) { return "00"; }
				 
				 rgb = Math.max(0,rgb);
				 rgb = Math.min(rgb,255);
				 rgb = Math.round(rgb);
				 
				 var hexValues = "0123456789ABCDEF";
				 return hexValues.charAt( (rgb - rgb % 16) /16) +
				 		hexValues.charAt(rgb % 16);
			}
			
			return hexify(R) + hexify(G) + hexify(B);
		},
				
		HexToRgb: function(hex) {
			hex = hex.charAt(0) == "#" ? hex.substring(1,7) : hex;
			
			var R = parseInt( hex.substring(0,2), 16);
			var G = parseInt( hex.substring(2,4), 16);
			var B = parseInt( hex.substring(4,6), 16);
			
			return [R,G,B].join(",");

		},
		
		colorToRgb: function(color) {
			var Colors = Lib.utils.color.NamedColors;
			
			return Colors[color].join(",");
		},
		
		colorToHex: function(color) {
			var Colors = Lib.utils.color.NamedColors;
			
			return Lib.utils.color.RgbToHex.apply(this, Colors[color]);
		},
		
		valToColor: function(val) {
			var Colors = Lib.utils.color.NamedColors;
			
			if( Lib.utils.string.pos(val,",") ) {
				for(var name in Colors) {
					if( Colors[name].join("") === val.split(",").join("") ) {
						return name;
					}
				}
			}
			else if( Lib.utils.string.pos(val,"#") ) {
				return Lib.utils.color.valToColor( Lib.utils.color.HexToRgb(val) );
			}
		}
	};
	
})();

/*
 * Info: A very necessary tool. The Library's data storing utilities.
*/

(function() {
	var rand = "Storage_ID:" + ("" + Math.random()).replace(".","");
	Lib.utils.store = {
		store: {},
		
		guid: 0,
		
		storeData: function(elem, name, value) {
			var id = elem[rand];
			
			if( Lib.utils.isNull(id) ) {
				elem[rand] = this.guid++;
				id = elem[rand];
			}
						
			if( !this.store[id] ) {
				this.store[id] = {};
			}
						
			if( !Lib.utils.isNull(value) ) {
				this.store[id][name] = value;
			}
			
			return this.store[id][name];			
		},
		
		removeData: function(elem, name) {
			var id = elem[ rand ],
				scope = this;
			
			if( !Lib.utils.isNull(name) ) {
				var names = name.split(" "),
					store = scope.store[id];
				
				Lib.utils.array.each(names, function(name) {					
					/*if( Lib.utils.string.pos(name,".") ) {
						var full = name.split(".");
						
						for(var i = 0, l = full.length - 1; i < l; ++i) {
							store = store[ full[i] ];
						}
													
						delete store[ Lib.utils.array.last(full) ];
					}
					else {
						delete store[name];
					}*/
					
					eval("delete store." + name + ";");
				});
						
				for(var remains in store ) {
					break;
				}
								
				if ( Lib.utils.isNull(remains) ) {
					scope.removeData( elem );
				}
			}
			else {
				try { delete elem[ rand ]; }
				catch(e) { elem.removeAttribute( rand ); }
				
				this.guid--;
				delete scope.store[ id ];				
			}
			
			return id;
		},
		
		getData: function(elem,name) {			
			var id = elem[ rand ],
				data = this.store[ id ] || {};
				
			if( !name ) { return data; }
			else { data = data[name]; }

			if( Lib.utils.isNull(id) || Lib.utils.isNull(data) ) {
				return null;
			}
			
			return data;
		},
		
		getId: function(elem) {
			return elem[rand];
		}
	};
})();

/*
 * Info: A small utility to quickly create javascript performance tests using the JSLitmus script.
*/
(function() {
	Lib.utils.tests = function(tests) {
		var JSLitmus = window.JSLitmus, test;
		
		for(var key in tests) {
			test = tests[key];
			JSLitmus.test(test.name, test.test);
		}
	};
})();

/*
 * Info: The Library's HTML DOM Utilities.
*/

var Event_names = [
	"abort","blur","change","click","dblclick","error","keydown","keyup",
	"keypress","load","mouseover","mousemove","mouseenter","mouseleave","mouseout","mousedown",
	"mouseup","offline","online","reset","resize","select", "scroll","submit","unload"
];

(function(proto) {	
	function appender( string ) {
		var empty = document.createElement("div"),
			rand = "" + Math.random();
	
		if( Lib.utils.isString(string) ) {
			var clean = Lib.utils.string.trim(string),
				tag = clean.substring(0,10),
				contains = Lib.utils.string.pos;
		
			empty.innerHTML =
					contains(tag,"<td") ?
						'<table><tbody><tr id="' + rand + '">' + string + '</tr></tbody></table>' :
					contains(tag,/^<(thead|tbody|tfoot|colg|cap)/) ?
						'<table id="' + rand + '">' + string + '</table>':
					contains(tag, "<leg") ?
						'<fieldset id="' + rand + '">' + string + '</fieldset>' :
					contains(tag,"<opt") ?
						'<select multiple="multiple" id="' + rand + '">' + string + '</select>':
					contains(tag,"<tr") || contains(tag,"<col") ?
						'<table><tbody id="' + rand + '">' + string + '</tbody></table>':
					"<div id=" + rand + ">" + string + "</div>";
		}
		else {
			var element = document.createElement("div");
			element.id = rand;
			
			if( !!string.length && !string.charAt ) {
				Lib.utils.array.each(string, function(elem) {
					element.appendChild(elem);
				});
			}
			else {
				element.appendChild(string);
			}
			
			empty.appendChild(element);
		}
		
		var doc = document.documentElement;
		doc.insertBefore(empty, doc.firstChild);
	
		var node = document.getElementById(rand);
		
		doc.removeChild(empty);
		
		doc = empty = null;
	
		return node;
	}
	
	function addEvent(elem, type, handler) {
		if( window.addEventListener ) { elem.addEventListener(type, handler, false); }
		else { elem.attachEvent("on" + type, handler); }
	}
	
	function removeEvent(elem, type, handler) {
		if( window.removeEventListener ) { elem.removeEventListener(type, handler, false); }
		else { elem.detachEvent("on" + type, handler); }
	}	

	Lib.utils.event = {
	};

	
	var native_to_custom = {
		nextSibling: "next",
		previousSibling: "previous",
		insertBefore: "insertPrev",
		childNodes: "childElements"
	};
	
	Lib.utils.dom = {
		addEvent: function(element, type, handler) {
			var namespaces = type.split("."),
				eventName = namespaces.shift(),
				handle = function(event) {
					event.stopPropagation();
					
					if( handler.call(this, event) === false) {
						event.preventDefault();
					}
				},
				element_info = Lib.utils.store.getData(element, "DOMEvent") || Lib.utils.store.storeData(element, "DOMEvent", {}),
				
				handlers = element_info[eventName] = element_info[eventName] || [],
				id = handlers.push({ orig: handler, handleEvent: handle }) - 1,
				namespace_handlers;			
			
			handler.preserveOriginal = handle;
			
			Lib.utils.array.each(namespaces, function(namespace) {
				namespace_handlers = handlers[namespace] = handlers[namespace] || [];
				namespace_handlers.push({ orig: handler, handleEvent: handle, eventID: id });
			});
			
			addEvent(element, eventName, handle);
			
			return this;
		},
		
		
		removeEvent: function(element, events, handler) {
			var data = Lib.utils.store.getData(element, "DOMEvent"),
				handler_exists = typeof handler !== "undefined",
				type_exists = typeof events !== "undefined",
				i, l;

			if( !data ) { return; }
			
			if( !type_exists && !handler_exists) {
				for(var eventN in data) {
					var handlersN = data[eventN];
					
					for(i = 0, l = handlersN.length; i < l; ++i) {
						removeEvent(element, eventN, handlersN[i].handleEvent);
					}
				}
				
				Lib.utils.store.removeData(element, "DOMEvent");
			}
			else if( !handler_exists && type_exists ) {
				var types = events.split(",");
				
				evt: for(i = 0, l = types.length; i < l; ++i) {
					var type = types[i],
						namespaces = type.split("."),
						eventName = namespaces.shift(),
						length = namespaces.length,
						handlers = data[eventName];
					
					if( typeof handlers === "undefined" ) {
						continue evt;
					}
					
					if( length === 0 ) {					
						Lib.utils.array.each(handlers, function(handler) {
							removeEvent(element, eventName, handler.handleEvent);
						});
						
						delete data[eventName];
					}
					else {
						var namespace, namespace_handlers;
						NS: for(var j = 0; j < length; ++j) {
							namespace = namespaces[j];
							namespace_handlers = handlers[namespace];
							
							if( typeof namespace_handlers === "undefined" ) {
								continue NS;
							}
							
							Lib.utils.array.each(namespace_handlers, function(handler, n) {
								handlers.splice( handler.eventID - n, 1 );
								removeEvent(element, eventName, handler.handleEvent);
							});
							
							delete handlers[namespace];
							
							if( handlers.length === 0 ) {
								delete data[eventName];
								
								/* for(var remain in data) { break; }
								
								if( Lib.utils.isNull(remain) ) { Lib.utils.store.removeData(element, "DOMEvent"); } */
							}
						}
					}
					
					
				}
				
				for(var remain in data) { break; }
								
				if( Lib.utils.isNull(remain) ) { Lib.utils.store.removeData(element, "DOMEvent"); }
			}
			else {
				var types = events.split(","), handlers;
				
				if( handler.preserveOriginal ) {
					each(types, function(eventName) {
						removeEvent(element, eventName, handler.preserveOriginal);
						Lib.utils.store.removeData(element, "DOMEvent." + eventName + "[" + Lib.utils.array.inArray(handlers, handler) + "]");
										
						if( handlers.length === 0 ) { delete data[eventName]; }
					});

					delete handler.preserveOriginal;
					
					for(var remain in data) { break; }
					
					if( Lib.utils.isNull(remain) ) { Lib.utils.store.removeData(element, "DOMEvent"); }
				}
				else {
					each(types, function(eventName) {
						removeEvent(element, eventName, handler);
					});
				}
			}
			
			return element;
		},
		
		triggerEvent: function(element, eventName) {
			var data = Lib.utils.store.getData(element, "DOMEvent") || {};
			
			if(typeof data === "undefined" || typeof data[eventName] === "undefined") { return; }
			
			Lib.utils.array.each(data[eventName], function(handler) {
				handler.orig.call(element, { target: element });
			});
		},
		
		ready: function(element,callback) {
			if( element.onreadystatechange && !Lib.utils.isElement(element) ) {
				element.onreadystatechange = callback;
				return this;
			}
			
			if( window.addEventListener ) element.addEventListener("DOMContentLoaded",callback,false);
			else element.attachEvent("onreadystatechange",callback);
			
			return this;
		},
		
		hover: function(element,over,out) {
			if( !Lib.utils.isNull(out) )
				Lib.utils.dom.addEvent(element,"mouseover",over).addEvent(element,"mouseout",out);
			else
				Lib.utils.dom.addEvent(element,"mouseover",over);
			
			return this;
		},
		
		childNodes: function(element) {
			return Lib.utils.array.grep($A( element.childNodes ),function(elem) { return elem.nodeType == 1; });
		},
		
		recursiveCollect: function(element,pos) {
			var match = [],
				el = element[pos];
			
			while( el && el != document ) {
				if( el.nodeType == 1 ) {
					match.push(el);
				}
				el = el[pos];
			}
			
			return match;
		},
		
		nextSibling: function(element) {
			var childNodes = Lib.utils.dom.childNodes(element.parentNode);
			return childNodes[ Lib.utils.array.inArray(childNodes,element) + 1];
		},
		
		previousSibling: function(element) {
			var childNodes = Lib.utils.dom.childNodes(element.parentNode);
			return childNodes[ Lib.utils.array.inArray(childNodes,element) - 1];
		},
		
		nextSiblings: function(element) {
			return Lib.utils.dom.recursiveCollect(element,"nextSibling");
		},
		
		previousSiblings: function(element) {
			return Lib.utils.dom.recursiveCollect(element,"previousSibling");
		},
		
		siblings: function(element) {
			return Lib.utils.dom.previousSiblings(element).concat( Lib.utils.dom.nextSiblings(element) );
		},
		
		parents: function(element) {
			return Lib.utils.dom.recursiveCollect(element,"parentNode");
		},
		
		empty: function(element) {
			element.innerHTML = "";
			return element;
		},
		
		setHTML: function(element,html) {
			element.innerHTML = html;
			return element;
		},
		
		append: function(element,value) {
			var test_executer = appender(value);

			Lib.utils.array.each(test_executer.childNodes, function(node) {
				element.appendChild(node);
			});
			
			return this;
		},
		
		prepend: function(element,value) {
			var test_executer = appender(value);
				
			Lib.utils.array.each($A(test_executer.childNodes).reverse(), function(node) {
				element.insertBefore(node,element.firstChild);
			});
			
			return this;
		},
		
		insertAfter: function(element,value) {
			var test_executer = appender(value);
			
			Lib.utils.array.each($A(test_executer.childNodes).reverse(), function(node) {
				element.parentNode.insertBefore(node,element.nextSibling);
			});
			
			return this;
		},
		
		insertBefore: function(element,value) {
			var test_executer = appender(value);
			
			Lib.utils.array.each(test_executer.childNodes, function(node) {
				element.parentNode.insertBefore(node,element);
			});
			
			return this;
		},
		
		css: function(element,style,value) {
			var elements = Lib.utils.isElement(element) ? [element] : $A( element );
			
			function getStyle(element, style) {
				var camel = Lib.utils.string.camelize(style),
					dash = Lib.utils.string.dasherize(style),
					val;
				
				if( typeof element.currentStyle !== "undefined" ) {
					val = element.currentStyle[camel] || element.currentStyle[dash];
				}
				else {					
					val = document.defaultView.getComputedStyle(element,null).getPropertyValue(dash);
				}
				
				return val == null || val == "" ? ( element.style[camel] ) : val;
			}
			
			if( typeof style !== "undefined" || typeof value !== "undefined") {
				if( !Lib.utils.isString(style) ) {
					for( var i = 0, l = elements.length; i < l; i++) {
						for(var prop in style) {
							elements[i].style[prop] = style[prop];
						}
					}
				}
				else if (!value) {
					var firstElem = elements[0],
						val = getStyle(firstElem,style);
					
					if( /color/i.test(style) ) {
						
						var rgb = Lib.utils.color.convert(val);
							/*,
							hex = "#" + Lib.utils.color.RgbToHex.apply(this,rgb),
							color = Lib.utils.color.valToColor( rgb.join(",") ); */
							
						return rgb;
					}
									
					return val;
				}
				else {
					for(var i = 0, l = elements.length; i < l; i++) {
						elements[i].style[style] = value;
					}
				}
			}
			else {
				var firstElem = elements[0],
					style = firstElem.style;
				
				var stil = {
					toArray: function() {
						var ret = [];
						for(var name in this) {
							if( name != "toArray" ) {
								ret.push( name + ": " + this[name] );
							}
						}
						
						return ret;
					}
				};
				
				for(var i = 0, l = style.length; i < l; ++i) {
					stil[ style[i] ] = style[ style[i] ];
				}
				
				return stil;
			}
			
			return element;
		},
		
		outerHTML: function(element) {
			var placeholder = document.createElement("div");
			Lib.utils.dom.append(placeholder, element.cloneNode(true));
			return placeholder.innerHTML;
		},
		
		addClass: function(element,classString) {
			var classNames = classString.split(",");
			
			Lib.utils.array.each(classNames,function(className) {
				element.className += " " + className;
			});
			
			return element;
		},
		
		removeClass: function(element,classString) {
			var classNames = classString.split(","),
				element_class = Lib.utils.array.reduceBy(element.className.split(" "),classNames);
			
			element.className = element_class.join(" ");
			
			if(element.className == "") element.removeAttribute("class");
			
			return element;
		},
		
		hasClass: function(element,className) {
			var element_class = element.className.split(" ");

			return Lib.utils.array.has(element_class,className);
		},
		
		toggle: function() {
			return this.each(function(el) {
				if( el.style.display === "none" ) {
					el.style.display = "block";
				}
				else {
					el.style.display = "none";
				}
			});
		},
		
		toggleClass: function(element,classString) {
			Lib.utils.array.each(classString.split(","), function(className) {
				var decide = Lib.utils.dom.hasClass(element,className) ? "remove" : "add";
				Lib.utils.dom[ decide + "Class" ](element,className);
			});
			
			return element;
		}
		
	};
	
	if( proto === true ) {
		for(var method in Lib.utils.dom) {
			var mapped = map_properties(native_to_custom,method);
			HTMLElement.prototype[ mapped ] = HTMLElement.prototype[ mapped ] || asMethod( Lib.utils.dom[method] );
		}
	}
	
})(Lib.__proto.Element);
				
/*
 * Info: The Element Dimension classes.
*/
(function(proto) {
	each(["Height","Width"], function(dim) {
		var type = dim.toLowerCase();		
		
		Lib.utils.dom["inner" + dim] = function(element) {
			var Paddings = {};
				
			if(element == window) { return window["inner" + dim]; }
				
			each(["Top","Left","Bottom","Right"], function(pos) {
				Paddings[pos] = parseFloat( Lib.utils.dom.css( element, "padding-" + pos.toLowerCase() ) );
			});
			
			var elemDim = parseFloat( Lib.utils.dom.css( element, type ) ),
				definedPaddings = dim == "Width" ? Paddings.Left + Paddings.Right : Paddings.Top + Paddings.Bottom;
	
			return elemDim + definedPaddings;
		};
		
		Lib.utils.dom["outer" + dim] = function(element) {
			var Borders = {};
			
			if(element == window) { return window["outer" + dim]; }
				
			each(["Top","Left","Bottom","Right"], function(pos) {
				Borders[pos] = parseFloat( Lib.utils.dom.css( element , "border-" + pos.toLowerCase() + "-width" ) ) ;
			});
			
			var elemDim = parseFloat( Lib.utils.dom.css( element, type ) );
				definedBorders = dim == "Width" ? Borders.Left + Borders.Right : Borders.Top + Borders.Bottom;
	
			return elemDim + definedBorders;
		};
		
		Lib.utils.dom[type] = function(element,val) {
			return element == window ?
			
				document.documentElement["client" + dim] :
				
				element == document ?
				
				Math.max(
					document.documentElement["client" + dim],
					document.body["scroll" + dim], document.documentElement["scroll" + dim],
					document.body["offset" + dim], document.documentElement["offset" + dim]
				):
				
				element["scroll" + dim];
		}
										   
	});
	
	each(["Top","Left"], function(name) {
		
		Lib.utils.dom["scroll" + name] = function(element, val) {
			if( typeof val !== "undefined" ) {
				if(element == window || element == document) {
					window.scrollTo(
						name == "Left" ? val : Lib.utils.dom.scrollLeft(window),
						name != "Left" ? val : Lib.utils.dom.scrollTop(window)
					);
				}
				else {
					elem["scroll" + name] = val;
				}
				
				return element;
			}
			else {
				if( element == document || element == window ) {
					var docElement = document.documentElement;
					
					return window.pageXOffset ? 
							window[name == "Top" ? "pageYOffset" : "pageXOffset"] :
						docElement && docElement.scrollTop ?
							docElement["scroll" + name] :
						document.body["scroll" + name];
				}
				else {
					return element["scroll" + name];
				}
			}
		};
		
	});
})(Lib.__proto.Element);

/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	var origContext = context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results.concat($A(selector));
	}

	var parts = [], m, set, checkSet, extra, prune = true, contextXML = isXML(context),
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	while ( (chunker.exec(""), m = chunker.exec(soFar)) !== null ) {
		soFar = m[3];
		
		parts.push( m[1] );
		
		if ( m[2] ) {
			extra = m[3];
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			var ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			var ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				var cur = parts.pop(), pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var filter = Expr.filter[ type ], found, item, left = match[1];
				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = part.toLowerCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				var nodeCheck = part = part.toLowerCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				var nodeCheck = part = part.toLowerCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			return match[1].toLowerCase();
		},
		CHILD: function(match){
			if ( match[1] === "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 === i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			} else {
				Sizzle.error( "Syntax error, unrecognized expression: " + name );
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					if ( type === "first" ) { 
						return true; 
					}
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first === 0 ) {
						return diff === 0;
					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, function(all, num){
		return "\\" + (num - 0 + 1);
	}));
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 );

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.compareDocumentPosition ? -1 : 1;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.sourceIndex ? -1 : 1;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.ownerDocument ? -1 : 1;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
function getText( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += getText( elem.childNodes );
		}
	}

	return ret;
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle, div = document.createElement("div");
		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function(query, context, extra, seed){
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && context.nodeType === 9 && !isXML(context) ) {
				try {
					return makeArray( context.querySelectorAll(query), extra );
				} catch(e){}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		div = null; // release memory in IE
	})();
}

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ? function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

window.Sizzle = Sizzle;

})();


/*
 * Info: The Library's necessary tool to traverse the DOM.
 * Note: You can enter CSS3 Selectors and then apply the class's chainable methods to all the queried elements.
 * Note No.2: There are several methods to achieve inheritance but this one seems to be the fastest in performance( Inspired by jQuery's inheritance ).
*/

(function() {		
	window.Query = Lib.utils.dom.query = function(selector,context) {
		return new Query.prototype.initialize(selector,context);
	};
			
	Query.methods = Query.prototype;
	
	Lib.Extend(Query, {
		extend: asMethod(Class.extend),
		addMethods: asMethod(Class.addMethods)
	});
		
	Query.extend({
		filter: function(selector, elems, remove) {
			return !Lib.utils.isNull(selector) ?
				( Lib.utils.isString(selector) ?
					Sizzle.matches(remove && remove === true ? ":not(" + selector + ")" : selector, $A(elems) ) :
					Lib.utils.array.reduceBy( Lib.utils.array.clone( $A(elems) ), Sizzle(selector) ) ) :
				elems;
		},
		
		Element: function(value) {
			var placeholder = document.createElement("div");
			
			if( Lib.utils.isString(value) ) {
				Lib.utils.dom.append(placeholder, value);
			}
			else if( Lib.utils.isObject(value) ) {
				var element = document.createElement(value.tag),
					style = value.style || {};
					
					if( Lib.utils.isObject(style) ) {
						for(var property in style) {
							element.style[property] = style[property];
						}
					}
					else if( Lib.utils.isString(style) ) {
						element.setAttribute("style", style);
					}
					
					element.innerHTML = value.html || value.innerHTML || "";
					
					for(var attr in value) {
						if(attr !== "tag" && attr !== "style" && attr !== "html" && attr !== "innerHTML") {
							element.setAttribute(attr, value[attr]);
						}
					}
				
				return element;
			}
			
			var childNodes = Array.prototype.slice.call( placeholder.childNodes );
	
			return {
				extend: function() { return Query( childNodes ); },
				expose: function() { return childNodes; }
			}
		}
	});
	
	Query.addMethods({	
		initialize: function(selector,context) {
			this.length = 0;
			
			Array.prototype.push.apply(this, !Lib.utils.isString(selector) ? (
				!Lib.utils.isArray(selector) ? [ selector ] : selector) :
				Sizzle(selector,context)
			);
			
			return this;
		},

		order: function() {
			return Lib.utils.array.inDocumentOrder(this);
		},

		make: function(selector,context) {
			return Query(selector,context);
		},
		
		add: function(selector,context) {
			return Query( Lib.utils.array.combine($A(this), Sizzle(selector,context) ) );
		},
		
		is: function(selector) {
			return !!selector && Query.filter(selector,this).length > 0;
		},
		
		expose: function(index) {
			return index ? this[index] : $A(this);
		},
		
		eq: function(index) {
			return Query( this[index] );
		},
		
		clone: function() {
			return Query( Lib.utils.array.map(this, function(elem) {
				return elem.cloneNode(true);
			}) );
		},
		
		each: function(callback) {
			Lib.utils.array.each(this, callback);
			return this;
		},
		
		find: function(selector) {
			return Query( Lib.utils.array.onItem(this, [], function(array,element) {
				return Lib.utils.array.combine(array, Sizzle(selector,element) );
			}) );
		},
		
		without: function(selector) {
			return Query( Query.filter(selector, $A(this), true) );
		},
		
		filter: function(selector) {
			return Query( Query.filter(selector, $A(this) ) );
		},
		
		parent: function(selector) {
			return Query( Query.filter(selector, Lib.utils.array.unique( Lib.utils.array.pluck( this, "parentNode") ) ) );
		},
		
		parents: function(selector) {
			return Query( Query.filter(selector, Lib.utils.array.onItem(this, [], function(array,element) {
				return Lib.utils.array.combine(array, Lib.utils.dom.parents(element) );
			}) ) );
		},
		
		children: function(selector) {
			return Query( Query.filter(selector, Lib.utils.array.onItem(this, [], function(array,element) {
				return array.concat( Lib.utils.dom.childNodes(element) );
			}) ) );
		},
		
		nextSibling: function(selector) {
			return Query( Query.filter(selector, Lib.utils.array.onItem(this, [], function(array,element) {
				return array.concat( [Lib.utils.dom.nextSibling(element)] );
			}) ) );
		},
		
		previousSibling: function(selector) {
			return Query( Query.filter(selector, Lib.utils.array.onItem(this, [], function(array,element) {
				return array.concat( [Lib.utils.dom.previousSibling(element)] );
			}) ) );
		},
		
		nextSiblings: function(selector) {
			return Query( Query.filter(selector, Lib.utils.array.onItem(this, [], function(array,element) {
				return Lib.utils.array.combine(array, Lib.utils.dom.nextSiblings(element) );
			}) ) );
		},
		
		previousSiblings: function(selector) {
			return Query( Query.filter(selector, Lib.utils.array.onItem(this, [], function(array,element) {
				return Lib.utils.array.combine(array, Lib.utils.dom.previousSiblings(element) );
			}) ) );
		},
		
		siblings: function(selector,notSelf) {
			return Query( Lib.utils.array.reduceBy(Query.filter(selector, Lib.utils.array.onItem(this, [], function(array,element) {
				return Lib.utils.array.combine(array, Lib.utils.dom.siblings(element) );
			}) ), selector === true || notSelf === true ? this.expose() : [ this[0] ] ) );
		},
		
		style: function(style,value) {
			return Lib.utils.dom.css(this,style,value);
		},
		
		innerHtml: function(value) {
			return value ?
				this.each(function(element) { element.innerHTML = value; }) :
				Lib.utils.array.pluck(this,"innerHTML");
		},
		
		outerHtml: function(value) {
			return Lib.utils.array.onItem(this, [], function(array,element) {
				array.push( Lib.utils.dom.outerHTML(element) );
				return array;
			});
		},
		
		innerText: function(value) {
			var legal = HTMLElement.prototype.innerText ? "innerText" : "textContent";
			return value ?
				this.each(function(element) { element[legal] = value; }) :
				Lib.utils.array.pluck(this, legal);
		},
		
		value: function(value) {
			return Lib.utils.isNull(value) ?
				this[0].value || this[0].text :
				this.each(function(element) { element.value = value; });
		},
		
		attr: function(attr,value) {
			return Lib.utils.isObject(attr) ?
					this.each(function(element) { for(var attribute in attr) { element.setAttribute(attribute,attr[attribute]); } }) :
				Lib.utils.isString(attr) && !Lib.utils.isNull(value) ?
					this.each(function(element) { element.setAttribute(attr,value) }) :
				this[0].getAttribute(attr);				
		},
		
		unsetAttr: function(attributes) {
			var attr = attributes;
			
			if( Lib.utils.isString(attributes) )  {
				attr = attributes.split(",");
			}
			
			return this.each(function(element) {
				Lib.utils.array.each(attr,function(attribute) { element.removeAttribute(attribute); });
			});
		},
		
		remove: function() {
			return this.each(function(element) {
				element.parentNode.removeChild(element);
			});
		},
		
		empty: function() {
			return this.each(function(element) {
				element.innerHTML = "";
			});
		}
			
	});
	
	Query.methods.initialize.prototype = Query.prototype;
		
	each(["append","prepend","insertAfter","insertBefore","addClass","removeClass","hasClass","toggleClass"], function(fnName) {
		Query.methods[fnName] = function(value) {
			return this.each(function(element,i) {
				Lib.utils.dom[fnName](element, i > 0 && Lib.utils.isElement(value) || Lib.utils.isText(value) ? value.cloneNode(true) : value);
			});
		}
	});	
	
	each(Event_names, function(eventName) {
		Query.methods[eventName] = function(callback) {
			this.bind(eventName,callback);
			return this;
		}
	});
	
	Query.addMethods({
		storeData: function(name, data) {
			return this.each(function(el) {
				Lib.utils.store.storeData(el, name, data);
			});
		},
		
		getData: function(name) {
			return Lib.utils.store.getData(this[0], name);
		},
		
		appendTo: function(selector) {
			var ret = [], elems = this;
			
			Query(selector).each(function(elem,i) {
				if( i > 0 ) { elems = elems.clone(); };
				
				Lib.utils.dom.append(elem, elems);
				
				ret = ret.concat(elems.expose());
			});
			
			return Query(ret);
		},
		
		prependTo: function(selector) {
			var ret = [], elems = this;
			
			Query(selector).each(function(elem,i) {
				if( i > 0 ) { elems = elems.clone(); };
				
				Lib.utils.dom.prepend(elem, elems);
				
				ret = ret.concat(elems.expose());
			});
			
			return Query(ret);
		},
		
		after: function(selector) {
			var ret = [], elems = this;
			
			Query(selector).each(function(elem,i) {
				if( i > 0 ) { elems = elems.clone(); };
				
				Lib.utils.dom.insertAfter(elem, elems);
				
				ret = ret.concat(elems.expose());
			});
			
			return Query(ret);
		},
			
		before: function(selector) {
			var ret = [], elems = this;
			
			Query(selector).each(function(elem,i) {
				if( i > 0 ) { elems = elems.clone(); };
				
				Lib.utils.dom.insertBefore(elem, elems);
				
				ret = ret.concat(elems.expose());
			});
			
			return Query(ret);
		},
		
		replaceWith: function(element) {
			this.insertBefore(element);
			this.remove();
			return this;
		},
		
		bind: function(type,callback) {
			return this.each(function(element) {
				Lib.utils.dom.addEvent(element, type, callback);
			});
		},
		
		unbind: function(type,callback) {
			return this.each(function(el) {
				Lib.utils.dom.removeEvent(el, type, callback);
			});
		},
		
		trigger: function(type) {
			return this.each(function(el) {
				Lib.utils.dom.triggerEvent(el, type);
			});
		},
		
		hover: function(callbackOver,callbackOut) {
			return this.each(function(element) {
				Lib.utils.dom.hover(element,callbackOver,callbackOut);
			});
		},
		
		ready: function(callback) {		
			return this.each(function(element) {
				Lib.utils.dom.ready(element,callback);
			});	
		}
	});
	
	Query.extend({
		queue: function(element, name, data) {
			if ( element ) {
		
				name = (name || "fx") + "queue";
		
				var q = Lib.utils.store.getData(element, name);

				if ( !q || Lib.utils.isArray(data) ) {
					q = Lib.utils.store.storeData(element, name, $A(data));
				}
				else if( data ) {
					q.push(data);
				}
		
			}
			return q;
		},
		
		dequeue: function(element, name) {
			var queue = Query.queue(element, name),
				fn = queue.shift();
			
			if( !name || name === "fx" ) {
				fn = queue[0];
			}
				
			if( fn !== undefined ) {
				fn(element);
			}
		}
	});
	
	Query.addMethods({
		queue: function(type, data) {
			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
			}
	
			if ( data === undefined ) {
				return Query.queue(this[0], type);
			}
	
			return this.each(function(element) {
				var queue = Query.queue(element, type, data);

				if(type == "fx" && queue.length == 1) {
					queue[0](element);
				}
			});
		},
		dequeue: function(type){
			return this.each(function(element) {
				Query.dequeue(element, type);
			});
		}
	});
	
	/*
	 * Info: Under implementation. The effects class for the library.
	*/
	
	Lib.utils.animation = {
				
		manage: {
			"opacity": function(opt) {				
				opt.element.style.opacity = opt.now;
			}
			
		},
			
		defaults: {
			opacity: 1
		}
	};
	
	var styleDimensions = ["borderLeftWidth","borderTopWidth","borderRightWidth","borderBottomWidth","marginLeft","marginTop","marginRight","marginBottom","paddingLeft","paddingTop","paddingRight","paddingBottom","outlineWidth","fontSize","width","height"], timerId, timerId2;
	
	each(styleDimensions, function (name) {
		Lib.utils.animation.manage[name] = function(opt) {
			opt.element.style[name]  = opt.now + opt.unit;
		};
	});
	
	each(["backgroundColor", "borderBottomColor","borderColor","borderLeftColor", "borderRightColor", "borderTopColor", "color", "outlineColor"], function(name) {
		Lib.utils.animation.manage[name] = function(opt) {			
			opt.element.style[name] = "rgb(" + opt.now.join(",") + ")";
		}
																																			 
	});
	
	Query.timers = [];
	
	var wholeStyles = {
		borderColor: ["borderBottomColor","borderTopColor","borderRightColor","borderLeftColor"],
		borderWidth: ["borderLeftWidth","borderTopWidth","borderRightWidth","borderBottomWidth"]
	};
	
	var conversions = {
		em: { px: 16, pt: 12, cm: 0.42, mm: 4.235, "in": 0.16, pi: 1, "%": 100 },
		
		mm: { px: 3.7, pt: 2.8, cm: 0.1, "in": 0.03, pi: 0.23, em: 0.23, "%": 23.64 },
		
		cm: { px: 37, pt: 28, mm: 10, "in": 0.39, pi: 2.3, em: 2.3, "%": 236.4 },
		
		px: { pt: 0.75, cm: 0.02, mm: 0.26, "in": 0.01, pi: 0.06, em: 0.06, "%": 6.25 },
		
		pt: { px: 1.33, cm: 0.03, mm: 0.35, "in": 0.01, pi: 0.08, em: 0.08, "%": 8.33 },
		
		"in": { px: 96, pt: 72, cm: 2.54, mm: 25.4, pi: 6, em: 6, "%": 625 },
		
		"%": { px: 0.16, pt: 0.12, cm: 0.0042, mm: 0.04235, "in": 0.0016, pi: 0.01, em: 0.01 }
		
	};
	
	function convert(from, to) {
		var values = from.split(/(pt|px|in|em|cm|mm|pi|ex)/);
		var number = parseFloat(values[0] || 1);
		var unit = (values[1] || "px").replace(/pi/gi,"em");
				
		return unit === to ? number + unit : ((number * conversions[unit][to])) + to;
	}
	
	function parseParams(speed, easing, complete, queue) {
		if( Lib.utils.isFunction(easing) ) { complete = easing; }
		
		if( typeof queue === "undefined" ) {
			if( Lib.utils.isBoolean(easing) ) { queue = easing; }
			else if( Lib.utils.isBoolean(complete) ) { queue = complete; }
			else { queue = true; }
		}
		
		var options = {
			duration: Animator.Speed(speed),
			easing: easing,
			complete: function(element) {
				if( this.queue !== false ) {
					Query(element).dequeue();
				}
				if( Lib.utils.isFunction(complete) ) {
					complete(element);
				}
			},
			queue: queue
		};
		
		return options;
	}
	
	var Animator = window.Animator = function(element, options, key) {
			this.options = options;
			this.key = key;
			this.easing = options.ease;
			this.element = element;
			
			return this;
	};
	
	Lib.Extend(Animator, {
		easingDefault: function(name) {
			Animator.Tween.fallback = name;
		},
		
		Tween: {
			fallback: "linear",
			
			linear: function(t, b, c, d) {
				return c*t/d + b;
			}
		},
		
		Speeds: {
			"xx-slow": 	4000,
			"x-slow": 	2500,
			"slow": 	1200,
			"normal":	800,
			"fast": 	600,
			"x-fast": 	400,
			"xx-fast":	200
		},
		
		Speed: function(speed) {
			return speed ? (Lib.utils.isString(speed) ? Animator.Speeds[speed] || 800 : speed) : 800; 
		},
		
		addSpeed: function(name, value) {
			Animator.Speeds[name] = value;
		}
	});
	
	Animator.prototype = {
		calculate: function() {
			var cur = Lib.utils.dom.css(this.element, this.key);
			var end = ("" + this.options.animation[this.key]).replace(/\s/g,"");
			var relative = /(-|\+)=/.exec(end);
			
			var numStart = parseFloat(cur || 1);
			var numEnd = parseFloat(end);
			
			this.start = isNaN(numStart) ? cur : Math.round(numStart);
			this.end = relative ? ( ( parseFloat(end.substring(2)) * (relative[1] === "-" ? -1 : 1) ) + this.start) : (isNaN(numEnd) ? end : numEnd);
			this.delta = this.end - this.start;
	

			var unit = (/(pt|px|in|em|cm|mm|pi|ex)$/).exec(end);
			
			this.unit = unit ? unit[1] : "px";
						
			if( /fontSize/.test(this.key) ) {
				var prevUnit = (/(pt|px|in|em|cm|mm|pi|ex)$/).exec(cur)[1];
				
				if( relative ) {
					end = end.substring(2);
					var converted = parseFloat(convert(end, prevUnit));
					
					this.end = converted * (relative[1] === "-" ? -1 : 1) + this.start;
				}
				else {
					this.end = parseFloat(convert(end,prevUnit));
				}
				
				this.unit = prevUnit;
				this.delta = this.end - this.start;
			}
			
			if( /color/i.test(this.key) ) {
				this.start = Lib.utils.color.convert(cur);
				this.end = Lib.utils.color.convert(this.end);
								
				this.delta = [];
				
				for(var i = 0, l = this.start.length; i < l; ++i) {
					this.delta.push( this.end[i] - this.start[i] );
				}
				
			}
			
			return this;
		},
		
		step: function() {
			return Lib.utils.animation.manage[this.key](this);
		},
		
		animate: function() {
			this.calculate();
			this.startTime = getDate();
			this.now = this.start;
			
			var self = this;
			var timer = function() {
				return self.move();
			};
			
			timer.element = this.element;
			
			if( timer() && Query.timers.push(timer) && !timerId ) {
				timerId = window.setInterval(function() {
					var timers = Query.timers;
	
					for ( var i = 0; i < timers.length; i++ ) {
						if ( !timers[i]() ) {
							timers.splice(i--, 1);
						}
					}
	
					if ( !timers.length || timers.length === 0 ) {
						window.clearInterval( timerId );
						timerId = undefined;
					}
					
				}, 13);
			}
		},
		
		move: function() {
			this.animationTime = getDate();
			this.elapsedTime = this.animationTime - this.startTime;
			
			if( this.elapsedTime >= this.options.duration ) { // Animation Completed
				this.now = this.end;
				
				this.step();
				
				this.options.animation[ this.key ] = true;
				
				var done = true;
				
				for(var n in this.options.animation) {
					if( this.options.animation[n] !== true ) {
						done = false;
					}
				}
				
				if( done ) {
					this.options.complete( this.element );
				}
				
				return false;
			}
			else {				
				// Provide the right values for color animations
				if( /color/i.test(this.key) ) {
					this.now = [
						Math.max(Math.min(parseInt(this.easing(this.elapsedTime, this.start[0], this.delta[0], this.options.duration)),255),0),
						Math.max(Math.min(parseInt(this.easing(this.elapsedTime, this.start[1], this.delta[1], this.options.duration)),255),0),
						Math.max(Math.min(parseInt(this.easing(this.elapsedTime, this.start[2], this.delta[2], this.options.duration)),255),0)
					];
				}
				else {
					this.now = this.easing(this.elapsedTime, this.start, this.delta, this.options.duration)
				}
										
				this.step();
			}
			
			return true;
		}
	};
				
	Query.addMethods({
		animate: function(animation, speed, easing, complete, queue) {
			for(var prop in animation) {
				if(prop in wholeStyles) {
					Lib.Extend(animation, Lib.utils.array.onItem(wholeStyles[prop], {}, function(obj, key) {
						obj[key] = animation[prop];
						return obj;
					}));
					
					delete animation[prop];
				}
			}
			
			var params = parseParams(speed, easing, complete, queue);
			params.ease = Animator.Tween[params.easing] || Animator.Tween[Animator.Tween.fallback];
			
			return this[ params.queue === false ? "each" : "queue" ](function(element) {
				var options = Lib.Extend({
					animation: Lib.Extend({}, animation)
				}, params);
				
				element.style.overflow = "hidden";
				element.style.display = "block";
				
				each.object(animation, function(val, name) {
					var anim = new Animator(element, options, name);
					
					anim.animate();
				});
			});
		},
		
		hide: function(speed, easing, complete) {
			return this.animate({
				width: 0,
				height: 0,
				opacity: 0,
				borderWidth: 0
			}, speed, easing, complete);
		},
		
		show: function(speed, easing, complete) {
			return this.animate({
				width: "500px",
				height: "200px"
			}, speed, easing, complete).css("display","block");
		},
		
		fadeOut: function(speed, easing, complete) {
			return this.animate({ opacity: 0 }, speed, easing, complete);
		},
		
		fadeIn: function(speed, easing, complete) {
			return this.animate({ opacity: 1 }, speed, easing, complete);
		}
	});
	
})();

})();
