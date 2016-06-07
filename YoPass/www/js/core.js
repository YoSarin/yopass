function Core(name) {
    var __self__ = this;
    this.bindings = {};
    this.debug = false;
    this.name = name;
};

Core.prototype.fire = function (event, data) {
    var __self__ = this;
    return new Promise(function (success, fail) {
        if (typeof __self__.bindings[event] == 'undefined') {
            return success();
        }
        var result = { "success": [], "error": [] };
        for (i = 0; i < __self__.bindings[event].length; i++) {
            try {
                result["success"].push(__self__.bindings[event][i](data));
            } catch (e) {
                __self__.log(e);
                result["error"].push(e);
            }
        }

        if (result["error"].length) {
            fail(result);
        } else {
            success(result);
        }
    });
}

Core.prototype.bind = function (event, callback) {
    if (typeof this.bindings[event] == 'undefined') {
        this.bindings[event] = [];
    }
    this.bindings[event].push(callback);
}

Core.prototype.on = Core.prototype.bind;

Core.prototype.unbind = function (event, callback) {
    if (typeof this.bindings[event] == 'undefined') {
        this.log('Event ' + event + ' was not bind to anything');
        return this;
    }
    if (typeof callback == 'undefined') {
        this.log('Removing all bindings to event ' + event);
        delete this.bindings[event];
        return this;
    }
    var i = this.bindings.indexOf(callback);
    while (i >= 0) {
        this.log("Removing binding of " + callback + " on " + event);
        i = this.bindings.indexOf(callback);
        this.bindings = this.bindings.splice(i, 1);
    }
    return this;
}

Core.prototype.off = Core.prototype.unbind;

Core.prototype.log = function (data) {
    if (!this.debug) {
        return this;
    }
    var e = document.getElementById('log');
    if (e) {
        e.innerHTML = e.innerHTML + '<br />' + data;
    }
    console.log(data);
    return this;
}

Core.instances = {}

Core.Instantiate = function (name) {
    if (typeof name == 'undefined') {
        name = '__main__';
    }
    if (typeof Core.instances[name] == 'undefined') {
        Core.instances[name] = new Core(name);
    }
    return Core.instances[name];
}

var CI = Core.Instantiate;

Core.Test = function () {

    function assert(condition, message) {
        if (!condition) {
            throw message || "Assertion failed";
        }
        console.log(message ? "OK " + message : "OK Assertion");
    }

    var CIT = CI("test");
    console.log(CIT);
    CIT.debug = true;

    var callback_1 = function (data) {
        console.log('callback_1', data);
        return data;
    }

    var callback_2 = function (data) {
        console.log('callback_2', data);
        return data;
    }

    CIT.bind("testEvent", callback_1);
    assert(CIT.bindings["testEvent"].toString() == [callback_1].toString());

    CIT.on("testEvent", callback_2);
    assert(CIT.bindings["testEvent"].toString() == [callback_1, callback_2].toString());

    CIT.fire("testEvent", { "data": "ejchuchu!" }).then(function (data) { console.log("SUCCESS", data); }, function (error) { console.log("ERROR", error); });
}