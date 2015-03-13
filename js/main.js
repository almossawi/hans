$(document).ready(function () {
    "use strict";
    var globals = {};

    //position illustrations
    var pics = ['pic1', 'pic3', 'pic4', 'pic4-zoom', 'pic5', 'pic6', 'pic8', 'pic9'];
    pics.forEach(function(d, i) {
        $('.' + d)
            .css('top', $('.' + d + '-link').position().top)
            .show();
    });

    //position footnotes
    $.each($('.footnote'), function(i, d) {
        $(this)
            .css('top', $('.footnote' + (i + 1) + '-link').position().top)
            .delay(1000).fadeIn();
    });

    //add captions to illustrations
    d3.json('data/captions.json', function(data) {
        globals.captions = data.captions;

        d3.keys(globals.captions).forEach(function(d, i) {
            var caption_for_span = globals.captions[d].replace(/\n/g, '<br />');
            var caption_for_title = globals.captions[d];
            $('.' + d).find('img').attr('title', caption_for_title);
            $('.' + d).append("<div class='caption'>" + caption_for_span  + "</div>");
        });
    });

    //caption on/off, for mobile view
    $('.show-tooltip').on('click', function(d) {
        //if not active
        if(!$(this).hasClass('active')) {
            $(this).toggleClass('active');
            $(this).parent().find('.caption').show();
        } else { //if active
            $(this).toggleClass('active');
            $(this).parent().find('.caption').hide();
        }

        return false;
    });

    //bottom bit
    $('.expand').on('click', function() {
        //if we're compacted
        if ($('.concepts-gradient').is(':visible')) {
            $('.concepts').css('height', 'auto');
            $('.expand').html('<i class="fa fa-chevron-up"></i> Collapse');
            $('.concepts-gradient').hide();
        } else { //if we're expanded
            $('.concepts').css('height', '160px');
            $('.expand').html('<i class="fa fa-chevron-down"></i> &nbsp;Read more');
            $('.concepts-gradient').show();
        }

        return false;
    });

    //nice scrolling to in-page anchors
    $('a.in-page').on('click', function() {
        var anchor = $(this).attr('href');
        var aTag = $("a[name='" + anchor.slice(1)  + "']");
        $('html, body').animate({
            scrollTop: aTag.offset().top
        }, 500, function () {
            window.location = anchor;
        });
        
        return false;
    });

    $('.go-to-top').on('click', function() {
        $('html, body').animate({
            scrollTop: 0
        }, 500);

        return false;
    });
    
    $('.switch-to-linear').on('click', function() {
        plot('linear');
        $('.switch').toggleClass('active', false);
        $(this).toggleClass('active');

        return false;
    });

    $('.switch-to-log').on('click', function() {
        plot('log');
        $('.switch').toggleClass('active', false);
        $(this).toggleClass('active');

        return false;
    });

    $('.fb-sharer').on('click', function() {
        var winTop = (screen.height / 2) - (350 / 2);
        var winLeft = (screen.width / 2) - (520 / 2);
        fbShare(520, 350);

        return false;
    });

    function fbShare(winWidth, winHeight) {
        var winTop = (screen.height / 2) - (winHeight / 2);
        var winLeft = (screen.width / 2) - (winWidth / 2);
        window.open('https://www.facebook.com/dialog/share?app_id=639471119502031&href=https%3A%2F%2Fthelandofbards.com%2F&display=popup&redirect_uri=https%3A%2F%2Fthelandofbards.com%2Fm%2Ffacebook%2Fclose', 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    }

    //hide bottom bar when at bottom of page
    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
            $('.bottom-bar').slideUp();
        } else if(!$('.bottom-bar').is(':visible')) {
            $('.bottom-bar').slideDown();
        }
        
    });

    $(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });

    //complexity chart
    plot('log');

    //huffman tree
    var nodes = {};
        nodes["e'"] = ["e", "n'"];
        nodes["n'"] = ["n", "l'"];
        nodes["a'"] = ["a", "h'"];
        nodes["l'"] = ["l", "f'"];
        nodes["h'"] = ["h", "s"];
        nodes["f'"] = ["f", "j"];

        $(".huffman-animation .row").on("mouseover", function(i, d) {
            var current_character = $(this).children(".key").text();
            if(current_character.indexOf("'"))

            var children = nodes[current_character];
            if(children == undefined) {
                children = ["", ""];
            }

            $('.huffman-animation .row').filter(function(){
                return !($(this).children(".key").text() == current_character
                    || $(this).children(".key").text() == children[0]
                    || $(this).children(".key").text() == children[1]
                    );
            })
            .css("opacity", "0.3");
        });

        $(".huffman-animation .row").on("mouseout", function(i, d) {
        $('.huffman-animation .row')
            .css("opacity", "1");
        });

    drawHuffmanTree(".huffman-tree");

    function plot(y_scale_type) {
        MG.data_graphic({
            data: datafyMeBro(100),
            width: 500,
            height: 300,
            target: '.chart',
            x_accessor: 'n',
            y_accessor: 'operations',
            xax_count: 0,
            yax_count: 1,
            left: 80,
            y_scale_type: y_scale_type,
            x_label: 'elements',
            y_label: 'operations',
            mouseover: function(d, i) {
                $('.chart svg .mg-active-datapoint')
                    .html('elements: ' + d.n + ' &nbsp; operations: ' 
                        + addCommas(Math.round(d.operations)));
            }
        })
    }

    function addCommas(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    function drawHuffmanTree(container) {
        var width = $(container).width(),
            height = $(container).height();

        d3.json('data/huffman.json', function(treeData) {
            var svg = d3.select(container)
                .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("svg:g")
                        .attr("transform", "translate(10, 0)");

                var tree = d3.layout.tree()
                    .size([height, width-30]);

                var diagonal = d3.svg.diagonal()
                    .projection(function(d) { return [d.y, d.x]; });

                //get nodes from tree data
                var nodes = tree.nodes(treeData);

                //get links from tree data
                var links = tree.links(nodes);

                //links
                var link = svg.selectAll("pathlink")
                    .data(links)
                    .enter().append("svg:path")
                        .attr('class', function(d) {
                            return 'link ' + encode_special_chars(d.target.name);
                        })
                        .attr("d", diagonal);

                //node groups
                var node = svg.selectAll("g.node")
                    .data(nodes)
                    .enter().append("svg:g")
                        .attr('class', function(d,i) {
                            if(d.name.indexOf("'") == -1
                                    && d.name != '')
                                return 'leaf';
                            else
                                return "node";
                        })
                        .attr("transform", function(d) {
                            return "translate(" + d.y + "," + d.x + ")";
                        })
                        .on("click", function(d, i) {
                            //only enable clicks for leafs
                            if(d3.select(this).classed('node'))
                                return false;
                                
                            d3.selectAll('.link, .link-text').classed('active', false)
                            
                            //highlight entire chain on click
                            var node = d;
                            while(node.parent != undefined && node.parent != '') {
                                d3.select('.link-text.' + encode_special_chars(node.name))
                                    .classed('active', true);
                                    
                                d3.select('.link.' + encode_special_chars(node.name))
                                    .classed('active', true);
                                    
                                node = node.parent;
                            }
                        })

                //add our nodes
                node.append("svg:circle")
                    .attr("r", 11);

                //add node literals
                node.append("svg:text")
                    .attr("fill", function(d) {
                        if(d.name.indexOf("'") == -1)
                            return 'white';
                        else
                            return "#4e4e4e";
                    })
                    .attr("dy", "0.3em")
                    .attr('text-anchor', 'middle')
                    .text(function(d) { return d.name; })

                //add link texts
                svg.selectAll('.link-text')
                    .data(links)
                    .enter().append("svg:text")
                        .attr('class', function(d) {
                            return 'link-text ' + encode_special_chars(d.target.name);
                        })
                        .attr("y", function(d, i) {
                            var vertical_adjust = (i % 2 == 0) ? -5 : 12;
                            return (d.source.x + d.target.x) / 2 + vertical_adjust;
                        })
                        .attr("x", function(d, i) { 
                            return (d.source.y + d.target.y) / 2;
                        })
                        .attr('text-anchor', 'middle')
                        .text(function(d, i) {
                            return (i % 2 == 0) ? "1" : "0";
                        })
                        .on("click", function(d, i) {
                            //highlight links on click
                            if(d3.select(this).classed('active')) {
                                d3.select(this)
                                    .classed('active', false);
                                    
                                d3.select('.link.' + encode_special_chars(d.target.name))
                                    .classed('active', false);
                            }
                            else {
                                d3.select(this)
                                    .classed('active', true);
                                    
                                d3.select('.link.' + encode_special_chars(d.target.name))
                                    .classed('active', true);
                            }
                        })
        });
    }

    function encode_special_chars(str) {
        return str.replace(/'/g, "-prime");
    }

    function datafyMeBro(upto) {
        var data_log = [];
        for (var n = 2; n <= upto; n++) {
            var operations = Math.log(n);
            data_log.push({'n': n, 'operations': operations});
        }
        
        var data_linear = [];
        for (var n = 2; n <= upto; n++) {
            var operations = n;
            data_linear.push({'n': n, 'operations': operations});
        }
        
        var data_nlogn = [];
        for (var n = 2; n <= upto; n++) {
            var operations = Math.log(n) * n;
            data_nlogn.push({'n': n, 'operations': operations});
        }
        
        var data_quad = [];
        for (var n = 2; n <= upto; n++) {
            var operations = Math.pow(n, 2);
            data_quad.push({'n': n, 'operations': operations});
        }
        
        return [data_log, data_linear, data_nlogn, data_quad];
    }
});
