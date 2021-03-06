/**
 * Created by Michael on 4/03/14.
 */
var esprima, scope, Scope, falafel, utils, moduleName, tmpl, fs, config, exec, ast, current;
falafel = require('falafel');
tmpl = require('./utils');
fs = require('fs');
config = require('./config');
sh = require('execSync');
scope = require('./scope');
Scope = scope.Scope;
esprima_parse = require('esprima').parse;
ast = require('./ast');
current = require('./current');

/**
 * This little function calls synchronously to typescript to compileTs a piece of code.
 * Improvement: just wait until all callbacks have happened before printing the result on the end?
 * @param source
 * @param callback
 */
var compileTs = function(source, callback) {
    var filename = "_temp.ts";
    fs.writeFileSync(filename, source);
    var result = sh.exec('tsc '+ filename + ' --out '+ filename);
    result = fs.readFileSync(filename, "utf8");
    callback(result);
};

/* patch string to easily chain to add semicolons */
String.prototype.addSemiColon = function() {
    var pattern = /;$/;
    if (pattern.test(this)) {
        return this;
    }
    if (this.toString() === "") {
        return this;
    }
    return this + ";";
};

/* findIndex according to ES6. This is implemented in Chrome (V8) but not in ts-to-contracts. */
if (typeof Array.prototype.findIndex === 'undefined') {
    Array.prototype.findIndex = function (predicate, thisValue) {
        var arr = Object(this);
        if (typeof predicate !== 'function') {
            throw new TypeError();
        }
        for(var i = 0; i < arr.length; i++) {
            if (i in arr) {
                var elem = arr[i];
                if (predicate.call(thisValue, elem, i, arr)) {
                    return i;
                }
            }
        }
        return -1;
    };
}


