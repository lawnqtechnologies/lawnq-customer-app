package com.lawnqapp

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
    object : DefaultReactNativeHost(this) {

      // Try to use PackageList if it exists; otherwise fall back to an empty list.
      override fun getPackages(): List<ReactPackage> {
        return try {
          val cls = Class.forName("com.facebook.react.PackageList")
          val ctor = cls.getConstructor(ReactNativeHost::class.java)
          val instance = ctor.newInstance(this)
          val method = cls.getMethod("getPackages")
          @Suppress("UNCHECKED_CAST")
          method.invoke(instance) as List<ReactPackage>
        } catch (_: Throwable) {
          emptyList()
        }
      }

      override fun getJSMainModuleName() = "index"
      override fun getUseDeveloperSupport() = BuildConfig.DEBUG

      override val isNewArchEnabled = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      override val isHermesEnabled = BuildConfig.IS_HERMES_ENABLED
    }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}
