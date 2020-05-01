var apexchartjs = (function () {
    "use strict";
    var scriptVersion = "1.0";
    var util = {
        version: "1.2.9",
        isAPEX: function () {
            if (typeof (apex) !== 'undefined') {
                return true;
            } else {
                return false;
            }
        },
        debug: {
            info: function (str) {
                if (util.isAPEX()) {
                    apex.debug.info(str);
                }
            },
            error: function (str) {
                if (util.isAPEX()) {
                    apex.debug.error(str);
                } else {
                    console.error(str);
                }
            }
        },
        escapeHTML: function (str) {
            if (str === null) {
                return null;
            }
            if (typeof str === "undefined") {
                return;
            }
            if (typeof str === "object") {
                try {
                    str = JSON.stringify(str);
                } catch (e) {
                    /*do nothing */
                }
            }
            if (util.isAPEX()) {
                return apex.util.escapeHTML(String(str));
            } else {
                str = String(str);
                return str
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#x27;")
                    .replace(/\//g, "&#x2F;");
            }
        },
        loader: {
            start: function (id, setMinHeight) {
                if (setMinHeight) {
                    $(id).css("min-height", "100px");
                }
                if (util.isAPEX()) {
                    apex.util.showSpinner($(id));
                } else {
                    /* define loader */
                    var faLoader = $("<span></span>");
                    faLoader.attr("id", "loader" + id);
                    faLoader.addClass("ct-loader");
                    faLoader.css("text-align", "center");
                    faLoader.css("width", "100%");
                    faLoader.css("display", "block");

                    /* define refresh icon with animation */
                    var faRefresh = $("<i></i>");
                    faRefresh.addClass("fa fa-refresh fa-2x fa-anim-spin");
                    faRefresh.css("background", "rgba(121,121,121,0.6)");
                    faRefresh.css("border-radius", "100%");
                    faRefresh.css("padding", "15px");
                    faRefresh.css("color", "white");

                    /* append loader */
                    faLoader.append(faRefresh);
                    $(id).append(faLoader);
                }
            },
            stop: function (id, removeMinHeight) {
                if (removeMinHeight) {
                    $(id).css("min-height", "");
                }
                $(id + " > .u-Processing").remove();
                $(id + " > .ct-loader").remove();
            }
        },
        noDataMessage: {
            show: function (id, text) {
                var div = $("<div></div>")
                    .css("margin", "12px")
                    .css("text-align", "center")
                    .css("padding", "64px 0")
                    .addClass("nodatafoundmessage");

                var subDiv = $("<div></div>");

                var subDivSpan = $("<span></span>")
                    .addClass("fa")
                    .addClass("fa-search")
                    .addClass("fa-2x")
                    .css("height", "32px")
                    .css("width", "32px")
                    .css("color", "#D0D0D0")
                    .css("margin-bottom", "16px");

                subDiv.append(subDivSpan);

                var span = $("<span></span>")
                    .text(text)
                    .css("display", "block")
                    .css("color", "#707070")
                    .css("font-size", "12px");

                div
                    .append(subDiv)
                    .append(span);

                $(id).append(div);
            },
            hide: function (id) {
                $(id).children('.nodatafoundmessage').remove();
            }
        }
    };

    /************************************************************************
     **
     ** Used to render the chart
     **
     ***********************************************************************/
    function renderChart(pData, pOptions) {
        util.debug.info({
            "module": "renderChart",
            "pData": pData,
            "pOptions": pOptions
        });

        if (pData) {
            if (pData.length > 0) {
                var chartOptions = {
                    "chart": {
                        "type": pOptions.chartType,
                        "height": pOptions.chartHeight
                    },
                    "series": [{
                        "name": "Data",
                        "data": pData
                    }]
                };

                var chartRegion = document.querySelector(pOptions.regionSel);
                var chart = new ApexCharts(chartRegion, chartOptions);
                chart.render();

                /* add chart data below chart when set */
                if (pOptions.showChartData === "Y") {
                    var div = $("<div></div>");

                    var b = $("<b></b>");

                    /* don't forget to escape when required use $.text, util.escapeHTML or apex.util.escapeHTML */
                    if (pOptions.escapeHTML !== false) {
                        b.text(pOptions.chartDataLabel);
                    } else {
                        b.html(pOptions.chartDataLabel);
                    }

                    b.append(": ");

                    var span = $("<span></span>");
                    span.text(JSON.stringify(pData));

                    div.append(b);
                    div.append(span);

                    $(pOptions.regionSel).append(div);
                }
            } else {
                util.noDataMessage.show(pOptions.regionSel, pOptions.noDataMessage);
            }
        } else {
            util.noDataMessage.show(pOptions.regionSel, pOptions.errMsg);
            util.debug.error("pData is unedefined");
        }

        /* remove loading icon */
        util.loader.stop(pOptions.parRegionSel);
    }

    return {
        render: function (pRegionID, pRefreshID, pAjaxID, pNoDataFoundMessage, pItems2Submit, pEscapeRequired, pChartHeight, pChartType, pShowChartData, pChartDataLabel) {
            /* print all params for debug */
            util.debug.info({
                "pRegionID": pRegionID,
                "pRefreshID": pRefreshID,
                "pAjaxID": pAjaxID,
                "pNoDataFoundMessage": pNoDataFoundMessage,
                "pItems2Submit": pItems2Submit,
                "pEscapeRequired": pEscapeRequired,
                "pChartHeight": pChartHeight,
                "pChartType": pChartType,
                "pShowChartData": pShowChartData,
                "pChartDataLabel": pChartDataLabel
            });

            /* create options json with all params */
            var options = {
                "errMsg": "Error occured", // maybe you could make this as plugin attribute with translation
                "regionSel": "#" + pRegionID,
                "parRegionSel": "#" + pRefreshID,
                "noDataMessage": pNoDataFoundMessage,
                "escapeHTML": pEscapeRequired,
                "chartHeight": pChartHeight,
                "chartType": pChartType,
                "showChartData": pShowChartData,
                "chartDataLabel": pChartDataLabel,
                "items2Submit": pItems2Submit
            };


            /************************************************************************
             **
             ** Used to get data from APEX
             **
             ***********************************************************************/
            function getData() {

                /* cleanup */
                $(options.regionSel).empty();
                $(options.regionSel).css("min-height", "120px");

                /* add loading icon */
                util.loader.start(options.parRegionSel);

                /* make ajax coall to ajax function in Plug-in */
                try {
                    apex.server.plugin(
                        pAjaxID, {
                            pageItems: options.items2Submit
                        }, {
                            success: function (pData) {
                                renderChart(pData, options);
                            },
                            error: function (d) {
                                util.noDataMessage.show(options.regionSel, options.errMsg);
                                util.debug.error({
                                    "msg": d.responseText,
                                    "err": d
                                });
                            },
                            dataType: "json"
                        });
                } catch (e) {
                    util.noDataMessage.show(options.regionSel, options.errMsg);
                    util.debug.error({
                        "msg": "Error while try to get Data from APEX",
                        "err": e
                    });
                }

            }

            // load data
            getData();

            /************************************************************************
             **
             ** Used to bind APEx Refresh event (DA's)
             **
             ***********************************************************************/
            try {
                apex.jQuery(options.parRegionSel).bind("apexrefresh", function () {
                    getData();
                });
            } catch (e) {
                util.noDataMessage.show(options.regionSel, options.errMsg);
                util.debug.error({
                    "msg": "Error while try to bind APEX refresh event",
                    "err": e
                });
            }
        }
    }
})();
