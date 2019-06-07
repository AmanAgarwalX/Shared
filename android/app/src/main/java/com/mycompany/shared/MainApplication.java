package com.mycompany.shared;

import android.annotation.SuppressLint;
import android.app.Application;
import com.floatingwidget.floating.FloatingPackage;
import com.facebook.react.ReactApplication;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.devialab.detectNewPhoto.RCTDetectNewPhotoPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.dylanvann.fastimage.FastImageViewPackage;

import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import io.invertase.firebase.RNFirebasePackage;
// optional packages - add/remove as appropriate
import io.invertase.firebase.admob.RNFirebaseAdMobPackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import io.invertase.firebase.instanceid.RNFirebaseInstanceIdPackage;
import io.invertase.firebase.invites.RNFirebaseInvitesPackage;
import io.invertase.firebase.links.RNFirebaseLinksPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.perf.RNFirebasePerformancePackage;
import com.google.android.gms.ads.MobileAds;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @SuppressLint("MissingPermission")
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.asList(new MainReactPackage(), new SplashScreenReactPackage(), new VectorIconsPackage(),
          new RCTDetectNewPhotoPackage(), new FastImageViewPackage(), new RNFetchBlobPackage(),
          new RNGestureHandlerPackage(), new RNGoogleSigninPackage(), new RNFirebasePackage(), new FloatingPackage(),
          new RNFirebaseAdMobPackage(), new RNFirebaseAnalyticsPackage(), new RNFirebaseAuthPackage(),
          new RNFirebaseRemoteConfigPackage(), new RNFirebaseCrashlyticsPackage(), new RNFirebaseInstanceIdPackage(),
          new RNFirebaseInvitesPackage(), new RNFirebaseLinksPackage(), new RNFirebaseMessagingPackage(),
          new RNFirebaseNotificationsPackage(), new RNFirebasePerformancePackage());
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    MobileAds.initialize(this, "ca-app-pub-3596083360479551~2217153701");
    SoLoader.init(this, /* native exopackage */ false);
  }
}
