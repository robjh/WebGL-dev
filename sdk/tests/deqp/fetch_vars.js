#!/usr/bin/env js

var filename = scriptArgs[0];

/**
 * Loads the file and pulls the nodes corresponding to the variable
 * declarations. The names are returned in an array of strings
 */
function fetchVariableNames (filename) {
	var source = read(filename);
	expr = Reflect.parse(source).body[0].expression;
	var lastElement = expr.arguments.length - 1;

	var names = [];

	for (var i in expr.arguments[lastElement].body.body) {
		variableDeclarations = expr.arguments[lastElement].body.body[i];

		if (variableDeclarations.type == 'VariableDeclaration') {
			for (var j in variableDeclarations.declarations) {
				var identifiers = variableDeclarations.declarations[j];

				if (identifiers.id.type == 'Identifier') {

					names.push(identifiers.id.name);
				}
			}
		}
	}

	return names;
}


/**
 * Loads the file and pulls the nodes corresponding to the dependencies
 * declarations. The names are returned in an array of strings
 */
function fetchDependencies(filename) {
	var source = read(filename);
	expr = Reflect.parse(source).body[0].expression;

	var dependecies = [];

	for (var i in expr.arguments[0].elements) {
		dependecies.push(expr.arguments[0].elements[i].value);
	}

	return dependecies;

}

try {
	var names = fetchVariableNames(filename);
	var dependencies = fetchDependencies(filename);

	print(names);
	print('&');
	print(dependencies);
} catch (e) {
	print('');
}

// '/home/malo/projects/webgl-tests/WebGL-dev/sdk/tests/deqp/framework/delibs/debase/deRandom.js'
// '/home/malo/projects/webgl-tests/WebGL-dev/sdk/tests/deqp/framework/common/tcuTexture.js'


// var l5 = '';
// function DumpObjectIndented(obj, indent, level)
// {
//   var result = "";
//   if (indent == null) indent = "";
//   if (level == null) level = 0;

//   for (var property in obj)
//   {
//     var value = obj[property];
//     if (typeof value == 'string')
//       value = "'" + value + "'";
//     else if (typeof value == 'object')
//     {
//       if (value instanceof Array)
//       {
//         v = "[\n";
//         for (var i = 0; i < value.length; i++) {
//             v += DumpObjectIndented(value[i], indent + " ", level + 1);
//         }
//         v += "]";
//         value = v;
//       }
//       else
//       {
//         // Recursive dump
//         // (replace "  " by "\t" or something else if you prefer)
//         var od = DumpObjectIndented(value, indent + "  ", level + 1);
//         // If you like { on the same line as the key
//         //value = "{\n" + od + "\n" + indent + "}";
//         // If you prefer { and } to be aligned
//         value = "\n" + indent + "{\n" + od + "\n" + indent + "}";
//       }
//     }
//     // print("level: " + level);
//     if (parseInt(level) == 5) {
//     	//print('IS 5');
//     	l5 += "<" + level + ">" + indent + "'" + property + "' : " + value + ",\n";
// 	} else {
// 		// print ('not 5');

// 	}
// 	result += "<" + level + ">" + indent + "'" + property + "' : " + value + ",\n";
//   }
//   return result.replace(/,\n$/, "");
// }
