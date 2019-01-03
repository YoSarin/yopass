// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints,
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    console.log("start");

    var backButtonCallback = function() { console.log('default go back callback, does nothing'); };

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        console.log("onready");
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        document.addEventListener("backbutton", function () {
            return backButtonCallback();
        }.bind(this), false);

        $(document).bind('mobileinit', function () {
            $.mobile.loader.prototype.options.text = "loading";
            $.mobile.loader.prototype.options.textVisible = false;
            $.mobile.loader.prototype.options.theme = "a";
            $.mobile.loader.prototype.options.html = "";
        });

        $('.confirm').click(function (ev) {
            var target = $(this).attr('href');
            navigator.notification.confirm(
                'Are you sure?',
                 function (index) {
                     if (index === 1) {
                         $(':mobile-pagecontainer').pagecontainer('change', $(target));
                     }
                 },
                'Confirmation',
                ['Yes', 'No']
            );
            return false;
        });

        $('.submitOnEnter').keypress(function (e) {
            if (e.which === 13) {
                var target = $(this).attr('rel');
                $('#' + target).click();
                return false;    //<---- Add this line
            }
        });

        $('#login').on('pagebeforeshow', function (event) {
            loadData(prepareLoginPage);
        });

        $('#login').on('pageshow', function (event) {
            $("#login input").first().focus();
        });

        $('#addPassword').on('pagebeforeshow', function (event) {
            fillPasswordForm();
            $(':mobile-pagecontainer').pagecontainer('change', $('#editPassword'));
        });

        $('#editPassword').on('pagebeforeshow', function (event) {
        });

        $('#editPassword').on('pageshow', function (event) {
            $("#editPassword input").first().focus();
        });

        $('#list').on('pagehide', function (ev) {
            $("#list .ui-content .data").html("");
            $("#list h1").text("");
        });

        $('#list').on('pagebeforeshow', function (event) {
            if ($('#walletList').val() === null || !$('#password').val()) {
                $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                return;
            }
            backButtonCallback = function() {
              $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
            }
            loadData(function (wallets) {
                loadWallet(function (wallet) {
                    try {
                        var pass = $('#password').val();
                        wallet.decrypt(pass);
                        $('#list h1').html(wallet.name());
                        $('#list h1').on('click', function () {
                          $('#list .search').toggle();
                          if ($('#list .search').is(':hidden')) {
                            $('#list .search .pattern').val('').change();
                          } else {
                            $('#list .search .pattern').focus();
                          }
                        });
                        $('#list .search .pattern').on("change paste keyup", function () {
                          var pattern = $(this).val();
                          var re = new RegExp(pattern, 'i');
                          $('#list .data .password').each(function () {
                            var name = $(this).find('.name').text();
                            if (pattern == "" || re.test(name)) {
                              $(this).show();
                            } else {
                              $(this).hide();
                            }
                          });
                        });
                        $('#list .data').html('');
                        $.each(wallet.passwords(), function (key, p) {
                            var html = $("#templates .password").clone();
                            $(html).find('.name').text(p.getTitle());
                            $(html).find('.name').hold(function () {
                                navigator.notification.alert("Password: " + p.getPassword(), function () {}, "Keep it safe!");
                            }, 500);
                            $(html).find('.username').text(p.getUsername());
                            $(html).find('.name').dblclick(function () {
                                cordova.plugins.clipboard.copy(
                                    p.getPassword(),
                                    function () { navigator.notification.alert("Now you have password in your clipboard 😊"); },
                                    function (err) {
                                        navigator.notification.alert("Clipboard does not work as expected 😢");
                                        console.error(err);
                                    }
                                );
                            });
                            $(html).find('.edit').click(function () {
                                fillPasswordForm(p);
                                $(':mobile-pagecontainer').pagecontainer('change', $('#editPassword'));
                            });
                            $(html).find('.remove').click(function () {
                                navigator.notification.confirm(
                                    'Are you sure?',
                                     function (index) {
                                         if (index === 1) {
                                             wallet.removePassword(p);
                                             wallet.encrypt(pass);
                                             wallet.save(YoPass.DB());
                                             $(html).remove();
                                         }
                                     },
                                    'Confirmation',
                                    ['Yes', 'No']
                                );
                            });
                            $('#list .data').append(html);
                        });
                        $('#list .data .password').swipeable();
                        $('#list .data').trigger('create');
                    } catch (e) {
                        console.error(e);
                        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                    }
                });
            });
        });


        $('#downloadData').on('pagebeforeshow', function (event) {
          backButtonCallback = function() {
            $(':mobile-pagecontainer').pagecontainer('change', $('#list'));
          }
          loadWallet(function (wallet) {
              var pass = $('#password').val();
              wallet.decrypt(pass);
              $('#downloadDataOutput').val(JSON.stringify(wallet.passwordsExport()));
            });
        });


        $('#loadPasswords').on('pagebeforeshow', function (event) {
            try {
                loadWallet(function (wallet) {
                    try {
                        var pass = $('#password').val();
                        wallet.decrypt(pass);

                        var dataText = $('#dataToLoad').val();
                        var data = {};
                        try {
                            data = $.parseJSON(dataText);
                        } catch (e) {
                            data = $.csv.toObjects(dataText);
                        }
                        $.each(data, function (k, val) {
                            wallet.addPassword(Password.fromDict(val));
                        });
                        wallet.encrypt(pass);
                        wallet.save(YoPass.DB(), function () {
                            $(':mobile-pagecontainer').pagecontainer('change', $('#list'));
                        });
                    } catch (e) {
                        alert(e);
                    } finally {
                        $('#dataToLoad').val("");
                    }
                });
            } catch (e) {
                console.log(e);
                navigator.notification.alert("Sorry, something is broken :(", function () {
                    $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                }, "It is broken!");
            }
            $(':mobile-pagecontainer').pagecontainer('change', $('#list'));
        });

        $('#createWallet').on('pagebeforeshow', function (event) {
            if ($("#newWallet input[name='name']").val() !== '' && $("#newWallet input[name='password']").val() !== '') {
                var name = $("#newWallet input[name='name']").val();
                var pass = $("#newWallet input[name='password']").val();
                var salt = CryptoJS.lib.WordArray.random(128 / 8);
                var iv = CryptoJS.lib.WordArray.random(128 / 8);
                var iters = 100;
                var key = CryptoJS.PBKDF2(pass, salt, { keySize: 1024 / 32, iterations: iters }).toString();
                var encryptedKey = CryptoJS.AES.encrypt(JSON.stringify({ 'key': key, 'salt': salt, 'iv': iv }), pass).toString();
                var encryptedData = CryptoJS.AES.encrypt(JSON.stringify([]), key, { 'iv': iv }).toString();

                $("#newWallet input[name='password']").val('');
                $("#newWallet input[name='name']").val('');

                YoPass.DB().query(
                    'INSERT INTO wallet (name, encryptedKey, data) VALUES (?,?,?)',
                    [name, encryptedKey, encryptedData],
                    function (result) {
                        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                    }
                );

            } else {
                $(':mobile-pagecontainer').pagecontainer('change', $('#newWallet'));
            }
        });

        $('#newWallet').on('pageshow', function (event) {
            $("#newWallet input").first().focus();
        });

        $('#removeWallet').on('pagebeforeshow', function (event) {
            if ($("#walletList").val()) {
                Wallet.delete(
                    YoPass.DB(),
                    parseInt($("#walletList").val()),
                    function (result) { // success
                        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                    }
                );
            }
        });

        $('#newWallet').on('pagebeforeshow', function (event) {
            $("#newWallet input[name='password']").val('');
            $("#newWallet input[name='name']").val('');
        });
        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));

    }

    function onPause() {
        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
    }

    function onResume() {
        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
    }

    function prepareLoginPage(wallets) {
        var selected = $('#walletList').val();
        $('#password').val('');
        $('#walletList').html('');
        $.each(wallets, function (key, item) {
            if (!item) {
                return;
            }
            var option = $('#templates .walletItem').clone();
            option.attr('value', item.id);
            option.text(item.name);
            $('#walletList').append(option);
        });
        if (!selected || typeof wallets[parseInt(selected)] === 'undefined') {
            $('#walletList option').first().attr('selected', true);
        } else {
            $('#walletList').val(selected);
        }
        $('#walletList').selectmenu('refresh');
    }

    function loadData(callback) {
        YoPass.DB().query(
            'SELECT id_wallet as id, name, encryptedKey as key, data FROM wallet',
            [],
            function (result) { // success
                var wallets = [];
                for (var i = 0; i < result.rows.length; i++) {
                    var item = result.rows.item(i);
                    wallets[item.id] = item;
                }
                callback(wallets);
            }, function (err) { // error
                console.log(err);
            }
        );
    }

    function loadWallet(callback) {
        loadData(function (wallets) {
            try {
                var w = wallets[parseInt($('#walletList').val())];

                var wallet = Wallet.load(w.id, w.name, w.key, w.data);

                callback(wallet);
            } catch (e) {
                navigator.notification.alert("Sorry, something is broken :(", function () {
                    $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                }, "It is broken!");
                console.log(e);
            }
        });
    }

    function fillPasswordForm(password, wallet) {
        var p = typeof password === 'undefined' ? new Password() : password;
        $('#editPassword form').html('');

        loadWallet(function (wallet) {
            var pass = $('#password').val();
            wallet.decrypt(pass);

            var usernames = wallet.usedUsernames();

            $.each(p.dict(), function (key, item) {
                var sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
                var label = $('<label>', { for: sanitizedKey }).text(key).appendTo('#editPassword form');
                if (key === 'username' && item === '' && usernames.length > 0) {
                    var select = $('<select>', { name: sanitizedKey, rel: key }).appendTo('#editPassword form');
                    $.each(usernames, function (key, username) {
                        $('<option>', { value: username.name, text: username.name }).appendTo(select);
                    });
                    var newUser = $('<option>', { text: "new username" }).appendTo(select);
                    select.change(function () {
                        if (newUser.is(':selected')) {
                            select.remove();
                            var input = $('<input>', { name: sanitizedKey, rel: key, value: item, type: 'text' }).insertAfter(label);
                            input.textinput();
                        }
                    });
                } else {
                    $('<input>', { name: sanitizedKey, rel: key, value: item, type: 'text' }).appendTo('#editPassword form');
                }
            });

            $('#editPassword form').trigger('create');
            $('#editPassword .generatePassword').click(function () {
                $('#editPassword input[name=password]').val(Password.generate());
            });
            $('#editPassword .savePassword').click(function () {
                wallet.removePassword(p);
                var values = {};
                $.each($('#editPassword form').serializeArray(), function (key, item) {
                    values[item["name"]] = item["value"];
                });
                wallet.addPassword(Password.fromDict(values));
                wallet.encrypt(pass);
                wallet.save(YoPass.DB(), function () {
                    $(':mobile-pagecontainer').pagecontainer('change', $('#list'));
                    $('#editPassword .savePassword').removeClass('hidden');
                });

                $('#editPassword .savePassword').addClass('hidden');
                return false;
            });
        });
    }

})();
