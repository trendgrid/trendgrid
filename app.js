'use strict';
document.addEventListener("offline", onOffline, false);
if (!navigator.onLine) {
  onOffline();
}

function onOffline() {
    $('#align').html('<h2>A network connection is required.</h2>')
}
/*
 * Trend Grid v0.8
 * An animated news grid populated by Google News results from current Google Trends keywords
 * Author: Nathan Blenke
 * Updated: 20120530
 * http://nathan.blenke.com/workshop/trendgrid/
 * License: http://creativecommons.org/licenses/by-nc-sa/3.0/
 */

var z = {
    count: 0,
    an2: [],
    an3: [],
    an4: [],
    interval: 7000,
    xhrdone: false,
    move: 3500,
    speed: 500,

    init : function () {
        z.mq();
        z.loader('show');
        z.trends();
        $(window).resize(function () {
            z.mq();
            z.loader('throb');
        });
        z.storage('show');
    },

    loader : function (type) {
        var firstCell = $('#grid ul:eq(0) li:eq(0)');
        if (!firstCell.children('#loader').length) {
            firstCell.prepend('<div id="loader"></div>')
        }

        switch (type) {
        case 'throb':
            $('#loader').show().delay(3000).fadeOut(500);
            break;
        case 'show':
            $('#loader').show();
            break;
        case 'hide':
            $('#loader').fadeOut(500);
            break;
        }

    },

    storage : function (type, event) { 
        try {
            var aStories = JSON.parse(window.localStorage['stories']);

            switch (type) {
            case 'show':
                aStories.reverse();
                for (var i = 0; i < aStories.length; i += 1) {
                    if (aStories[i].length) {
                        $('#grid').after('<div class="detail">' + aStories[i] + '</div>');
                    }
                }
                z.detail();
                break;
            case 'remove':
                var elparent = $(event.currentTarget).parents('.detail'),
                    astories = [];
                elparent.remove();

                $('.detail').each(function (i) {
                    astories[i] = $(this).html();
                });
                
                astories = $.grep(astories, function(value) {
                  return value != elparent.index('.detail');
                });
                
                window.localStorage['stories'] = JSON.stringify(astories);
                break;
            }
        } catch (e) {}
    },
    
    anbuild : function (x, z, c) {
        var a = [x],
            i = 0;
        while (i < c) {
            x = x + z;
            a.push(x);
            i += 1;
        }
        return a;
    },

    mq : function () {
        switch ($('#align').width()) {
        case 300:
            z.grid(300);
            z.count = 1;
            break;
        case 460:
            z.grid(460);
            z.count = 2;
            z.an2 = z.anbuild(1, 2, 14);
            break;
        case 748:
            z.grid(748);
            z.count = 3;
            z.an2 = z.anbuild(1, 3, 14);
            z.an3 = z.anbuild(2, 3, 14);
            break;
        default:
            z.grid();
            z.count = 4;
            z.an2 = z.anbuild(1, 4, 14);
            z.an3 = z.anbuild(2, 4, 14);
            z.an4 = z.anbuild(3, 4, 14);
        }
    },
    
    truncate : function (str, amount) {
        var trailing = amount - 3;
        if (str.length > trailing) {
            str = str.substring(0, trailing) + '...';
        }
        return str;
    },
    
    go : function (txt, lnk, cnt) {
        var item,
            incr = 0,
            trunc = 110,
            elimg;

        if (cnt.search(/src=/gi) !== -1) {
            elimg = cnt.split('src="')[1].split('"')[0];

            if (elimg.substring(0, 2) === '//') {
                elimg = 'http:' + elimg;
            }

            item = $('<div class="item">' +
                      '<img src="' + elimg + '" class="thumb">' +
                      '<h6>' + z.truncate(txt, trunc) + '</h6>' +
                      '<p>' + z.cleanHTMLStr(cnt) + '<a href="' + lnk + '">More</a></p>' +
                      '</div>');
        } else {
            item = $('<div class="item">' +
                      '<h6>' + z.truncate(txt, trunc) + '</h6>' +
                      '<p>' + z.cleanHTMLStr(cnt) + '<a href="' + lnk + '">More</a></p>' +
                      '</div>');
        }

        $('#mover').append(item);

        $('#trends a').click(function () {
            var p = incr + 58;

            item.each(function () {
                $(this).animate({
                    top: p + 'px'
                }, z.speed);
            });

        });

        setInterval(function () {
            incr = incr + 58;
            item.animate({
                top: incr + 'px'
            }, z.speed);
            $('.item[style*="406px"]').remove();
        }, z.move);

        item.each(function () {

            var el = $(this),
                ii = el.index(),
                astories = [],
                convArObjLit = function (a) {
                    var i = 0,
                        o = {};
                    for (i; i < a.length; i += 1) {
                        o[a[i]] = '';
                    }
                    return o;
                };

            if (ii in convArObjLit(z.an2)) {
                el.addClass('n2');
            }
            if (ii in convArObjLit(z.an3)) {
                el.addClass('n3');
            }
            if (ii in convArObjLit(z.an4)) {
                el.addClass('n4');
            }

            el.hover(function () {
                el.addClass('hover');
            }, function () {
                el.removeClass('hover');
            });

            el.click(function () {

                $('#grid').after('<div class="detail" style="display:none">' + $(this).html() + '</div>');
 
                $(this).addClass('clicked');
                $(this).animate({
                    top: '420px'
                }, z.speed, function () {
                    $(this).remove();
                });

                $('.detail:eq(0)').delay(z.speed).slideDown(z.speed);
                
                z.detail();
                
                $('.detail').each(function (i) {
                    astories[i] = $(this).html();
                });
              
                try {
                    window.localStorage['stories'] = JSON.stringify(astories);
                } catch (e) {}
                
                
            });

        });

    },
    
    detail : function () {
        $('.detail').each(function () {
            var el = $(this),
                firstLink = el.find('a:eq(0)').attr('href'),
                thumbImg = el.find('img.thumb');

            el.find('table:eq(0) td:eq(0)').hide();

            if (thumbImg.length !== 0) {
                el.find('table:eq(0) td:eq(1)').prepend(thumbImg)
            }

            el.find('table:eq(0)').removeAttr('cellpadding').removeAttr('cellspacing');
            el.find('table:eq(0) td:eq(1) br:eq(0)').hide();
            //el.find('table:eq(0) td:eq(1) a').hide();

            el.prepend('<a href="' + firstLink + '" class="more detail-btn">&raquo;</a>' +
                       '<a href="" class="remove detail-btn">&times;</a>');
            el.find('a.more:gt(0), a.remove:gt(0)').remove();
            el.find('a:contains("More")').remove();

        });
                  
        $('.detail a').attr('target', '_blank');
        
        $('.detail:gt(19)').remove();
        $('.detail:eq(19)').addClass('detail0');
        $('.detail:eq(18)').addClass('detail1');
        $('.detail:eq(17)').addClass('detail2');
        $('.detail:eq(16)').addClass('detail3');
        
        $('.remove').click(function (event) {
            event.preventDefault();
            z.storage('remove', event);
        });
    },

    grid : function (size) {
        var intRows,
            intCols,
            intRowIt = 0,
            intColIt = 0,
            intUlWidth,
            intLiWidth,
            fprepend = function () {
                $('#grid ul').each(function () {
                    $(this).prepend("<li data-col='" + intColIt + "'></li>");
                });
            };

        $('#grid ul').remove();

        switch (size) {
        case 300:
            intRows = 5;
            intCols = 0;
            intUlWidth = 300;
            intLiWidth = 300;
            break;
        case 460:
            intRows = 5;
            intCols = 1;
            intUlWidth = 460;
            intLiWidth = 229;
            break;
        case 748:
            intRows = 5;
            intCols = 2;
            intUlWidth = 748;
            intLiWidth = 248;
            break;
        default:
            intRows = 6;
            intCols = 3;
            intUlWidth = 980;
            intLiWidth = 244;
        }

        for (intRowIt = 0; intRowIt <= intRows; intRowIt += 1) {
            $('#grid').prepend("<ul data-row='" + intRowIt + "'></ul>");
        }

        for (intColIt = 0; intColIt <= intCols; intColIt += 1) {
            fprepend();
        }

        $('#grid ul').each(function () {
            $(this).css('width', intUlWidth + 'px');
            $(this).find('li').css('width', intLiWidth + 'px')
                .css('height', '57px');
        });

    },

    gapi : function (url, fnk, num, key) {
        z.xhrdone = false;
        z.loader('show');
        if (url == null) {
            return false;
        }
        var gurl = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" + encodeURIComponent(url);

        if (num != null) {
            gurl += "&num=" + num;
        }
        if (key != null) {
            gurl += "&key=" + key;
        }
        $.getJSON(gurl, function (data) {
            if (typeof fnk == 'function') {
                try {
                    fnk.call(this, data.responseData.feed);
                    z.xhrdone = true;
                    z.loader('hide');
                } catch (e) {
                    console.log(e)
                }
            } else {
                return false;
            }
        });
    },

    trends : function (size) {
        z.gapi('http://www.google.com/trends/hottrends/atom/hourly', function (feeds) {
            var i = 0,
                im = 0,
                aTrends = [],
                iTimerId,
                ipos,
                iend,
                intervalStarted = false, 
                x = 1;

            if (!feeds) {
                return false;
            }
            for (i; i < feeds.entries.length; i += 1) {
                $('#trends').prepend(feeds.entries[i].content);
            }

           $('#trends a').each(function () {
                var el = $(this),
                    bc = false,
                    fnon = function () {
                        el.parents('li').addClass('on').siblings().removeClass('on');
                        z.feed(el.text());
                    };

                aTrends.push(el.text());
                el.attr('href', '').click(function () {
                    if (!bc) {
                        bc = true;
                        if ($(this).parents('li').is(':last-child')) {
                            fnon();
                            $('#cont').hide();
                            $('#trends').removeClass('trendscont');
                            iTimerId = setTimeout(function () {
                                getTrend(0, size);
                                z.feed(aTrends[0]);
                            }, z.interval);
                        } else {
                            fnon();
                            $('#cont').show();
                            $('#trends').addClass('trendscont');
                            clearTimeout(iTimerId);
                        }
                        setTimeout(function () {
                            bc = false;
                        }, 10000);
                    }
                    return false;
                });
            });

            function tick() {
                intervalStarted = true;
                if (z.xhrdone === true) {
                    if (x === 20) {
                        x = 0;
                    }
                    if (x <= 19) {
                        getTrend(x, size);
                        z.feed(aTrends[x]);
                    }
                    x += 1;
                }
            }
            iTimerId = setInterval(tick, z.interval);
            if (!intervalStarted) {
                getTrend(0, size);
                z.feed(aTrends[0]);
            }

            function getTrend(x, size) {
                var ocur = $('#trends li:eq(' + x + ')'),
                    osibs = $('#trends li'),
                    ionlngth = $('.on').attr('data-pos');// - 100;

                osibs.removeClass('on');
                ocur.addClass('on');

                if ($(window).width() < 480) {
                   // ionlngth -= 10;
                }

                if (x === 0) {
                    ionlngth = 0;
                }

                $('#trends ol').animate({
                    "marginLeft": '-' + ionlngth + 'px'
                }, z.speed);

            }

            $('li').each(function () {
                i += $(this).innerWidth() + 20;
                $(this).attr('data-pos', i);
                im += 10;
            });

            $('#trends ol').css('width', $('#trends li:last').attr('data-pos') + 'px');
            $('#trends ol').css('width', $('#trends ol').width() + im + 'px');

            iend = parseFloat('-' + $('#trends li:last').attr('data-pos')) + 400;

            $('#next').click(function () {
                ipos = parseFloat($('#trends ol').css('margin-left').split('px')[0]);
                if (ipos >= iend) {
                    $('#trends ol').animate({
                        "marginLeft": ipos - 230 + 'px'
                    }, z.speed);
                }
                clearTimeout(iTimerId);
                $('#cont').show();
                $('#trends').addClass('trendscont');
                return false;
            });

            $('#prev').click(function () {
                ipos = parseFloat($('#trends ol').css('margin-left').split('px')[0]);
                if (ipos <= 0) {
                    $('#trends ol').animate({
                        "marginLeft": ipos + 230 + 'px'
                    }, z.speed);
                }
                clearTimeout(iTimerId);
                $('#cont').show();
                $('#trends').addClass('trendscont');
                return false;
            });

            $('#cont').click(function () {
                $('#trends ol li.on').removeClass('on').next().addClass('on');
                x = $('#trends ol li.on').index();
                iTimerId = setInterval(tick, z.interval);

                $(this).hide();
                $('#trends').removeClass('trendscont');
                z.loader('show');
                return false;
            });


        });

    },

    feed : function (query) {
        var arr = {
            search0: 'http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&num=10&cf=all&output=rss&q=' + encodeURIComponent(query)
        };

        $.each(arr, function (i, v) {
            z.gapi(v, function (feeds) {
                var i = 0;
                if (!feeds) {
                    return false;
                }
                for (i; i < feeds.entries.length; i += 1) {
                    z.go(feeds.entries[i].title, feeds.entries[i].link, feeds.entries[i].content);
                }
            }, z.count);
        });

    },

    cleanHTMLStr: function (str) {
        str = str.replace(/style=(".*?"|'.*?'|[^"'][^\s]*)/g, ""); //remove style attr
        //str = str.replace(/^[ \t]+|[ \t]+$/gi, ''); // trim whitespace
        //str = str.replace(/>\s+</g, '><');
        str = str.replace(/<[\/]{0,1}(img)[^><]*>/g, ""); // remove tags
        //str = str.replace(/(<br\s*\/?>\s*)+/g, '<br/>'); // combine multiple brs
        return str;
    }

};

jQuery(function ($) {
    z.init();
});

