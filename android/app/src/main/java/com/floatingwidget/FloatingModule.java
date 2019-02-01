package com.floatingwidget.floating;

import android.content.Intent;

import com.mycompany.shared.service.onoffservice;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.support.annotation.Nullable;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.support.v4.content.ContextCompat;
import com.mycompany.shared.R;
import com.facebook.react.HeadlessJsTaskService;
import com.cleveroad.audiowidget.AudioWidget;

public class FloatingModule extends ReactContextBaseJavaModule {
    private static final String TAG = "Floating";
    private final ReactApplicationContext reactContext;
    public AudioWidget widget;
    public boolean isPlaying = false;

    public FloatingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @ReactMethod
    public void initiate() {
        widget = new AudioWidget.Builder(reactContext)
                .playlistDrawable(reactContext.getResources().getDrawable(R.drawable.aw_ic_play))
                .defaultAlbumDrawable(reactContext.getResources().getDrawable(R.drawable.aw_ic_play)).build();
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void show() {

        // if(!widget.isShown()){

        // validate options

        widget.show(100, 100); // Top Left Corner

        // media buttons' click listener
        widget.controller().onControlsClickListener(new AudioWidget.OnControlsClickListener() {

            @Override
            public boolean onPlaylistClicked() {
                // playlist icon clicked
                // return false to collapse widget, true to stay in expanded state
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "onPlaylistClicked", params);
                return true;
            }

            @Override
            public void onPreviousClicked() {
                // previous track button clicked
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "onPreviousClicked", params);
            }

            Intent myIntent = new Intent(reactContext.getApplicationContext(), onoffservice.class);

            @Override
            public boolean onPlayPauseClicked() {
                // return true to change playback state of widget and play button click
                // animation (in collapsed state)
                reactContext.getApplicationContext().startService(myIntent);
                HeadlessJsTaskService.acquireWakeLockNow(reactContext.getApplicationContext());
                WritableMap params = Arguments.createMap();
                // Log.i("isPlaying", Boolean.toString(isPlaying));
                if (!isPlaying) {
                    isPlaying = true;
                    params.putBoolean("isPlaying", isPlaying);
                    sendEvent(reactContext, "onPlayPauseClicked", params);
                } else {
                    isPlaying = false;
                    params.putBoolean("isPlaying", isPlaying);
                    sendEvent(reactContext, "onPlayPauseClicked", params);
                }

                return false;
            }

            @Override
            public void onNextClicked() {
                // next track button clicked
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "onNextClicked", params);
            }

            @Override
            public void onAlbumClicked() {
                // album cover clicked
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "onAlbumClicked", params);
            }

            @Override
            public void onPlaylistLongClicked() {
                // playlist button long clicked
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "onPlayListLongClicked", params);
            }

            @Override
            public void onPreviousLongClicked() {
                // previous track button long clicked
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "onPreviousLongClicked", params);
            }

            @Override
            public void onPlayPauseLongClicked() {
                // play/pause button long clicked
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "onPlayPauseClicked", params);
            }

            @Override
            public void onNextLongClicked() {
                // next track button long clicked
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "onNextLongClicked", params);
            }

            @Override
            public void onAlbumLongClicked() {
                // album cover long clicked
                WritableMap params = Arguments.createMap();
                sendEvent(reactContext, "onAlbumLongClicked", params);
            }

        });

    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }
}