utils = (function (utils) {

    var registeredClasses = {};
    var registeredModules = {};

    var prefix = config.contracts_prefix;

    var merge = function(o1, o2) {
        var prop, o3, f;
        o3 = {};
        f = function(o) {
            for (prop in o) {
                if (o.hasOwnProperty(prop)) {
                    o3[prop] = o[prop]
                }
            }
        };
        f(o1);
        f(o2);
        return o3;
    };

    var identifiable = {
        "setIdentifier": function(id) { this.id = id;},
        "getIdentifier": function() { return this.id;}
    };


    var ClassContract = (function () {
        var ClassContract = function(name, instanceMembers, staticMembers, _super, implementing, constructor) {
            var i, item;
            this.name = name;
            this.instanceMembers = instanceMembers || {"body": []};
            this.staticMembers = staticMembers || {"body": []};

            this.constructor = constructor;

            this.superclass = _super;
            this.implementing = implementing;

            this.instancecontract = utils.processInterface(this.instanceMembers);
            if (typeof _super !== "undefined") {
                this.instancecontract.extend(_super);
            }
            if (typeof this.implementing !== "undefined") {
               for (i = 0; i < this.implementing.length; i ++) {
                   item = this.implementing[i];
                   this.instancecontract.extend(item.id.name);
               }
            }
            this.classcontract = utils.processInterface(this.staticMembers);
            this.classcontract.setOpts({"class": this.instancecontract.toContract()});
            this.classcontract.newType = this.constructor;
        };

        ClassContract.prototype = Object.create(identifiable);

        ClassContract.prototype.toContract = function() {
            return this.classcontract.toContract();
        };

        return ClassContract;
    })();

    var FunctionContract = (function () {

        var FunctionContract = function(argTypes, returnType, opt) {
            this.overloads = [];
            this.argTypes = argTypes;
            this.returnType = returnType;
            if (typeof opt === 'undefined') {
                this.opt = {};
            } else {
                this.opt = opt;
            }
        };

        FunctionContract.prototype.push = function(overload) {
            this.overloads.push(overload);
        };

        FunctionContract.prototype.toContract = function () {
            var funcontract = fun(this.argTypes, this.returnType, this.opt);
            if (this.overloads.length > 0) {
                var overloads = this.overloads.map(function(o) { return fun(o.argTypes, o.returnType, o.opt); });
                return overload([].concat([funcontract], overloads));
            }
            return funcontract;
        };

        return FunctionContract;
    })();

    var OverloadContract = (function (){
        var OverloadContract = function(contracts) {
           this.contracts = contracts;
        };

        OverloadContract.prototype.push = function(e) {
            if (this.contracts && Array.isArray(this.contracts)) {
                this.contracts.push(e);
            }
        };

        OverloadContract.prototype.toContract = function() {
            var newcontracts = [];
            for(var i = 0; i < this.contracts.length; i++) {
                if (typeof this.contracts[i].toContract !== "undefined") {
                    newcontracts[i] = this.contracts[i].toContract();
                }
            }
            return overload(newcontracts);
        };

       return OverloadContract;
    })();

    var ObjectContract = (function () {
        var ObjectContract = function(name, keys, values, callType, newType) {
            this.name = name;
            this.keys = keys;
            this.values = values;
            this.opt = {};
            this.callType = typeof callType !== 'undefined' ? callType : false;
            this.newType = typeof newType !== 'undefined' ? newType : false;
            this.extends = [];
        };

        ObjectContract.prototype.setOpts = function(opt) {
            this.opt = merge(this.opt, opt);
        };

        ObjectContract.prototype.extend = function(k) {
            this.extends.push(k);
        };

        ObjectContract.prototype.toContract = function () {
            var obj;
            obj = tmpl("object", {"name": this.name, "keys": this.keys, "values": this.values, "opt": this.opt});
            if (this.callType && this.newType) {
                obj = and(obj, fun_new_call(this.newType, this.callType));
            }
            else if (this.newType) {
                obj = and(this.newType.toContract(), obj);
            }
            else if (this.callType) {
                obj = and(this.callType.toContract(), obj);
            }
            for (var i = 0; i < this.extends.length; i ++) {
                var k = this.extends[i];
                if (typeof k.toContract === "function") {
                    k = k.toContract();
                }
                obj = new ExtendContract(obj, k).toContract();
            }
            return obj;
        };
        return ObjectContract;
    })();

    /***
     * If the name is a literal, we are talking about external modules.
     * These can be used with Typescript's, import/require syntax!
     * When we have an "export = type" expression, all the rest is irrelevant and doesn't matter no more.
     * For the rest, internal and external modules have the same capabilities.
     */
    var ModuleContract = (function () {
        var ModuleContract =  function(name, objContract) {
            if (name.type === "Literal") {
                this.moduleName = name.value;
                this.external = true;
            } else {
                this.moduleName = name.name;
                this.external = false;
            }
            this.moduleContract = objContract;
            this.moduleContract.setOpts({"forgiving": true});
            //we push just plain source for interfaces, nothing needs to change!
            this.interfaces = [];
            //we push the contract here, because we need to adapt it because we deal with a class within a module
            this.classes = [];
            this.modules = [];
        };

        ModuleContract.prototype = Object.create(identifiable);

        /**
         * an interface is a type, but you should be able to reference it from outside
         * and in the same file if it is ambient (either external or internal)
         * If it is an implementation then export does really matter.
         * @param objectContract
         */
        ModuleContract.prototype.addInterface = function(objectContract) {
            this.interfaces.push(objectContract);
        };

        ModuleContract.prototype.addClass = function(objectContract) {
            this.classes.push(objectContract);
        };

        // doesn't work just yet.
        ModuleContract.prototype.addModule = function(moduleContract) {
            this.modules.push(moduleContract);
        };

        /***
         * First print all interfaces, then classes, locally defined(!)
         * then the object contract that uses these contracts
         */
        ModuleContract.prototype.toContract = function() {
            var i, result, defined_classname, defined_instancename, classname, idx, keys;
            result = "";
            for (i = 0; i < this.interfaces.length; i ++) {
                result = result + this.interfaces[i];
            }
            for (i = 0; i < this.classes.length; i ++) {
                // we register but here, when we are "sure" the variable needs to exist.
                classname = this.classes[i].name;
                /**
                 * we do this for the following reason:
                 * a class "as a type" is just how an instance should look (so the prototype contract)
                 * while the actual class needs to be guarded by a class contract.
                 * I.e. the actual class "Model" needs to be guarded by the full contract,
                 * but an instance could have type "Model", however it is not a function nor does it have
                 * any of the static properties of "Model" class.
                 */
                defined_classname = scope.utils.registerVariable(classname + "_class");
                defined_instancename = Scope.getScope(this.classes[i].id).lookup(classname);
                //we can here substitute since we defined the name for it.
                this.classes[i].classcontract.setOpts({"class": defined_instancename});
                //substitute the name in the contract for the one we "registered" to be defined.
                keys = this.moduleContract.keys;
                idx = keys.findIndex(function (e) { return e.name === classname });
                this.moduleContract.values[idx] = defined_classname;
                result = result + defineVariable(defined_instancename, this.classes[i].instancecontract.toContract());
                result = result + defineVariable(defined_classname, this.classes[i].toContract());
            }
            return result;
        };

        return ModuleContract;
    })();

    var ExportContract = (function () {
        var ExportContract = function (module, id, type) {
            this.module = module;
            if (id.type === "Literal") {
                this.external = true;
                this.name = id.value;
            } else {
                this.external = false;
                this.name = id.name;
            }
            this.type = type;
        };

        ExportContract.prototype.toContract = function () {
            var result, new_name, modulecontract;
            if (typeof moduleName === "undefined") {
                return "";
            }
            if (this.external) {
                modulecontract = Scope.getScope(this.module.range).lookup(moduleName);
                result = tmpl("exportdeclaration", { value: guard(modulecontract, moduleName) }).addSemiColon();
                result = result + prefix + "setExported(exports," + "'" + moduleName + "')";
            } else {
                new_name = scope.utils.registerVariable(this.moduleName);
                result = defineVariable(new_name, this.type);
            }
            return result;
        };

        return ExportContract;
    })();

    var ExtendContract = (function() {
        var ExtendContract = function(k1, k2) {
            this.k1 = k1;
            this.k2 = k2;
        };

        ExtendContract.prototype.toContract = function() {
            var result = tmpl("extend", {"orig": this.k1, "extending": this.k2});
            return result;
        };

        return ExtendContract;
    })();

    var convertToDefault = function (declaration) {
        var res, id, array;
        id = declaration.name;
        array = declaration.array;
        switch (id) {
            case 'string':
                res = prefix + "Str";
                break;
            case 'number':
                res = prefix + "Num";
                break;
            case 'boolean':
                res = prefix + "Bool";
                break;
            case 'any':
                res = prefix + "Any";
                break;
            case 'void':
                res = prefix + "Undefined";
                break;
            case 'Function':
                res = prefix + "Fun";
                break;
            case 'Array':
                res = prefix + "Arr(" + prefix + "Any)";
                break;
            case 'Object':
                res = new ObjectContract("Object", [], []).toContract();
                break;
            case 'RegExp':
                res = prefix + "RegExp";
                break;
            default:
                res = current.lookup(id);
                if (!res) {
                    console.log("WARN: The variable " + id + " was not found in scope!");
                    res = prefix + "Any";
                }
        }
        if (typeof array !== 'undefined' && array) {
            /* We can't support Arrays just now, they are broken!
             * Any [].concat or Array.isArray call will fail horribly!
             * We could avoid wrapping, but that's the same as not doing anything
             * since object contracts are only checked when a property is accessed.
             * Therefore, we just use the Any type for arrays.
             *
             * A possible fix: change contracts.js to use the new Proxy API.
             * This should be possible when using harmony-reflect, the shim for direct proxies.
             */

            //this just does a check and then passes through the array.
            //we could also support typed arrays here, but there is no guarantee that the user enters wrong values
            res = prefix + "Arr(" + res + ")"
        }
        return res;
    };

    var returnAnyType = function () {
        return prefix + "Any";
    };

    var guard = function (contract, guarded) {
        return tmpl("guard", {"contract": contract, "guarded": guarded, "module": moduleName});
    };

    var fun = function (dom, codom, opt) {
        if (typeof opt === "undefined") {
            opt = {};
        }
        return tmpl("fun", {"dom": dom, "rng": codom, "opt": opt});
    };

    var fun_new_call = function (newHandler, callHandler) {
        return tmpl("fun_new_call",
            {"newdom": newHandler.argTypes, "newrng": newHandler.returnType,
             "calldom": callHandler.argTypes, "callrng": callHandler.returnType});
    };

    var and = function (k1, k2) {
        return tmpl("and", {"contract1": k1, "contract2": k2});
    };

    var or = function (k1, k2) {
        return tmpl("or", {"contract1": k1, "contract2": k2});
    };

    var optional = function (str) {
        return tmpl("optional", {"contract": str});
    };

    var overload = function (arr){
        return tmpl("overload", {"contracts": arr});
    };

    var wrapFunction = function (dom, codom, node, name) {
        var prefix = "";
        if (typeof name !== 'undefined') {
            node.id.update('');
            prefix = config.toplevel_var + name + " = ";
        }
        return prefix + guard(fun(dom, codom), node.source());
    };

    var processDeclaration = function (declaration) {
        var type;
        if (typeof declaration !== 'undefined') {
            if (ast.isTypeDeclaration(declaration)) {
                type = convertToDefault(declaration);
            }
            else if (ast.isFunctionTypeDeclaration(declaration)) {
                type = higherorderParams(declaration).toContract();
            }
            else if (ast.isObjectTypeDeclaration(declaration)) {
                type = processInterface(declaration).toContract();
            }
        }
        else {
            type = returnAnyType();
        }
        if (typeof declaration !== 'undefined' && typeof declaration.optional !== 'undefined' && declaration.optional) {
            type = optional(type);
        }
        return type;
    };

    var higherorderParams = function (type) {
        //we have a function contract anyway! Any->Any worst case
        var i, param, types, returnType, declaration, opts;
        opts = {};
        types = [];
        for (i = 0; i < type.expression.params.length; i++) {
            param = type.expression.params[i];
            declaration = param.typeDeclaration;
            if (typeof declaration !== 'undefined') {
                types.push(processDeclaration(declaration));
            }
        }
        if (type.expression.rest !== null && typeof type.expression.rest.typeDeclaration !== 'undefined') {
            delete type.expression.rest.typeDeclaration.array;
            opts["rest"] = processDeclaration(type.expression.rest.typeDeclaration);
        }
        if (typeof type.expression.returnType !== 'undefined') {
            returnType = convertToDefault(type.expression.returnType);
        }
        else {
            returnType = returnAnyType();
        }
        if (types.length === 0) {
            types = "";
        }
        return new FunctionContract(types, returnType, opts);
    };

    var processParams = function (node) {
        var types, returnType, param, i, paramsLength, declaration, opts;
        opts = {};
        types = [];
        paramsLength = node.params.length;
        for (i = 0; i < paramsLength; i++) {
            param = node.params[i];
            declaration = param.typeDeclaration;
            if (typeof declaration !== 'undefined') {
                param.typeDeclaration.update('');
                types.push(processDeclaration(declaration));
            }
        }
        if (typeof node !== 'undefined' && typeof node.returnType !== 'undefined') {
            node.returnType.update('');
            returnType = convertToDefault(node.returnType);
        }
        if (typeof node.expression.rest !== 'undefined' && node.expression.rest !== null && typeof node.expression.rest.typeDeclaration !== 'undefined') {
            //we delete this so process declaration won't return us an array contract
            delete node.expression.rest.typeDeclaration.array;
            opts["rest"] = processDeclaration(node.expression.rest.typeDeclaration);
        }
        else {
            returnType = returnAnyType();
        }
        if (types.length === 0) {
            types = "";
        }
        return new FunctionContract(types, returnType, opts);
    };

    var processInterface = function (node) {
        var name, item, key, value, values, i, j, keys, callType, newType, delayed;
        if (typeof node.name !== 'undefined') {
            name = node.name.name;
        }
        keys = [];
        values = [];
        delayed = [];
        //we set the current each time we need scope access
        //we do this when and only when we are dealing with a real AST ts-to-contracts!
        if (typeof node.range !== "undefined" && node.type !== "ObjectTypeDeclaration") {
            current.set(node, name);
        }
        for (i = 0; i < node.body.length; i++) {
            item = node.body[i];
            key = item.key;
            value = item.value;


            if (typeof item.functionType !== 'undefined') {
                if(callType) {
                    callType.push(higherorderParams(item.functionType));
                } else {
                    callType = higherorderParams(item.functionType);
                }
            }
            else if (item.type === "IndexDeclaration") {
                //todo: implement, but how? they are inherently also array contracts which we cant do
            }
            else if (item.key.name === 'new' /*&& ts-to-contracts.type === 'InterfaceDeclaration'*/) {
                if(typeof newType !== "undefined"){
                    newType.push(higherorderParams(value.typeDeclaration));
                } else {
                    newType = higherorderParams(value.typeDeclaration);
                }
            }
            else {
                if (typeof value.typeDeclaration !== 'undefined') {
                    value = processDeclaration(value.typeDeclaration);
                    if (keys.some(function(e) { return e.name === key.name;})) {
                        var inDelayed = false;

                        for (j = 0; j < delayed.length; j++) {
                            if (delayed[j].key.name === key.name){
                                delayed[j].contracts.push(value);
                                inDelayed = true;
                                break;
                            }
                        }
                        if (!inDelayed){
                            delayed.push({"key": key, "contracts": [value]});
                        }

                    } else {
                        keys.push(key);
                        values.push(value);
                    }
                }
            }
        }
        delayed.forEach(function(e) {
            var idx = keys.findIndex(function(el){return el.name === e.key.name});
            keys.splice(idx, 1);
            var k = values[idx];
            values.splice(idx, 1);
            e.contracts.push(k);
        });

        //add delayed contracts
        for (j=0; j < delayed.length; j ++) {
            keys.push(delayed[j].key);
            values.push(overload(delayed[j].contracts));
        }
        return new ObjectContract(name, keys, values, newType, callType);
    };

    /* only slightly differs from processing interfaces
     * but different implementations will allow to diverge
     */
    var processModule = function (node) {
        var name, keys, types, body, i, item, key, declaration, object, module, contract;
        name = node.id.name;
        object = new ObjectContract(name, [], []);
        module = new ModuleContract(node.id, object);
        module.setIdentifier(node.range);
        keys = object.keys;
        types = object.values;
        body = node.body;

        if (typeof node.range !== "undefined") {
            current.set(node, name);
        }

        for (i = 0; i < body.length; i++ ) {
            item = body[i];
            key = item.id;
            if (typeof item.typeDeclaration !== 'undefined') {
                declaration = item.typeDeclaration;
                if (declaration.type === "InterfaceDeclaration") {
                    module.addInterface(declaration.source());
                }
                else if (ast.isClass(declaration)) {
                    /* whenever we process a class, we put it in a hashmap */
                    contract = getClass(declaration);
                    console.log(contract.name);
                    module.addClass(contract);
                    keys.push({"name": contract.name});
                    types.push(contract.name);
                }
                else if (ast.isModule(declaration)) {
                    //todo: add scoping for nested modules
                    contract = getModule(declaration);
                    module.addModule(contract);
                    keys.push({"name": contract.moduleName});
                    types.push(contract.moduleName);
                }
                else {
                    //don't add to scope of a module: these don't produce actual types.
                    keys.push(key);
                    current.set(item.typeDeclaration, key.name);
                    types.push(processDeclaration(item.typeDeclaration));
                }
            } else if (ast.isModuleExportStatement(item)) {
                //return a module that will just assign exports to be equal to the contract
                //and then also wrap the name of the contract.
                return new ExportContract(node, node.id, item.id);
            } else {
                keys.push(key);
                types.push(returnAnyType());
            }
        }
        putModule(node, module);
        return module;
    };

    /***
     *
     * @param node
     */
    var processClass = function (node) {
        /* constructor.opt = {"newOnly": true};
         * we turn this off for now: the combination of object and function contract borks when
         * we use newonly in this case of classes */
        var className, staticMembers, instanceMembers, elements, key, value, constructor, contract, _super, implementing;
        className = node.id.name;
        staticMembers = {"body": []};
        instanceMembers = {"body": [],"name": {"name": className}};
        constructor = [];
        elements = node.body;

        if (node.range != null) {
            current.set(node, className);
        }

        /* split in instance and static members */
        for (var i = 0; i < elements.length; i++) {
            value = elements[i].value;
            key = elements[i].key;
            if (typeof value.static !== 'undefined' && value.static) {
                staticMembers.body.push(elements[i]);
            }
            else if (key.name === 'constructor') {
                constructor.push(utils.higherorderParams(value.typeDeclaration));
            } else {
                instanceMembers.body.push(elements[i]);
            }
        }
        if (typeof node.superClass !== "undefined") {
            _super = Scope.getScope(node.range).lookup(node.superClass.name);
        }
        if (typeof node["implements"] !== "undefined") {
            implementing = node["implements"];
        }
        //if multiple constructor signatures
        if (constructor.length === 1) {
            constructor = constructor[0];
        } else if (constructor.length > 1) {
            constructor = new OverloadContract(constructor);
        } else {
            constructor = void 0;
        }
        contract =  new ClassContract(className, instanceMembers, staticMembers, _super, implementing, constructor);
        contract.setIdentifier(node.range);
        putClass(node, contract);
        return contract;
    };

    var defineVariable = function(name, value) {
        return tmpl("declaration", {"name": name, "value": value});
    };

    var defineExportVariable = function(name, value) {
        return tmpl("exportdeclaration", {"name": name,"value": value});
    };

    var getParamsList = function (node) {
        var i, params;
        params = [];
        for (i = 0; i < node.params.length; i++) {
            params.push(node.params[i].name);
        }
        return params;
    };

    /***
     * "hashing" on range is pretty safe here.
     */
    var hashUtils = (function(hashUtils) {
        hashUtils.put = function(obj) {
            return function (key, value) {
              var hashkey = key.range[0];
              var prop;
              for (prop in obj) {
                  if (obj.hasOwnProperty(prop) && prop === key) {
                      throw new Error("Key: "+ key + " was already registered in "+ obj);
                  }
              }
              obj[hashkey] = value;
            };
        };

        hashUtils.get = function(obj) {
            return function(key) {
                var hashkey = key.range[0];
                var result = obj[hashkey];
                if (typeof result !== 'undefined') {
                    return result
                }
                throw new Error("Key "+ key + " was not found in:"+ obj);
            }
        };

        return hashUtils;
    })(hashUtils || {});

    /*
     * Registers classes in a hash; if a class resides in a module, it can be easily retrieved;
     * this is useful to reify nested things we still want to interpret differently and access their
     * intermediate object representation if we find them nested inside another structure.
     * This does *NOT* need to happen with interfaces, although we need to store how it can be accessed
     * if inside a namespace (module).
     */
    var putClass = hashUtils.put(registeredClasses);
    var getClass = hashUtils.get(registeredClasses);
    var putModule = hashUtils.put(registeredModules);
    var getModule = hashUtils.get(registeredModules);

    utils.convertToDefault = convertToDefault;
    utils.wrapFunction = wrapFunction;
    utils.processDeclaration = processDeclaration;
    utils.processParams = processParams;
    utils.processInterface = processInterface;
    utils.processModule = processModule;
    utils.processClass = processClass;
    utils.higherorderParams = higherorderParams;
    utils.getParamsList = getParamsList;
    utils.returnAnyType = returnAnyType;
    utils.guard = guard;
    utils.fun = fun;
    utils.fun_new_call = fun_new_call;
    utils.defineVariable = defineVariable;
    utils.defineExportVariable = defineExportVariable;

    return utils;
})(utils || (utils = {}));


