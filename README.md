# Kony PayPal REST API PoC

This is a brief Proof of Concept on how Kony can integrate with [PayPal's REST API](https://developer.paypal.com/docs/api/overview/) to accept payments on mobile applications. The app only has two functionalities. It can get a new Access Token for authorizing transactions or it can do a full payment cycle. PayPal's REST API exposes many more services than this, but this app is not meant to be a comprehensive demo. It just provides the basic structure to follow for building a full integration.

Note that you will need [PayPal sandbox accounts](https://developer.paypal.com/developer/accounts/) to test. By registering as a developer with PayPal you'll get two sandbox accounts automatically created. A merchant account -your email address with a "-facilitator" suffix- and a customer account -your email address with a "-buyer" suffix. You'll also have to register your app and get a ClientId and Secret for it. I've hardcoded mine to the PaypalServices project for simplicity, but please do replace these with your own as I may deactivate/change mine without further notice.

## Implementation Notes

1. This PoC was built using Mobile Fabric 6.5 and Kony Studio 6.5.
1. PayPal's REST API is based on JSON both for input and output. PayPal does not currently offer XML data on their REST API. if you must use XML data, have a look at their [SOAP API](https://developer.paypal.com/docs/classic/api/).
2. The application flow for authorizing a payment with PayPal's REST API requires that your app must present your user with a PayPal login and authorization form. Once authorization is granted, PayPal will yield control back to your app.
   * Note that for native Android and iOS, PayPal provides an SDK for each platform, which includes the visual components for the login and authorization forms, so the user never leaves your app.
   * Note that for a Kony cross-platform mobile app -which does not use the Android nor iOS native SDK's- the PayPal login and authorization forms will have to be provided by PayPal's website -just like it would happen for a web application. As you will see in this PoC, you'll need a browser widget in your app do this.
3. At the time of this post, the kony.net.HttpRequest() method in the Kony Network API does not support making HTTP requests with JSON payloads, which is an obstacle for a Kony mobile app to integrate with PayPal's REST API directly. Answers to some posts suggest a couple of workarounds:
   * Using FFI to build native code to send the JSON input directly to the REST API. This PoC does not use this technique.
   * Using Kony Server in the middle with a JSON connector. This PoC does make use of the Kony Server in the middle, but it does not use a JSON Connector because of the reasons exposed in item '4' below   
4. At the time of this post, Kony Server's JSON Connector only supports JSON data outputs, but it still does not support JSON data inputs. This PoC will demonstrate how to use a custom Java Service to work around this by exploring two different approaches:
   * By posting key-value pairs to the service and having the service build the data into JSON objects.
   * By "stringifying" JSON objects on the client side and posting them as key-value pairs to be again parsed into JSON by the service. This last technique leverages Google's Gson library. The catch is that when using this technique you won't be able to test your
5. By using a custom Java Service, this PoC is also able to leverage PayPal's Java SDK.
6. This PoC as it is will work on Android and iOS. It won't however work on SPA. The reason is that when rendered in a browser the BrowserWidget will simply translate into a new tab/window which is outside the applications control, so once PayPal login and authorization are complete, redirection to the app will happen on that new tab/window, causing the app to be restarted all over again. To avoid this if you want it to work on SPA, you'll have to store the SessionSrv session instance to local storage on the browser before redirecting to PayPal and deserialize it again into a SessionSrv object after returning.

## Dependencies

### Custom Java PayPal Connector

The PoC project depends on the definitions of the custom Java service defined in the [Kony PayPal PoC Services project](https://github.com/mig82/kony-paypal-poc-services). You will have to compile, jar and import this project into Kony Studio, build it and publish PaypalServices.jar to your Kony Server's lib/userlibs folder. 

**Note:** That when attempting to test your custom Java service from Kony Studio you'll get an error with a stack trace that looks like this:

    response-code: 0    details: null
    at com.paypal.base.rest.OAuthTokenCredential.generateOAuthToken(OAuthTokenCredential.java:247)
    ...
    Caused by: com.paypal.base.exception.HttpErrorException: retry fails..  check log for more information
    at com.paypal.base.HttpConnection.executeWithStream(HttpConnection.java:197)
    ...
    Caused by: javax.net.ssl.SSLHandshakeException: No appropriate protocol (protocol is disabled or cipher suites are     inappropriate)
    at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
    ...
    Caused by: javax.net.ssl.SSLHandshakeException: No appropriate protocol (protocol is disabled or cipher suites are     inappropriate)
    at sun.security.ssl.Handshaker.activate(Handshaker.java:470)
    ...

Do not worry too much about this. I suspect it has to do with security settings in the Jetty server embedded in Kony Studio and [I've posted the issue to the forum](http://community.kony.com/developer/forum/oauthtokencredential-sslhandshakeexception). So -until the question to the forum has an answer- you won't be able to test your service from Studio, but once you publish to your Kony/Tomcat Server you'll see that there it works fine.

### PayPal Java SDK

The PaypalServices project has a dependency on [PayPal's Java SDK](https://github.com/paypal/PayPal-Java-SDK). You can get the latest sources of the SDK from Github and use Maven to build the jar. For convenience I've also attached the jar I built from version 1.4.1 -which is the latest available at the time. You'll also have to add this jar to your Kony Server's lib/userlibs folder.

### Google Gson

The PaypalServices project also uses [Gson](https://github.com/google/gson) to parse any stringified JSON objects posted by the client app into java objects of a class from PayPal's Java SDK.
