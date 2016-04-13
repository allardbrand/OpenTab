/*global logger*/
/*
    OpenTabContext
    ========================

    @file      : OpenTabContext.js
    @version   : 1.0.0
    @author    : Allard Brand
    @date      : 2016-04-13
    @copyright : FlowFabric (c) 2016
    @license   : Apache 2

    Documentation
    ========================
    Automatically open a tab within a tab container based on the tab name or a microflow.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "dojo/NodeList-traverse"
], function(declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, dojoNodelist) {
    "use strict";

    // Declare widget's prototype.
    return declare("OpenTab.widget.OpenTabContext", [ _WidgetBase ], {

        // Parameters configured in the Modeler.
        mfDataSource: "",
        datasource: "",
        tabName: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
            // Uncomment the following line to enable debug messages
            //logger.level(logger.DEBUG);
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering();

            callback();
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function() {
          logger.debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function() {
          logger.debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function(box) {
          logger.debug(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
          logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function(e) {
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Attach events to HTML dom elements
        _setupEvents: function() {
            logger.debug(this.id + "._setupEvents");
        },

        // Rerender the interface.
        _updateRendering: function() {
            logger.debug(this.id + "._updateRendering");

            // Find surrounding tab container
            var tabContainer = this.domNode.closest('.mx-tabcontainer');

            if (tabContainer != null) {
                logger.debug(this.id + ": surrounding tab container: " + tabContainer.id);
                logger.debug(this.id + ": datasource: " + this.datasource);

                if (this.datasource == "microflow" && this.mfDataSource !== "") {
                    if (this._contextObj) {
                        // Use microflow as datasource
                        mx.data.action({
                            params: {
                                applyto: "selection",
                                actionname: this.mfDataSource,
                                guids: [ this._contextObj.getGuid() ]
                            },
                            callback: dojoLang.hitch(this, function(result) {
                                if (result !== "") {
                                    logger.debug(this.id + ": received " + result + " from microflow");
                                    this._openTab(result, tabContainer);
                                } else {
                                    logger.debug(this.id + ": received invalid tab name from microflow");
                                }
                            }),
                            error: dojoLang.hitch(this, function(error) {
                                console.log(this.id + ": An error occurred while executing microflow: " + error.description);
                            })
                        }, this);
                    }
                } else {
                    if (this.tabName !== "") {
                        // Open tab using the provided tab name
                        this._openTab(this.tabName, tabContainer)
                    } else {
                        logger.debug(this.id + ": no valid tab name provided")
                    }
                }
            } else {
                logger.debug(this.id + ": no surrounding tab container found");
            }

            // Important to clear all validations!
            this._clearValidations();
        },

        _openTab: function(tabName, tabContainer) {
            // Find the specified tab
            var dojoQuery = dojo.query('.mx-name-' + tabName, tabContainer);
            logger.debug(this.id + ": " + dojoQuery.length + " result(s)");

            // If found, open the tab
            if (dojoQuery.length >= 1) {
                logger.debug(this.id + ": open tab ");
                dojoQuery[dojoQuery.length - 1].click();
            }
        },

        // Handle validations.
        _handleValidation: function(validations) {
            logger.debug(this.id + "._handleValidation");
            this._clearValidations();
        },

        // Clear validations.
        _clearValidations: function() {
            logger.debug(this.id + "._clearValidations");
            dojoConstruct.destroy(this._alertDiv);
            this._alertDiv = null;
        },

        // Show an error message.
        _showError: function(message) {
            logger.debug(this.id + "._showError");
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return true;
            }
            this._alertDiv = dojoConstruct.create("div", {
                "class": "alert alert-danger",
                "innerHTML": message
            });
            dojoConstruct.place(this.domNode, this._alertDiv);
        },

        // Add a validation.
        _addValidation: function(message) {
            logger.debug(this.id + "._addValidation");
            this._showError(message);
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            if (this._handles) {
                dojoArray.forEach(this._handles, function (handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                var objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });

                var validationHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: dojoLang.hitch(this, this._handleValidation)
                });

                this._handles = [ objectHandle, validationHandle ];
            }
        }
    });
});

require(["OpenTab/widget/OpenTabContext"], function() {
    "use strict";
});
