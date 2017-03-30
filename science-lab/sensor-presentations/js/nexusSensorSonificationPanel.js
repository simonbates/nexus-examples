(function () {
    "use strict";

    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.nexusSensorSonificationPanel.sensorSonifierDisplay", {
        gradeNames: ["fluid.viewComponent"],
        events: {
            displayTemplateReady: null
        },
        selectors: {
            sensorNameDisplay: ".nexusc-sensorNameDisplay",
            midpointToneControl: ".nexusc-midpointToneControl",
            muteControl: ".nexusc-sensorMuteControl"
        },
        strings: {
            template: "<h2 class=\"nexusc-sensorNameDisplay\"></h2><form class=\"nexus-sensorSonifierControls\"><span class=\"nexus-sensorSonifierControls-checkboxContainer\"><label>Play Midpoint<input class=\"nexusc-midpointToneControl\" type=\"checkbox\"/><i></i></label></span><br/><span class=\"nexus-sensorSonifierControls-checkboxContainer\"><label>Mute Sensor<input class=\"nexusc-sensorMuteControl\" type=\"checkbox\"/><i></i></label></span> </form>"
        },
        listeners: {
            "onCreate.appendDisplayTemplate": {
                "this": "{that}.container",
                "method": "html",
                "args": "{that}.options.strings.template"
            },
            "onCreate.fireDisplayTemplateReady": {
                func: "{that}.events.displayTemplateReady.fire"
            },
            "onCreate.bindSynthControls": {
                func: "gpii.sensorPlayer.sensorDisplayDebug.bindSynthControls",
                args: ["{that}", "{sensorSynthesizer}"]
            }
        },
        components: {
            sensorNameDisplay: {
                createOnEvent: "{sensorSonifierDisplay}.events.displayTemplateReady",
                type: "gpii.sensorPlayer.valueDisplay",
                container: "{sensorSonifierDisplay}.dom.sensorNameDisplay",
                options: {
                    model: {
                        value: "{sensor}.model.description"
                    },
                    strings: {
                        template: "<span class=\"flc-valueDisplay-value\"></span>"
                    }
                }
            }
        }
    });
    
    // Sonification presentation panel
    fluid.defaults("gpii.nexusSensorSonificationPanel", {
        gradeNames: ["gpii.nexusSensorPresentationPanel"],
        dynamicComponents: {
            sensorPresenter: {
                type: "gpii.sensorPlayer",
                createOnEvent: "onSensorAppearance",
                options: "@expand:gpii.nexusSensorSonificationPanel.getSensorPresenterOptions({arguments}.0)"
            }
        }
    });

    // expander function; used to generate sensor sonifiers as sensors
    // are attached; dynamically configures model characteristics and
    // container for display / controls based on the sensorId
    gpii.nexusSensorSonificationPanel.getSensorPresenterOptions = function (sensorId) {

        var sensorModel = {
            sensorId: sensorId,
            description: "{nexusSensorSonificationPanel}.model.sensors." + sensorId + ".name",
            simulateChanges: false,
            sensorValue: "{nexusSensorSonificationPanel}.model.sensors." + sensorId + ".value",
            sensorMax: "{nexusSensorSonificationPanel}.model.sensors." + sensorId + ".rangeMax",
            sensorMin: "{nexusSensorSonificationPanel}.model.sensors." + sensorId + ".rangeMin"
        };

        var sensorContainerClass = "nexus-nexusSensorSonificationPanel-sensorDisplay-" + sensorId;

        var sensorPlayerOptions =
        {
            events: {
                onSensorDisplayContainerAppended: null
            },
            listeners: {
                "{nexusSensorSonificationPanel}.events.onSensorRemoval": {
                   funcName: "gpii.nexusSensorSonificationPanel.checkForRemoval",
                   args: ["{that}", "{that}.sensor", "{arguments}.0"],
                   namespace: "removeSensorPlayer-"+sensorId
               },
               "onCreate.appendSensorDisplayContainer": {
                   "this": "{nexusSensorSonificationPanel}.container",
                   "method": "append",
                   "args": ["<div class='nexus-nexusSensorSonificationPanel-sensorDisplay " + sensorContainerClass + "'></div>"]
               },
               "onCreate.fireOnSensorDisplayContainerAppended": {
                   funcName: "{that}.events.onSensorDisplayContainerAppended.fire",
                   priority: "after:appendSensorDisplayContainer"
               },
               "onDestroy.removeSensorDisplayContainer": {
                   funcName: "gpii.nexusSensorSonificationPanel.removeSensorDisplayContainer",
                   args: ["{nexusSensorSonificationPanel}", sensorContainerClass]
               }
           },
            components: {
                sensor: {
                    options: {
                        model: sensorModel
                    }
                },
                sensorSonifierDisplay: {
                    type: "gpii.nexusSensorSonificationPanel.sensorSonifierDisplay",
                    container: "." + sensorContainerClass,
                    createOnEvent: "{sensorPlayer}.events.onSensorDisplayContainerAppended",
                    options: {
                        listeners: {
                            // Start hidden
                           "onCreate.hideContainer": {
                               "this": "{nexusSensorSonificationPanel}.container",
                               "method": "hide",
                               "args": [0]
                           },
                           // Fade in
                           "onCreate.fadeInContainer": {
                               "this": "{nexusSensorSonificationPanel}.container",
                               "method": "fadeIn"
                           }
                        }
                    }
                }
            }
        };
        return sensorPlayerOptions;
    };

    // Function used by a sensorPlayer to check the array of
    // removed sensor IDs and invoke its own destroy function
    // if it matches a removed sensor ID
    gpii.nexusSensorSonificationPanel.checkForRemoval = function (sensorPlayer, sensor, removedSensorIds) {
        console.log("gpii.nexusSensorSonificationPanel.checkForRemoval");
        console.log(sensorPlayer, sensor, removedSensorIds);
        console.log(sensorPlayer);
        if(fluid.contains(removedSensorIds,fluid.get(sensor.model, "sensorId"))) {
            console.log("this sensorPlayer should be removed");
            sensorPlayer.destroy();
            console.log(sensorPlayer);
        }
    };

    // Function used by the sensorSonificationPanel to remove
    // dynamically generated container markup when a sensor is
    // removed
    gpii.nexusSensorSonificationPanel.removeSensorDisplayContainer = function (nexusSensorSonificationPanel, sensorContainerClass) {
        console.log(nexusSensorSonificationPanel, sensorContainerClass);
        var removedSensorContainer = nexusSensorSonificationPanel.container.find("." + sensorContainerClass);
        console.log(removedSensorContainer);
        removedSensorContainer.fadeOut(function() {
            removedSensorContainer.remove();
        });
    };

}());