exports.getVars = scope.utils.getRegisteredVariables;

exports.toContracts = function (src, module) {
    moduleName = module;
    //here we assume AMD by default; we register the variable not to be used.
    if (typeof module !== 'undefined') {
        scope.utils.registerVariable(module);
    }
    //we build the scopes with variables here
    scope.walk(src);

    return falafel(src, function (node) {

        if (ast.isInterface(node)) {
            var i, name, registered, result, item;
            name = node.name.name;
            result = utils.processInterface(node).toContract();
            /* support for extending interfaces */
            if (node.extends.length !== 0) {
                for (i = 0; i < node.extends.length; i++) {
                    item = node.extends[i].id.name;
                    result = tmpl('extend', {"orig": result, "extending": item});
                }
            }
            registered = Scope.getScope(node.range).lookup(name);
            node.update(utils.defineVariable(registered, result).addSemiColon());
        }

        if (ast.isAmbientVariable(node)) {
            var declaration, type, identifier;
            identifier = node.id.name;
            declaration = node.declaration;
            if (typeof declaration !== 'undefined') {
                type = utils.processDeclaration(declaration);
                node.update(utils.defineExportVariable(identifier, utils.guard(type, identifier)).addSemiColon());
            }
            else {
                node.update('');
            }
        }

        if (ast.isAmbientFunction(node)) {
            var declaration, type, identifier;
            identifier = node.id.name;
            declaration = node.declaration;
            type = utils.processDeclaration(declaration);
            if (declaration.type === 'FunctionTypeDeclaration') {
                node.update(utils.defineExportVariable(identifier, utils.guard(type, identifier)).addSemiColon());
            }
        }

        if (ast.isModule(node) && ast.isAmbient(node)) {
            var moduleK, result, defined_modulename;
            moduleK = utils.processModule(node);
            result = moduleK.toContract();
            if (! moduleK.external) {
                // in this case we just register it, and don't export.
                defined_modulename = Scope.getScope(node.range).lookup(moduleK.moduleName);
                result = result + utils.defineVariable(defined_modulename, moduleK.moduleContract.toContract());
            }
            node.update(result.addSemiColon());
        }

        /* regular modules */
        if (ast.isModule(node) && !ast.isAmbient(node)) {
            var objectContract;
            objectContract = utils.processModule(node);
            //we dont care anymore about internal or external
            var result = objectContract.toContract();
            compileTs(node.source(), function(out) {
                out = falafel(out, function(n) {

                });

            });

        }

        /* Ambient class declarations */
        // differentiate between module classes and non module classes!
        //then we can easily "save" the classcontract to modify it later on.
        if (ast.isClass(node) && ast.isAmbient(node)) {
            var superclass, classContract, className;
            //not yet supported (!), needed for ambient declarations
            if (typeof node.superClass !== 'undefined') {
                superclass = node.superClass.name;
            }
            classContract = utils.processClass(node);
            if (! ast.isModuleMember(node.parent)) {
                className = classContract.name;
                classContract = utils.guard(classContract.toContract(), config.toplevel_prefix + className);
                var opts = {"className": className, "contract": classContract, "prefix": config.toplevel_prefix};
                node.update(tmpl("ambientclass", opts).addSemiColon());
            }
        }

        /* regular class declarations */
        if (ast.isClass(node) && !ast.isAmbient(node)) {
            var classContract;
            classContract = utils.processClass(node);

            if (! ast.isModuleMember(node.parent)) {
                compileTs(node.source(), function(out) {
                    var guarded_output = falafel(out, function(n) {
                        //standard classes are always compiled to a CallExpression
                        // (function() {...}();
                        //we want to transform that one (the top one)
                        if (n.type === "CallExpression" && n.parent.parent.type === "Program") {
                            n.update(utils.guard(classContract.toContract(), n.source()));
                        }
                    });
                    node.update(guarded_output);
                });
            }
        }

        if (ast.isFunction(node)) {
            var res, name;
            res = utils.processParams(node);
            if (node.id) {
                name = node.id.name;
            }
            node.update(utils.wrapFunction(res.argTypes, res.returnType, node, name));
        }

        if (ast.isVariable(node)) {
            var typeDeclaration, declaration, type;

            if (node.declarations.length === 1) {
                declaration = node.declarations[0];
                typeDeclaration = declaration.typeDeclaration;
                type = utils.processDeclaration(typeDeclaration);
                if (typeof declaration.typeDeclaration !== 'undefined') {
                    declaration.typeDeclaration.update('');
                }
                if (typeof declaration.init !== 'undefined') {
                    declaration.init.update(utils.guard(type, declaration.init.source()));
                }
                else {
                    //we guard it with an optional type and give it the value of undefined.
                    //first it will always check since undefined, but later might fail
                    declaration.typeDeclaration.update('=' + utils.guard(utils.opt(type), undefined));
                }
            }
            else {
                //todo: multiparam declarations!
            }
        }
    });
};