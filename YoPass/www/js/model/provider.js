function Provider(dbName, tables, updates) {

    var __self__ = this;

    __self__._dbName = dbName;
    __self__._tables = tables;
    __self__._tables["_metadata"] = { "app_version": "float", "provider_version": "float" };
    __self__._updates = {
        "app": updates, "provider": []
    };
    __self__._readyList = [];
    __self__._ready = false;
    __self__._db = window.sqlitePlugin.openDatabase({ name: __self__._dbName, location: 2 });
    __self__._onReady = $.Callbacks();

    __self__.db = function () {
        return this._db;
    };

    __self__.query = function (q, params, success, error) {
        if (__self__._ready) {
            __self__._performQuery(q, params, success, error);
        } else {
            __self__._onReady.add(function () {
                console.log('onReady callback of ' + q + ' started');
                __self__._performQuery(q, params, success, error);
            });
        }
    };

    __self__._update = function (callback) {
        this._withAppVersion(
            function (version) {
                this._updateFromVersion(version, false, callback);
            }.bind(this)
        );
        this._withProviderVersion(
            function (version) {
                this._updateFromVersion(version, true, callback);
            }.bind(this)
        );
    }.bind(__self__);

    __self__._withAppVersion = function (success) {
        this._performQuery(
            "SELECT app_version FROM _metadata",
            [],
            function (data) {
                if (data.rows.item(0)) {
                    success(data.rows.item(0).app_version);
                }
                success(0.0);
            },
            function (err) {
                success(0.0);
            });
    }.bind(__self__);

    __self__._withProviderVersion = function (success) {
        this._performQuery(
            "SELECT provider_version FROM _metadata",
            [],
            function (data) {
                if (data.rows.item(0)) {
                    success(data.rows.item(0).provider_version);
                }
                success(0.0);
            }, function () {
                success(0.0);
            });
    }.bind(__self__);

    __self__._updateFromVersion = function (currVersion, provider, callback) {
        var target = provider ? "provider" : "app";
        var queries = [];
        var maxVersion = currVersion;
        $(this._updates[target].sort(function (a, b) { return a["version"] - b["version"]; })).each(function (_, item) {
            if (item["version"] > currVersion) {
                queries = queries.concat(item["commands"]);
                maxVersion = item["version"];
            }
        });

        if (maxVersion != currVersion) {
            queries = queries.concat([["UPDATE _metadata SET " + target + "_version = ?;", maxVersion]]);
        }
        if (queries.length > 0) {
            this.db().sqlBatch(
                queries,
                function () {
                    callback();
                },
                function (err) {
                    console.error("Updater fialed:", err);
                }
            );
        }
    }.bind(__self__);

    __self__._performQuery = function (q, params, succ, err) {
        console.log(q);
        var d = new Date();
        var start = d.getTime();
        var ident = Password.generate({ flags: Password.flags.alnum(), len: 8 });
        console.log('START', ident, q, params);

        this.db().executeSql(
            q, params,
            function (result) {
                var d = new Date();
                var duration = d.getTime() - start;
                console.log('OK', ident, "duration", duration, q, result);
                if (succ) {
                    succ(result);
                }
                return true;
            },
            function (e) {
                var d = new Date();
                var duration = d.getTime() - start;
                console.log('ERROR', ident, "duration", duration, q, e);
                if (err) {
                    err(e);
                }
                return false;
            }
        );
    }.bind(__self__);

    __self__.create = function () {
        // create tables if they don't exists
        var queries = [];
        $.each(tables, function (key, item) {
            var columns = [];
            columns.push('id_' + key + ' integer primary key');
            $.each(item, function (column_name, definition) {
                columns.push(column_name + ' ' + definition);
            });
            var query = 'CREATE TABLE IF NOT EXISTS ' + key + ' (' + columns.join(', ') + ')';
            queries.push(query);
        });
        this.db().sqlBatch(
            queries,
            function (p) {
                console.log('Creation done');
                this._update(function () {
                    this._ready = true;
                    this._onReady.fire();
                }.bind(this));
            }.bind(this),
            function (error) {
                console.log('Creation failed: ', error);
            }.bind(this)
        );
    }.bind(__self__);

    __self__.create();
}
