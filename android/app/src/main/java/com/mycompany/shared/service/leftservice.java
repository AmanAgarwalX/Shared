//imports
package com.mycompany.shared.service;

import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import javax.annotation.Nullable;

//creating the service class
public class leftservice extends HeadlessJsTaskService {
    @Nullable
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        return new HeadlessJsTaskConfig("Left", // JS function to call
                extras != null ? Arguments.fromBundle(extras) : null, 5000, true);
    }
}