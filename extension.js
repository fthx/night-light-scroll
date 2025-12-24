//    Night Light Scroll
//    GNOME Shell extension
//    @fthx 2025


import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';


const MIN_TEMPERATURE = 1700; // K
const MAX_TEMPERATURE = 4700; // K
const TEMPERATURE_STEP = 200; // K

const NightLightScroll = GObject.registerClass(
    class NightLightScroll extends GObject.Object {
        _init() {
            super._init();

            this._colorSchema = new Gio.Settings({ schema_id: 'org.gnome.settings-daemon.plugins.color' })

            this._quickSettings = Main.panel.statusArea.quickSettings;
            this._quickSettings._indicators.connectObject('notify::allocation', () => this._setIndicator(), this);
        }

        _setIndicator() {
            this._indicator = this._quickSettings._nightLight;
            this._indicator?.connectObject('scroll-event', (actor, event) => this._onScroll(event), this);
        }

        _onScroll(event) {
            let newTemperature = this._colorSchema.get_uint('night-light-temperature');

            switch (event?.get_scroll_direction()) {
                case Clutter.ScrollDirection.UP:
                    newTemperature = Math.min(MAX_TEMPERATURE, newTemperature + TEMPERATURE_STEP);
                    this._colorSchema.set_uint('night-light-temperature', newTemperature);
                    return Clutter.EVENT_STOP;
                    break;
                case Clutter.ScrollDirection.DOWN:
                    newTemperature = Math.max(MIN_TEMPERATURE, newTemperature - TEMPERATURE_STEP);
                    this._colorSchema.set_uint('night-light-temperature', newTemperature);
                    return Clutter.EVENT_STOP;
                    break;
            }

            return Clutter.EVENT_PROPAGATE;
        }

        destroy() {
            this._colorSchema = null;

            this._quickSettings._indicators.disconnectObject(this);
            this._quickSettings = null;

            this._indicator?.disconnectObject(this);
            this._indicator = null;
        }
    });

export default class PowerProfileIndicatorExtension {
    enable() {
        this._nightLightScroll = new NightLightScroll();
    }

    disable() {
        this._nightLightScroll?.destroy();
        this._nightLightScroll = null;
    }
}
